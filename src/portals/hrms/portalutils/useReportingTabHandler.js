import { useState, useEffect, useCallback } from "react";
import {
  getOrgLocReportingRows,
  getReportingParentOptions,
  saveOrgLocReporting,
} from "../services/orgonogramService";
import { notifyError, notifySuccess } from "../../../services/alertService";
import { formatDateForApi } from "../../../utils/formatUtils";

const useReportingTabHandler = (locId, organogramId, repId = null) => {
  const [reportingRows, setReportingRows] = useState([]);
  const [parentOptions, setParentOptions] = useState([]);

  const [loadingRows, setLoadingRows] = useState(false);
  const [savingRow, setSavingRow] = useState(false);
  const [selectedParentLocId, setSelectedParentLocId] = useState("");
  const [newEffectiveFrom, setNewEffectiveFrom] = useState(null);
  const [newEffectiveTo, setNewEffectiveTo] = useState(null);
  const [editingReportingId, setEditingReportingId] = useState(null);

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
    const loadTask = Promise.resolve().then(loadReporting);
    return () => loadTask.catch(() => {});
  }, [loadReporting]);

  const startEditingReporting = useCallback((row) => {
    setEditingReportingId(row.ID || repId);
    setSelectedParentLocId(row.PARENT_LOCID ?? "");
    setNewEffectiveFrom(row.EFFEC_FROM instanceof Date ? row.EFFEC_FROM : null);
    setNewEffectiveTo(row.EFFEC_TO instanceof Date ? row.EFFEC_TO : null);
  }, [repId]);

  const cancelEditingReporting = useCallback(() => {
    setEditingReportingId(null);
    setSelectedParentLocId("");
    setNewEffectiveFrom(null);
    setNewEffectiveTo(null);
  }, []);

  const saveReporting = useCallback(async (parentLocId, effectiveFrom, effectiveTo) => {
    if (!parentLocId) {
      notifyError("Reporting manager is required.");
      return false;
    }
    if (!effectiveFrom) {
      notifyError("Effective From date is required.");
      return false;
    }

    try {
      setSavingRow(true);
      const res = await saveOrgLocReporting({
        repid: editingReportingId || repId || "",
        orgid: organogramId,
        locid: locId,
        PARENT_LOCID: parentLocId,
        EFFEC_FROM: formatDateForApi(effectiveFrom),
        EFFEC_TO: formatDateForApi(effectiveTo),
      });
      if (!res?.status) {
        notifyError(res?.message || "Unable to save reporting manager.");
        return false;
      }

      notifySuccess(res?.message || (editingReportingId || repId ? "Reporting updated." : "Reporting manager added."));
      cancelEditingReporting();
      await loadReporting();
      return true;
    } catch (error) {
      console.error("Save reporting manager error:", error);
      notifyError(error?.message || "Unable to save reporting manager.");
      return false;
    } finally {
      setSavingRow(false);
    }
  }, [locId, organogramId, editingReportingId, repId, loadReporting, cancelEditingReporting]);

  return {
    reportingRows,
    loadingRows,
    savingRow,
    parentOptions,
    selectedParentLocId,
    setSelectedParentLocId,
    newEffectiveFrom,
    setNewEffectiveFrom,
    newEffectiveTo,
    setNewEffectiveTo,
    editingReportingId,
    startEditingReporting,
    cancelEditingReporting,
    saveReporting,
  };
};

export default useReportingTabHandler;