import { useState, useEffect, useCallback, useMemo } from "react";
import {
  getOrganogramDetails,
  getOrganogramLocations,
  getHrDivision,
  //getOrganogramGeoLocations,
  //getOrganogramEmployees,
  getGeoMappingOptions,
  getOrgLocReportingManager,
  saveOrganogramLocation,

} from "../services/orgonogramService";
import { notifyError, notifySuccess } from "../../../services/alertService";
//import { formatDate } from "./locationsColumns";

// const mapToOptions = (list = [], labelKey = "LABEL", valueKey = "ID") =>
//   Array.isArray(list)
//     ? list.map((item) => ({ label: item[labelKey] ?? "", value: item[valueKey] }))
//     : [];


// Builds a GEO_ID -> DIVSN_DESC map by fetching each unique division once.
// Only called when EMP_LEVEL === '15' (matches the PHP condition).
const fetchDivisionMap = async (savedRows = []) => {
  const uniqueGeoIds = [...new Set(savedRows.map((r) => r.GEO_ID).filter(Boolean))];
  if (!uniqueGeoIds.length) return {};

  const results = await Promise.all(
    uniqueGeoIds.map((divsnId) =>
      getHrDivision({ GEO_ID: divsnId }).catch((error) => {
        console.error("Load division error:", divsnId, error);
        return null;
      })
    )
  );

  const map = {};
  uniqueGeoIds.forEach((divsnId, idx) => {
    // data is a single flat object now, not an array — read DIVSN_DESC directly
    map[divsnId] = results[idx]?.data?.DIVSN_DESC ?? "";
  });
  return map;
};



/* ==========================================================
    GEO MAPPING OPTIONS (EMP_LEVEL != 15)
    Dedupe by DIVSN_ID + FROM_DATE, since EMP_LEVEL is constant
    for the whole organogram but the date-range filter means two
    rows with different FROM_DATE can return different options.
========================================================== */
const buildGeoMappingCacheKey = (divsnId, effecFrom) => `${divsnId}::${effecFrom}`;

const fetchGeoMappingOptionsMap = async (empLevel, savedRows = []) => {
  const uniqueCombos = new Map();
  savedRows.forEach((row) => {
    if (!row.GEO_ID) return; // DIVSN_ID for the query comes from organogramDetails, not per-row
    const key = buildGeoMappingCacheKey(row.__divsnId, row.EFFEC_FROM);
    if (!uniqueCombos.has(key)) {
      uniqueCombos.set(key, { DIVSN_ID: row.__divsnId, EFFEC_FROM: row.EFFEC_FROM });
    }
  });
  
  const entries = Array.from(uniqueCombos.entries());
  const results = await Promise.all(
    entries.map(([, params]) =>
      getGeoMappingOptions({ EMP_LEVEL: empLevel, ...params }).catch((error) => {
        console.error("Load geo mapping options error:", params, error);
        return null;
      })
    )
  );

  const map = {};
  entries.forEach(([key], idx) => {
    const rows = Array.isArray(results[idx]?.data) ? results[idx].data : [];
    map[key] = rows.map((r) => ({
      label: r.GEO_DETAILS ?? "",
      value: r.GEO_ID,
    }));
  });
  return map;
};

/* ==========================================================
    REPORTING MANAGER
    One call per LOC_ID (can't dedupe — each row has its own
    reporting chain), returns the composed display string plus
    a flag for whether an active reporting record exists.
========================================================== */
const fetchReportingMap = async (savedRows = []) => {
  const rowsWithLocId = savedRows.filter((r) => r.ID);
  if (!rowsWithLocId.length) return {};

  const results = await Promise.all(
    rowsWithLocId.map((row) =>
      getOrgLocReportingManager({
        LOC_ID: row.ID,
        EMP_CODE: row.EMP_CODE,
        EFFEC_FROM: row.EFFEC_FROM,
      }).catch((error) => {
        console.error("Load reporting manager error:", row.ID, error);
        return null;
      })
    )
  );

  const map = {};
  rowsWithLocId.forEach((row, idx) => {
    const data = results[idx]?.data;
    map[row.ID] = {
      // Expected composed fields — adjust keys once you confirm the
      // real response shape:
      REPORT_TO_DISPLAY: data
        ? `${data.PARENT_ORGID ?? ""} - ${data.DESIGNATION ?? ""} - ${data.MGR_NAME ?? ""} - ${data.MGR_CODE ?? ""}`
        : "",
      HAS_REPORTING: !!data?.REPORTING_ID,
    };
  });
  return map;
};

