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

/* ==========================================================
    VALIDATION HELPERS
========================================================== */
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
  const [savingRow, setSavingRow] = useState(false);
  const [empLevelPL, setEmpLevelPL] = useState(null);

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
        setEmpLevelPL(empLevel);

        const locationsRes = await getOrganogramLocations({ ID: organogramId });
        const savedRows = Array.isArray(locationsRes)
          ? locationsRes
          : Array.isArray(locationsRes?.data)
            ? locationsRes.data
            : [];

        // Build the row skeletons FIRST (empty divisionMap/reportingMap placeholders) —
        // this is the actual shape the dropdown editor will render against,
        // covering every position (posiCount), not just ones with saved data.
        const rowSkeletons = buildLocationRows(posiCount, savedRows, {}, {}, divsnId);

        const [divisionMap, geoMappingMap, reportingMap] = await Promise.all([
          empLevel === "15" ? fetchDivisionMap(savedRows) : Promise.resolve({}),
          fetchGeoMappingOptionsMap(empLevel, rowSkeletons),
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

  // Declared before getRowValidationErrors (which reads it) — const/useCallback
  // bindings aren't hoisted, so this must come first or referencing it below
  // throws a "Cannot access before initialization" error on render.
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

  // Returns a field-keyed error object, e.g. { GEO_ID: "...", FROM_DATE: "..." },
  // so each message can be rendered under its own input.
  const getRowValidationErrors = useCallback(
    (row) => {
      const errors = {};

      /* ---- Geo Label dropdown ---- */
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

      /* ---- From Date ---- */
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

  // PrimeReact rowEditValidator signature: (data, options) => boolean.
  // Stores field-level messages directly on the row object in `locations`
  // (as `_errors`) so the editor templates — which render off rowData —
  // pick them up on the very next render. A separate rowErrors state object
  // was tried and dropped: it didn't reliably trigger PrimeReact's row-edit
  // cell templates to re-render.
  const validateLocationRow = useCallback(
    (rowData) => {
      const errors = getRowValidationErrors(rowData);
      const hasErrors = Object.keys(errors).length > 0;

      setLocations((prev) =>
        prev.map((row) => (row.SNO === rowData.SNO ? { ...row, _errors: errors } : row))
      );

      if (hasErrors) {
        // Fallback popup alongside the inline messages, so validation is
        // never silently blocked even if the inline message goes unnoticed.
        notifyError(Object.values(errors).join(" "));
      }

      return !hasErrors; // false keeps the row open in edit mode
    },
    [getRowValidationErrors]
  );

  // Call from an editor's onChange so the message clears the moment the
  // user fixes that specific field, without waiting for the next save attempt.
  const clearRowFieldError = useCallback((sno, field) => {
    setLocations((prev) =>
      prev.map((row) => {
        if (row.SNO !== sno || !row._errors?.[field]) return row;
        const { [field]: _omit, ...rest } = row._errors;
        return { ...row, _errors: rest };
      })
    );
  }, []);

  const handleRowEditComplete = useCallback(
    async (e) => {
      const { newData, index } = e;

      // Defensive re-check: rowEditValidator should already have blocked
      // invalid data from reaching here, but this guards against the
      // handler ever being wired without a validator.
      const errors = getRowValidationErrors(newData);
      if (Object.keys(errors).length > 0) {
        setLocations((prev) =>
          prev.map((row) => (row.SNO === newData.SNO ? { ...row, _errors: errors } : row))
        );
        notifyError(Object.values(errors).join(" "));
        return;
      }

      setLocations((prev) => {
        const next = [...prev];
        next[index] = { ...newData, _errors: {} };
        return next;
      });

      try {
        setSavingRow(true);
        const payload = {
          ID: newData.LOC_ID,
          ORGANOGRAM_ID: organogramId,
          GEO_ID: newData.GEO_ID,
          EFFEC_FROM: formatDateForApi(newData.FROM_DATE),
          EFFEC_TO: formatDateForApi(newData.TO_DATE),
          DIVSN_ID: newData.__divsnId,
          EMP_LEVEL: empLevelPL,
        };
        const res = await saveOrganogramLocation(payload);
        if (res?.status) {
          notifySuccess(res?.message || "Location saved successfully.", {
            onClose: onOrganogramSaved,
          });
        } else {
          notifyError(res?.message || "Unable to save location.", {
            onClose: onOrganogramSaved,
          });
        }
      } catch (error) {
        console.error("Save location row error:", error);
        notifyError(error?.message || "Unable to save location.", {
          onClose: onOrganogramSaved,
        });
      } finally {
        setSavingRow(false);
      }
    },
    [organogramId, empLevelPL, getRowValidationErrors, onOrganogramSaved]
  );

  const handleRowEditCancel = useCallback((e) => {
    const sno = e?.data?.SNO;
    if (sno != null) {
      setLocations((prev) =>
        prev.map((row) => (row.SNO === sno ? { ...row, _errors: {} } : row))
      );
    }
  }, []);

  return {
    organogramDetails,
    locations,
    loadingDetails,
    loadingLocations,
    savingRow,
    handleRowEditComplete,
    handleRowEditCancel,
    getGeoMappingOptionsForRow,
    validateLocationRow,
    clearRowFieldError,
  };
};

export default useLocationsTabHandler;
