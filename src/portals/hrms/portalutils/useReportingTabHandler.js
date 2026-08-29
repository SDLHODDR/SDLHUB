import { useState, useEffect, useCallback } from "react";
import {
  getOrgLocReportingRows,
  getReportingParentOptions,
  saveOrgLocReporting,
} from "../services/orgonogramService";
import { notifyError, notifySuccess, notifyWarning } from "../../../services/alertService";

const useReportingTabHandler = (locId) => {
  const [reportingRows, setReportingRows] = useState([]);
  const [parentOptions, setParentOptions] = useState([]);

  const [loadingRows, setLoadingRows] = useState(false);
  const [savingRow, setSavingRow] = useState(false);

  const loadReporting = useCallback(async () => {
    if (!locId) {
      setReportingRows([]);
      setParentOptions([]);
      return;
    }
    try {
      setLoadingRows(true);

      // Fetch rows + dropdown options together — avoids the same
      // empty-dropdown-on-first-edit race we hit in Appraisal Levels.
      const [rowsRes, optionsRes] = await Promise.all([
        getOrgLocReportingRows({ LOC_ID: locId }),
        getReportingParentOptions({}),
      ]);

      const rows = Array.isArray(rowsRes)
        ? rowsRes
        : Array.isArray(rowsRes?.data)
          ? rowsRes.data
          : [];
      setReportingRows(rows);

      const options = Array.isArray(optionsRes)
        ? optionsRes
        : Array.isArray(optionsRes?.data)
          ? optionsRes.data
          : [];
      setParentOptions(
        options.map((o) => ({ label: o.DESCR ?? "", value: o.ID }))
      );
    } catch (error) {
      console.error("Load reporting error:", error);
      notifyError(error?.message || "Unable to load reporting data.");
    } finally {
      setLoadingRows(false);
    }
  }, [locId]);

  useEffect(() => {
    loadReporting();
  }, [loadReporting]);

  // Guard: only the open assignment (blank EFFEC_TO) is editable,
  // matching the legacy PHP `if (trim($alw['EFFEC_TO']) == '')` check.
  const handleRowEditInit = useCallback((e) => {
    if (e.data.EFFEC_TO) {
      notifyWarning?.(
        "This record is closed and cannot be edited."
      );
      return false; // some PrimeReact versions honor this; see note below
    }
  }, []);

  const handleRowEditComplete = useCallback(
    async (e) => {
      const { newData, index } = e;

      if (newData.EFFEC_TO) {
        // Belt-and-braces — should already be blocked at init, but
        // don't let a closed row slip through on save either.
        notifyWarning?.("This record is closed and cannot be edited.");
        return;
      }

      setReportingRows((prev) => {
        const next = [...prev];
        next[index] = newData;
        return next;
      });

      try {
        setSavingRow(true);
        const res = await saveOrgLocReporting({
          ORG_LOC_ID: locId,
          PARENT_ORGID: newData.PARENT_ORGID,
          PARENT_LOCID: newData.PARENT_LOCID,
          EFFEC_FROM: newData.EFFEC_FROM,
          EFFEC_TO: newData.EFFEC_TO,
        });
        if (res?.status) {
          notifySuccess(res?.message || "Reporting updated.");
          loadReporting();
        } else {
          notifyError(res?.message || "Unable to update reporting.");
        }
      } catch (error) {
        console.error("Save reporting row error:", error);
        notifyError(error?.message || "Unable to update reporting.");
      } finally {
        setSavingRow(false);
      }
    },
    [locId, loadReporting]
  );

  const handleRowEditCancel = useCallback(() => {}, []);

  // Guarantee the row's currently assigned parent location is always
  // present as a dropdown option, even if it's missing from the fetched
  // list for some reason — same defensive pattern as
  // getGeoMappingOptionsForRow in Locations.
  const getParentOptionsForRow = useCallback(
    (row) => {
      const hasCurrentValue = parentOptions.some(
        (opt) => String(opt.value) === String(row.PARENT_LOCID)
      );
      if (row.PARENT_LOCID && !hasCurrentValue) {
        return [{ label: row.ORGNM ?? "", value: row.PARENT_LOCID }, ...parentOptions];
      }
      return parentOptions;
    },
    [parentOptions]
  );

  return {
    reportingRows,
    loadingRows,
    savingRow,
    handleRowEditInit,
    handleRowEditComplete,
    handleRowEditCancel,
    getParentOptionsForRow,
  };
};

export default useReportingTabHandler;