/**
 * Positional mapping: getOrganogramLocations returns rows in the same
 * order as the position slots (no SNO/index field in the payload), so
 * savedRows[i] corresponds to position slot i+1.
 */
const buildLocationRows = (posiCount, savedRows = [], divisionMap = {}, reportingMap = {}, divsnId = null) => {
  const rows = [];
  for (let i = 0; i < posiCount; i += 1) {
    const saved = savedRows[i] || {};
    const reporting = reportingMap[saved.ID] || {};
    rows.push({
      SNO: i + 1,
      LOC_ID: saved.ID ?? null,
      GEODESC: saved.GEODESC ?? "",
      DIVSN_DESC: divisionMap[saved.GEO_ID] ?? "",
      LOC_LABEL: saved.LOC_LABEL ?? "",
      GEO_ID: saved.GEO_ID ?? "",
      EFFEC_FROM_RAW: saved.EFFEC_FROM ?? "", // kept for geo-mapping cache key lookups
      GEO_MAPPING_LABEL: "",
      __divsnId: divsnId,
      FROM_DATE: saved.EFFEC_FROM ?? "",
      TO_DATE: "",
      NM: saved.NM ?? "",
      EMP_CODE: saved.EMP_CODE ?? "",
      REPORT_TO_DISPLAY: reporting.REPORT_TO_DISPLAY ?? "",
      HAS_REPORTING: !!reporting.HAS_REPORTING,
      ALLOW_ID: saved.ALLOW_ID ?? null,
    });
  }
  return rows;
};

// Dedupe savedRows into {label, value} option lists, keyed off the
// same fields present in getOrganogramLocations — no separate lookup
// API needed since GEODESC/GEO_ID and NM/EMP_CODE already come back
// on every row.
const deriveGeoLocationOptions = (savedRows = []) => {
  const seen = new Map();
  savedRows.forEach((row) => {
    if (row.GEO_ID && !seen.has(row.GEO_ID)) {
      seen.set(row.GEO_ID, { label: row.GEODESC ?? "", value: row.GEO_ID });
    }
  });
  return Array.from(seen.values());
};

const deriveEmployeeOptions = (savedRows = []) => {
  const seen = new Map();
  savedRows.forEach((row) => {
    if (row.EMP_CODE && !seen.has(row.EMP_CODE)) {
      seen.set(row.EMP_CODE, { label: row.NM ?? "", value: row.EMP_CODE });
    }
  });
  return Array.from(seen.values());
};

