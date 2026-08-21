import { useState, useEffect, useCallback } from "react";
import {
  getOrganogramApprLevels,
  getApprLevelOptions,
  saveApprLevel,
  saveApprLevelOrder,
} from "../services/orgonogramService";
import { notifyError, notifySuccess } from "../../../services/alertService";

const useApprLevelTabHandler = (organogramId) => {
  const [apprLevels, setApprLevels] = useState([]);
  const [apprOptions, setApprOptions] = useState([]);

  const [loadingApprLevels, setLoadingApprLevels] = useState(false);
  const [savingRow, setSavingRow] = useState(false);
  const [reordering, setReordering] = useState(false);

  const loadApprLevels = useCallback(async () => {
    if (!organogramId) {
      setApprLevels([]);
      setApprOptions([]);
      return;
    }
    try {
      setLoadingApprLevels(true);

      // Fetch rows and dropdown options together, up front — same
      // convention as Locations' Promise.all for divisionMap/geoMappingMap.
      // Avoids any edit-time race where the Dropdown renders before
      // options have arrived.
      const [levelsRes, optionsRes] = await Promise.all([
        getOrganogramApprLevels({ ID: organogramId }),
        getApprLevelOptions({ ID: organogramId }),
      ]);

      const levelRows = Array.isArray(levelsRes)
        ? levelsRes
        : Array.isArray(levelsRes?.data)
          ? levelsRes.data
          : [];
      setApprLevels(levelRows);

      const optionRows = Array.isArray(optionsRes)
        ? optionsRes
        : Array.isArray(optionsRes?.data)
          ? optionsRes.data
          : [];
      setApprOptions(
        optionRows.map((r) => ({ label: r.NAME ?? "", value: r.ID }))
      );
    } catch (error) {
      console.error("Load appraisal levels error:", error);
      notifyError(error?.message || "Unable to load appraisal levels.");
    } finally {
      setLoadingApprLevels(false);
    }
  }, [organogramId]);

  useEffect(() => {
    loadApprLevels();
  }, [loadApprLevels]);

  const handleRowEditComplete = useCallback(
    async (e) => {
      const { newData, index } = e;
      setApprLevels((prev) => {
        const next = [...prev];
        next[index] = newData;
        return next;
      });

      try {
        setSavingRow(true);
        const res = await saveApprLevel({
          ORG_ID: organogramId,
          APPR_LEVEL: newData.APPR_LEVEL,
          APPR_ORGID: newData.APPR_ORGID,
          EFFEC_FROM: newData.EFFEC_FROM,
          EFFEC_TO: newData.EFFEC_TO,
        });
        if (res?.status) {
          notifySuccess(res?.message || "Appraisal level saved.");
          loadApprLevels();
        } else {
          notifyError(res?.message || "Unable to save appraisal level.");
        }
      } catch (error) {
        console.error("Save appraisal level row error:", error);
        notifyError(error?.message || "Unable to save appraisal level.");
      } finally {
        setSavingRow(false);
      }
    },
    [organogramId, loadApprLevels]
  );

  const handleRowEditCancel = useCallback(() => {}, []);

  const handleRowReorder = useCallback(
    async (e) => {
      const reordered = e.value.map((row, idx) => ({
        ...row,
        APPR_LEVEL: idx + 1,
      }));
      setApprLevels(reordered);

      try {
        setReordering(true);
        const res = await saveApprLevelOrder({
          ORG_ID: organogramId,
          ROWS: reordered.map((r) => ({
            APPR_LEVEL: r.APPR_LEVEL,
            APPR_ORGID: r.APPR_ORGID,
          })),
        });
        if (res?.status) {
          notifySuccess(res?.message || "Order updated.");
        } else {
          notifyError(res?.message || "Unable to update order.");
          loadApprLevels();
        }
      } catch (error) {
        console.error("Reorder appraisal levels error:", error);
        notifyError(error?.message || "Unable to update order.");
        loadApprLevels();
      } finally {
        setReordering(false);
      }
    },
    [organogramId, loadApprLevels]
  );

  return {
    apprLevels,
    apprOptions,
    loadingApprLevels,
    savingRow,
    reordering,
    handleRowEditComplete,
    handleRowEditCancel,
    handleRowReorder,
  };
};

export default useApprLevelTabHandler;