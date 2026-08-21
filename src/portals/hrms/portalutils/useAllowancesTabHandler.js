import { useState, useEffect, useCallback } from "react";
import {
  getOrgLocAllowances,
  getAllowanceOptions,
  saveAllowance,
  deleteAllowance,
} from "../services/orgonogramService";
import { notifyError, notifySuccess, confirmAction } from "../../../services/alertService";

const asArray = (res) =>
  Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];

const useAllowancesTabHandler = (organogramId, locId) => {
  const [allowanceRows, setAllowanceRows] = useState([]);
  const [allowanceOptions, setAllowanceOptions] = useState([]);

  const [loadingRows, setLoadingRows] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [isAdding, setIsAdding] = useState(false);
  const [selectedAllowIds, setSelectedAllowIds] = useState([]);
  const [newEffecFrom, setNewEffecFrom] = useState(null);

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
    loadAllowances();
  }, [loadAllowances]);

  const loadAllowanceOptions = useCallback(async () => {
    if (!locId) return;
    try {
        setLoadingOptions(true);
        const res = await getAllowanceOptions({ LOC_ID: locId });
        console.log("=========RES=======", res);
        const rows = asArray(res.data);
        console.log("=========ROWS=======", rows);
        setAllowanceOptions(
        rows.map((r) => ({ id: r.ALLOW_ID, label: r.ALLOW_DESC ?? "" }))
        );
    } catch (error) {
        console.error("Load allowance options error:", error);
        notifyError(error?.message || "Unable to load allowance options.");
    } finally {
        setLoadingOptions(false);
    }
    }, [locId]);

  // Fetched fresh every time "Add Allowance" opens — the exclusion
  // list (already-assigned allowances) changes after every save.
  const startAddAllowance = useCallback(() => {
    setIsAdding(true);
    setSelectedAllowIds([]);
    setNewEffecFrom(null);
    loadAllowanceOptions();
  }, [loadAllowanceOptions]);

  const cancelAddAllowance = useCallback(() => {
    setIsAdding(false);
    setSelectedAllowIds([]);
    setNewEffecFrom(null);
  }, []);

  const saveNewAllowanceRow = useCallback(async () => {
    if (!selectedAllowIds.length) {
      notifyError("Select at least one allowance.");
      return;
    }
    if (!newEffecFrom) {
      notifyError("Effective From date is required.");
      return;
    }

    try {
      setSaving(true);
      // Multiple ids selected -> one save call each, same EFFEC_FROM.
      const results = await Promise.all(
        selectedAllowIds.map((allowId) =>
          saveAllowance({
            ORG_LOC_ID: locId,
            ORG_ID: organogramId,
            ALLOW_ID: allowId,
            EFFEC_FROM: newEffecFrom,
          })
        )
      );

      const failed = results.filter((r) => !r?.status);
      if (failed.length) {
        notifyError(`${failed.length} of ${results.length} allowance(s) failed to save.`);
      } else {
        notifySuccess("Allowance(s) added.");
      }

      setIsAdding(false);
      setSelectedAllowIds([]);
      setNewEffecFrom(null);
      loadAllowances();
    } catch (error) {
      console.error("Save allowance error:", error);
      notifyError(error?.message || "Unable to save allowance.");
    } finally {
      setSaving(false);
    }
  }, [locId, organogramId, selectedAllowIds, newEffecFrom, loadAllowances]);

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
  console.log("================allowanceOptions============", allowanceOptions);

  return {
    allowanceRows,
    allowanceOptions,
    loadingRows,
    loadingOptions,
    saving,
    deletingId,
    isAdding,
    selectedAllowIds,
    setSelectedAllowIds,
    newEffecFrom,
    setNewEffecFrom,
    startAddAllowance,
    cancelAddAllowance,
    saveNewAllowanceRow,
    removeAllowanceRow,
  };
};

export default useAllowancesTabHandler;