const useLocationsTabHandler = (organogramId) => {
  const [organogramDetails, setOrganogramDetails] = useState(null);
  const [locations, setLocations] = useState([]);
  const [rawLocationRows, setRawLocationRows] = useState([]); // source for derived options
  const [geoMappingOptionsMap, setGeoMappingOptionsMap] = useState({});
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [savingRow, setSavingRow] = useState(false);

  // Derived from the same getOrganogramLocations payload — no extra API calls
  const geoLocationOptions = useMemo(
    () => deriveGeoLocationOptions(rawLocationRows),
    [rawLocationRows]
  );
  const employeeOptions = useMemo(
    () => deriveEmployeeOptions(rawLocationRows),
    [rawLocationRows]
  );

  /* ==========================================================
    WIRE INTO THE MAIN LOAD EFFECT
  ========================================================== */

  useEffect(() => {
    if (!organogramId) {
      setOrganogramDetails(null);
      setLocations([]);
      setRawLocationRows([]);
      setGeoMappingOptionsMap({});
      
      return;
    }

    const loadDetailsAndLocations = async () => {
      try {
      setLoadingDetails(true);
      setLoadingLocations(true);

      const detailsRes = await getOrganogramDetails({ ID: organogramId });
      if (!detailsRes?.status) {
        notifyError(detailsRes?.message || "Unable to load organogram details.");
        return;
      }
      setOrganogramDetails(detailsRes.data);

      const posiCount = Number(detailsRes.data?.POSI_COUNT) || 0;
      const empLevel = detailsRes.data?.EMP_LEVEL;
      const divsnId = detailsRes.data?.DIVSN_ID;

      const locationsRes = await getOrganogramLocations({ ID: organogramId });
      const savedRows = Array.isArray(locationsRes)
        ? locationsRes
        : Array.isArray(locationsRes?.data)
          ? locationsRes.data
          : [];

      setRawLocationRows(savedRows);

      // Tag each row with the organogram's DIVSN_ID so the geo-mapping
      // cache key can be built without threading organogramDetails
      // through every callback.
      const savedRowsWithDivsn = savedRows.map((r) => ({ ...r, __divsnId: divsnId }));

      const [divisionMap, geoMappingMap, reportingMap] = await Promise.all([
        empLevel === "15" ? fetchDivisionMap(savedRows) : Promise.resolve({}),
        empLevel !== "15" ? fetchGeoMappingOptionsMap(empLevel, savedRowsWithDivsn) : Promise.resolve({}),
        fetchReportingMap(savedRows),
      ]);

      setGeoMappingOptionsMap(geoMappingMap);
      setLocations(buildLocationRows(posiCount, savedRows, divisionMap, reportingMap, divsnId));
    } catch (error) {
      console.error("Load location details error:", error);
      notifyError(error?.message || "Unable to load location details.");
    } finally {
      setLoadingDetails(false);
      setLoadingLocations(false);
    }
  };

  loadDetailsAndLocations();
}, [organogramId]);

  const handleRowEditComplete = useCallback(async (e) => {
    const { newData, index } = e;
    setLocations((prev) => {
      const next = [...prev];
      next[index] = newData;
      return next;
    });

    try {
      setSavingRow(true);
      const payload = {
        ID: newData.LOC_ID,
        ORGANOGRAM_ID: organogramId,
        GEO_ID: newData.GEO_ID,
        EFFEC_FROM: newData.FROM_DATE,
        EFFEC_TO: newData.TO_DATE,
      };
      const res = await saveOrganogramLocation(payload);
      if (res?.status) {
        notifySuccess(res?.message || "Location saved.");
      } else {
        notifyError(res?.message || "Unable to save location.");
      }
    } catch (error) {
      console.error("Save location row error:", error);
      notifyError(error?.message || "Unable to save location.");
    } finally {
      setSavingRow(false);
    }
  }, [organogramId]);

  const getGeoMappingOptionsForRow = useCallback(
  (row) => {
    if (organogramDetails?.EMP_LEVEL === "15") {
      // EMP_LEVEL 15 reuses the single division as its own "option"
      return divisionOptionsForLevel15; // or reuse geoLocationOptions if you prefer a 1-item list
    }
    const key = buildGeoMappingCacheKey(row.__divsnId, row.EFFEC_FROM_RAW);
    return geoMappingOptionsMap[key] || [];
  },
  [organogramDetails, geoMappingOptionsMap]
);

  return {
    organogramDetails,
    locations,
    geoLocationOptions,
    employeeOptions,
    loadingDetails,
    loadingLocations,
    savingRow,
    handleRowEditComplete,
  };
};

export default useLocationsTabHandler;