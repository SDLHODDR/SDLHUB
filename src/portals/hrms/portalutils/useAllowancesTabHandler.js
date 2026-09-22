import { useState, useEffect, useCallback } from "react";
import {
  getOrgLocAllowances,
  getAllowanceOptions,
  saveAllowance,
  deleteAllowance,
} from "../services/orgonogramService";
import { notifyError, notifySuccess, confirmAction } from "../../../services/alertService";
import { formatDateForApi } from "../../../utils/formatUtils";

const asArray = (res) =>
  Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];

const useAllowancesTabHandler = (organogramId, locId) => {
  const [allowanceRows, setAllowanceRows] = useState([]);
  const [allowanceOptions, setAllowanceOptions] = useState([]);

  const [loadingRows, setLoadingRows] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [editingAllowanceId, setEditingAllowanceId] = useState(null);
  const [selectedAllowId, setSelectedAllowId] = useState("");
  const [effectiveFrom, setEffectiveFrom] = useState(null);

  const loadAllowances = useCallback(async () => {
    if (!locId || !organogramId) {
      setAllowanceRows([]);
      return;
    }
    try {
      setLoadingRows(true);
      const rowsRes = await getOrgLocAllowances({
        LOC_ID: locId,
        ORG_ID: organogramId,
      });
      setAllowanceRows(asArray(rowsRes));
    } catch (error) {
      console.error("Load allowances error:", error);
      notifyError(error?.message || "Unable to load allowances.");
    } finally {
      setLoadingRows(false);
    }
  }, [locId, organogramId]);

  useEffect(() => {
    const loadTask = Promise.resolve().then(loadAllowances);
    return () => loadTask.catch(() => {});
  }, [loadAllowances]);

  const loadAllowanceOptions = useCallback(async (currentAllowance = null) => {
    if (!locId) return;
    try {
        setLoadingOptions(true);
        const res = await getAllowanceOptions({ LOC_ID: locId });
        const rows = asArray(res.data);
        const options = rows.map((r) => ({ value: r.ALLOW_ID, label: r.ALLOW_DESC ?? "" }));
        if (
          currentAllowance?.ALLOW_ID &&
          !options.some((option) => String(option.value) === String(currentAllowance.ALLOW_ID))
        ) {
          options.unshift({
            value: currentAllowance.ALLOW_ID,
            label: currentAllowance.ALLOW_DESC ?? "",
          });
        }
        setAllowanceOptions(options);
    } catch (error) {
        console.error("Load allowance options error:", error);
        notifyError(error?.message || "Unable to load allowance options.");
    } finally {
        setLoadingOptions(false);
    }
    }, [locId]);

  useEffect(() => {
    const loadTask = Promise.resolve().then(loadAllowanceOptions);
    return () => loadTask.catch(() => {});
  }, [loadAllowanceOptions]);

  const startEditingAllowance = useCallback((row) => {
    setEditingAllowanceId(row.ID);
    setSelectedAllowId(row.ALLOW_ID ?? "");
    setEffectiveFrom(row.EFFEC_FROM instanceof Date ? row.EFFEC_FROM : null);
    loadAllowanceOptions(row);
  }, [loadAllowanceOptions]);

  const startAddingAllowance = useCallback(() => {
    setEditingAllowanceId(null);
    setSelectedAllowId("");
    setEffectiveFrom(null);
    loadAllowanceOptions();
  }, [loadAllowanceOptions]);

  const cancelEditingAllowance = useCallback(() => {
    setEditingAllowanceId(null);
    setSelectedAllowId("");
    setEffectiveFrom(null);
  }, []);

  const saveAllowanceForm = useCallback(async () => {
    if (!selectedAllowId) {
      notifyError("Allowance is required.");
      return;
    }
    if (!effectiveFrom) {
      notifyError("Effective From date is required.");
      return;
    }

    try {
      setSaving(true);
      const res = await saveAllowance({
        ID: editingAllowanceId || undefined,
        ORG_LOC_ID: locId,
        ORG_ID: organogramId,
        ALLOW_ID: selectedAllowId,
        EFFEC_FROM: formatDateForApi(effectiveFrom),
      });
      if (!res?.status) {
        notifyError(res?.message || "Unable to save allowance.");
        return false;
      }

      notifySuccess(res?.message || (editingAllowanceId ? "Allowance updated." : "Allowance added."));
      cancelEditingAllowance();
      await loadAllowances();
      return true;
    } catch (error) {
      console.error("Save allowance error:", error);
      notifyError(error?.message || "Unable to save allowance.");
      return false;
    } finally {
      setSaving(false);
    }
  }, [locId, organogramId, editingAllowanceId, selectedAllowId, effectiveFrom, loadAllowances, cancelEditingAllowance]);

  const removeAllowanceRow = useCallback(
    (row) => {
      confirmAction?.({
        message: `Delete allowance "${row.ALLOW_DESC}"?`,
        onConfirm: async () => {
          try {
            setDeletingId(row.ID);
            const res = await deleteAllowance({ ID: row.ID });
            if (res?.status) {
              notifySuccess(res?.message || "Allowance deleted.");
              loadAllowances();
            } else {
              notifyError(res?.message || "Unable to delete allowance.");
            }
          } catch (error) {
            console.error("Delete allowance error:", error);
            notifyError(error?.message || "Unable to delete allowance.");
          } finally {
            setDeletingId(null);
          }
        },
      });
    },
    [loadAllowances]
  );
  return {
    allowanceRows,
    allowanceOptions,
    loadingRows,
    loadingOptions,
    saving,
    deletingId,
    editingAllowanceId,
    selectedAllowId,
    setSelectedAllowId,
    effectiveFrom,
    setEffectiveFrom,
    startEditingAllowance,
    startAddingAllowance,
    cancelEditingAllowance,
    saveAllowanceForm,
    removeAllowanceRow,
  };
};

export default useAllowancesTabHandler;