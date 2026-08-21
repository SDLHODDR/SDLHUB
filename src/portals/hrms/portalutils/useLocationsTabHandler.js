import { useState, useEffect, useCallback } from "react";
import {
  getOrganogramDetails,
  getOrganogramLocations,
  getHrDivision,
  getGeoMappingOptions,
  getOrgLocReportingManager,
  saveOrganogramLocation,
} from "../services/orgonogramService";
import { notifyError, notifySuccess } from "../../../services/alertService";

/* ==========================================================
    ROW BUILDER
========================================================== */
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
      EFFEC_FROM_RAW: saved.EFFEC_FROM ?? "",
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

/* ==========================================================
    DIVISION MAP (EMP_LEVEL === '15')
========================================================== */
const fetchDivisionMap = async (savedRows = []) => {
  const uniqueGeoIds = [...new Set(savedRows.map((r) => r.GEO_ID).filter(Boolean))];
  if (!uniqueGeoIds.length) return {};

  const results = await Promise.all(
    uniqueGeoIds.map((geoId) =>
      getHrDivision({ GEO_ID: geoId }).catch((error) => {
        console.error("Load division error:", geoId, error);
        return null;
      })
    )
  );

  const map = {};
  uniqueGeoIds.forEach((geoId, idx) => {
    map[geoId] = results[idx]?.data?.DIVSN_DESC ?? "";
  });
  return map;
};

/* ==========================================================
    GEO MAPPING OPTIONS (EMP_LEVEL !== '15')
========================================================== */
const buildGeoMappingCacheKey = (divsnId, effecFrom) => `${divsnId}::${effecFrom}`;

const fetchGeoMappingOptionsMap = async (empLevel, savedRows = []) => {
  const uniqueCombos = new Map();
  savedRows.forEach((row) => {
    if (!row.GEO_ID) return;
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
      REPORT_TO_DISPLAY: data?.REPORT_TO_DISPLAY ?? "",
      HAS_REPORTING: !!data?.REPORT_TO_DISPLAY,
    };
  });
  return map;
};

/* ==========================================================
    HOOK
========================================================== */
const useLocationsTabHandler = (organogramId) => {
  const [organogramDetails, setOrganogramDetails] = useState(null);
  const [locations, setLocations] = useState([]);
  const [geoMappingOptionsMap, setGeoMappingOptionsMap] = useState({});

  const [loadingDetails, setLoadingDetails] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [savingRow, setSavingRow] = useState(false);

  useEffect(() => {
    if (!organogramId) {
      setOrganogramDetails(null);
      setLocations([]);
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

  const handleRowEditComplete = useCallback(
    async (e) => {
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
    },
    [organogramId]
  );

  const handleRowEditCancel = useCallback(() => {
    // No optimistic mutation happens before save, so nothing to revert.
  }, []);

  // THIS was the missing piece — defined earlier in conversation but
  // never actually returned from the hook.
  const getGeoMappingOptionsForRow = useCallback(
    (row) => {
      const key = buildGeoMappingCacheKey(row.__divsnId, row.EFFEC_FROM_RAW);
      const fetched = geoMappingOptionsMap[key] || [];

      // Guarantee the row's currently assigned GEO_ID is always present
      // as an option — even when the API returns no matching geo-mapping
      // rows for this division/level/date combo — so the dropdown can
      // resolve a label and preselect instead of showing "Select" /
      // "No available options" for a position that's actually assigned.
      const hasCurrentValue = fetched.some(
        (opt) => String(opt.value) === String(row.GEO_ID)
      );

      if (row.GEO_ID && !hasCurrentValue) {
        const fallbackLabel =
          row.GEODESC || `${row.DIVSN_DESC ?? ""} (${row.LOC_LABEL ?? ""})`;
        return [{ label: fallbackLabel, value: row.GEO_ID }, ...fetched];
      }

      return fetched;
    },
    [geoMappingOptionsMap]
  );

  return {
    organogramDetails,
    locations,
    loadingDetails,
    loadingLocations,
    savingRow,
    handleRowEditComplete,
    handleRowEditCancel,
    getGeoMappingOptionsForRow,
  };
};

export default useLocationsTabHandler;