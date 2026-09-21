import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  getOrganogramDetails,
  getOrganogramLocations,
  getHrDivision,
  getGeoMappingOptions,
  getOrgLocReportingManager,
  saveOrganogramLocationsBulk,
} from "../services/orgonogramService";
import { notifyError, notifySuccess } from "../../../services/alertService";
import { formatDateForApi } from "../../../utils/formatUtils";

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
      _errors: {},
    });
  }
  return rows;
};

const toDate = (value) => {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
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

const fetchGeoMappingOptionsMap = async (empLevel, rows = []) => {
  const uniqueCombos = new Map();
  rows.forEach((row) => {
    if (!row.__divsnId) return;
    const key = buildGeoMappingCacheKey(row.__divsnId, row.EFFEC_FROM_RAW);
    if (!uniqueCombos.has(key)) {
      uniqueCombos.set(key, { DIVSN_ID: row.__divsnId, EFFEC_FROM: row.EFFEC_FROM_RAW });
    }
  });
  const entries = Array.from(uniqueCombos.entries());

  if (empLevel === "15") {
    const uniqueDivsnIds = [...new Set(entries.map(([, p]) => p.DIVSN_ID).filter(Boolean))];
    const divResults = await Promise.all(
      uniqueDivsnIds.map((divsnId) =>
        getHrDivision({ GEO_ID: divsnId }).catch((error) => {
          console.error("Load division error:", divsnId, error);
          return null;
        })
      )
    );
    const descById = {};
    uniqueDivsnIds.forEach((divsnId, idx) => {
      descById[divsnId] = divResults[idx]?.data?.DIVSN_DESC ?? "";
    });
    const map = {};
    entries.forEach(([key, params]) => {
      map[key] = [{ label: descById[params.DIVSN_ID] ?? "", value: params.DIVSN_ID }];
    });
    return map;
  }

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
    const rowsData = Array.isArray(results[idx]?.data) ? results[idx].data : [];
    map[key] = rowsData.map((r) => ({ label: r.GEO_DETAILS ?? "", value: r.GEO_ID }));
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
const useLocationsTabHandler = (organogramId, onOrganogramSaved) => {
  const [organogramDetails, setOrganogramDetails] = useState(null);
  const [locations, setLocations] = useState([]);
  const [geoMappingOptionsMap, setGeoMappingOptionsMap] = useState({});

  const [loadingDetails, setLoadingDetails] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [empLevelPL, setEmpLevelPL] = useState(null);
  const [savingAll, setSavingAll] = useState(false);

  // Baseline used to diff on save (only send changed rows) and to restore
  // on Cancel. Refreshed after every successful load AND after every
  // successful save, so the next diff always starts clean. Editing is no
  // longer a separately-entered mode — it's just whichever state
  // `locations` is in versus this snapshot.
  const savedSnapshotRef = useRef([]);

  const loadDetailsAndLocations = useCallback(async () => {
    if (!organogramId) {
      setOrganogramDetails(null);
      setLocations([]);
      setGeoMappingOptionsMap({});
      savedSnapshotRef.current = [];
      return;
    }

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
      setEmpLevelPL(empLevel);

      const locationsRes = await getOrganogramLocations({ ID: organogramId });
      const savedRows = Array.isArray(locationsRes)
        ? locationsRes
        : Array.isArray(locationsRes?.data)
          ? locationsRes.data
          : [];

      const rowSkeletons = buildLocationRows(posiCount, savedRows, {}, {}, divsnId);

      const [divisionMap, geoMappingMap, reportingMap] = await Promise.all([
        empLevel === "15" ? fetchDivisionMap(savedRows) : Promise.resolve({}),
        fetchGeoMappingOptionsMap(empLevel, rowSkeletons),
        fetchReportingMap(savedRows),
      ]);

      setGeoMappingOptionsMap(geoMappingMap);
      const freshRows = buildLocationRows(posiCount, savedRows, divisionMap, reportingMap, divsnId);
      setLocations(freshRows);
      savedSnapshotRef.current = freshRows;
    } catch (error) {
      console.error("Load location details error:", error);
      notifyError(error?.message || "Unable to load location details.");
    } finally {
      setLoadingDetails(false);
      setLoadingLocations(false);
    }
  }, [organogramId]);

  useEffect(() => {
    loadDetailsAndLocations();
  }, [loadDetailsAndLocations]);

  const getGeoMappingOptionsForRow = useCallback(
    (row) => {
      const key = buildGeoMappingCacheKey(row.__divsnId, row.EFFEC_FROM_RAW);
      const fetched = geoMappingOptionsMap[key] || [];

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

  const getRowValidationErrors = useCallback(
    (row) => {
      const errors = {};

      if (!row.GEO_ID && row.GEO_ID !== 0) {
        errors.GEO_ID = "Geo Label is required.";
      } else {
        const options = getGeoMappingOptionsForRow(row);
        const isValidOption = options.some(
          (opt) => String(opt.value) === String(row.GEO_ID)
        );
        if (!isValidOption) {
          errors.GEO_ID = "Selected Geo Label is not valid for this division/date.";
        }
      }

      const fromDate = toDate(row.FROM_DATE);
      if (!row.FROM_DATE) {
        errors.FROM_DATE = "From Date is required.";
      } else if (!fromDate) {
        errors.FROM_DATE = "From Date is not a valid date.";
      }

      return errors;
    },
    [getGeoMappingOptionsForRow]
  );

  // Reverts any unsaved edits back to the last successfully loaded/saved
  // state. Mode itself (list vs. edit) is controlled by the parent via
  // the shared top toggle — this only ever resets data, never switches view.
  const handleCancelEdits = useCallback(() => {
    setLocations(savedSnapshotRef.current);
  }, []);

  const updateBulkRowField = useCallback((sno, field, value) => {
    setLocations((prev) =>
      prev.map((row) => {
        if (row.SNO !== sno) return row;
        const nextErrors = { ...row._errors };
        delete nextErrors[field];
        return { ...row, [field]: value, _errors: nextErrors };
      })
    );
  }, []);

  const hasRowChanged = (draft, original) =>
    draft.GEO_ID !== original.GEO_ID ||
    draft.FROM_DATE !== original.FROM_DATE ||
    draft.TO_DATE !== original.TO_DATE;

  const handleBulkSave = useCallback(
    async (sendForAuth = false) => {
      const rowErrors = {};
      locations.forEach((row) => {
        const errors = getRowValidationErrors(row);
        if (Object.keys(errors).length > 0) rowErrors[row.SNO] = errors;
      });

      if (Object.keys(rowErrors).length > 0) {
        setLocations((prev) =>
          prev.map((row) => ({ ...row, _errors: rowErrors[row.SNO] || {} }))
        );
        notifyError(
          `${Object.keys(rowErrors).length} position(s) have invalid or missing data. Please fix the highlighted rows.`
        );
        return;
      }

      const original = savedSnapshotRef.current;
      const changedRows = locations.filter((row) => {
        const originalRow = original.find((o) => o.SNO === row.SNO);
        return !originalRow || hasRowChanged(row, originalRow);
      });

      if (changedRows.length === 0) {
        notifySuccess("No changes to save.");
        return;
      }

      const payload = {
        ORGANOGRAM_ID: organogramId,
        DIVSN_ID: changedRows[0]?.__divsnId,
        EMP_LEVEL: empLevelPL,
        sendForAuth,
        ROWS: changedRows.map((r) => ({
          ID: r.LOC_ID,
          GEO_ID: r.GEO_ID,
          EFFEC_FROM: formatDateForApi(r.FROM_DATE),
          EFFEC_TO: formatDateForApi(r.TO_DATE),
        })),
      };

      try {
        setSavingAll(true);
        const res = await saveOrganogramLocationsBulk(payload);

        if (res?.status) {
          notifySuccess(
            res?.message ||
              (sendForAuth
                ? "Locations saved and sent for authorization."
                : "Locations saved successfully."),
            { onClose: onOrganogramSaved }
          );
          // Refresh from server so LOC_IDs / saved values are accurate,
          // and reset the diff baseline for the next round of edits.
          await loadDetailsAndLocations();
        } else {
          notifyError(res?.message || "Unable to save locations.");
        }
      } catch (error) {
        console.error("Bulk save locations error:", error);
        notifyError(error?.message || "Unable to save locations.");
      } finally {
        setSavingAll(false);
      }
    },
    [locations, organogramId, empLevelPL, getRowValidationErrors, onOrganogramSaved, loadDetailsAndLocations]
  );

  const canSendForAuth = useMemo(() => {
    return locations.every((row) => !row.status || row.status === "N");
  }, [locations]);

  return {
    organogramDetails,
    locations,
    loadingDetails,
    loadingLocations,
    getGeoMappingOptionsForRow,
    savingAll,
    handleCancelEdits,
    handleBulkSave,
    updateBulkRowField,
    canSendForAuth,
  };
};

export default useLocationsTabHandler;