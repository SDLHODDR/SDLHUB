import { useState, useEffect, useCallback, useMemo } from "react";
import {
  getOrganogramDetails,
  getOrganogramLocations,
  getHrDivision,
  //getOrganogramGeoLocations,
  //getOrganogramEmployees,
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

/**
 * Positional mapping: getOrganogramLocations returns rows in the same
 * order as the position slots (no SNO/index field in the payload), so
 * savedRows[i] corresponds to position slot i+1.
 */
const buildLocationRows = (posiCount, savedRows = [], divisionMap = {}) => {
  const rows = [];
  for (let i = 0; i < posiCount; i += 1) {
    const saved = savedRows[i] || {};
    rows.push({
      SNO: i + 1,
      LOC_ID: saved.ID ?? null,
      GEODESC: saved.GEODESC ?? "",
      DIVSN_DESC: divisionMap[saved.GEO_ID] ?? "",
      LOC_LABEL: saved.LOC_LABEL ?? "",
      GEO_ID: saved.GEO_ID ?? "",
      GEO_MAPPING_LABEL: "", // resolved once geo-mapping API is wired up
      FROM_DATE: saved.EFFEC_FROM ?? "",       // prefilled
      TO_DATE: "",                              // always blank per confirmed UI, ignoring saved.EFFEC_TO
      NM: saved.NM ?? "",
      EMP_CODE: saved.EMP_CODE ?? "",
      REPORT_TO_DISPLAY: saved.REPORT_TO_DISPLAY ?? "",
      HAS_REPORTING: !!saved.HAS_REPORTING,
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

  useEffect(() => {
    if (!organogramId) {
      setOrganogramDetails(null);
      setLocations([]);
      setRawLocationRows([]);
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

        const locationsRes = await getOrganogramLocations({ ID: organogramId });
       const savedRows = Array.isArray(locationsRes)
        ? locationsRes
        : Array.isArray(locationsRes?.data)
          ? locationsRes.data
          : [];

        setRawLocationRows(savedRows);
        // Only fetch division descriptions when EMP_LEVEL === '15',
        // mirroring the PHP's conditional use of $divnm.
        const divisionMap =
          detailsRes.data?.EMP_LEVEL === "15"
            ? await fetchDivisionMap(savedRows)
            : {};
            
        setLocations(buildLocationRows(posiCount, savedRows, divisionMap));
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