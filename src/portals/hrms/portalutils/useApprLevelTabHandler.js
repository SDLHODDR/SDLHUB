import { useState, useEffect, useCallback } from "react";
import {
  getOrganogramApprLevels,
  getApprLevelOptions,
  saveApprLevel,
} from "../services/orgonogramService";
import { notifyError, notifySuccess } from "../../../services/alertService";
import { formatDateForApi } from "../../../utils/formatUtils";

const useApprLevelTabHandler = (organogramId) => {
  const [apprLevels, setApprLevels] = useState([]);
  const [apprOptions, setApprOptions] = useState([]);

  const [loadingApprLevels, setLoadingApprLevels] = useState(false);
  const [savingRow, setSavingRow] = useState(false);

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
    const load = async () => {
      await loadApprLevels();
    };
    load();
  }, [loadApprLevels]);

  const handleAddApprLevel = useCallback(
    async (appraiserId, effectiveFrom) => {
      if (!organogramId || !appraiserId || !effectiveFrom) return false;

      try {
        setSavingRow(true);
        const res = await saveApprLevel({
          ORG_ID: organogramId,
          APPR_LEVEL: apprLevels.length + 1,
          APPR_ORGID: appraiserId,
          EFFEC_FROM: formatDateForApi(effectiveFrom),
          EFFEC_TO: "",
        });
        if (res?.status) {
          notifySuccess(res?.message || "Appraisal level saved.");
          await loadApprLevels();
          return true;
        } else {
          notifyError(res?.message || "Unable to save appraisal level.");
        }
      } catch (error) {
        console.error("Add appraisal level error:", error);
        notifyError(error?.message || "Unable to save appraisal level.");
      } finally {
        setSavingRow(false);
      }

      return false;
    },
    [organogramId, apprLevels.length, loadApprLevels]
  );

  return {
    apprLevels,
    apprOptions,
    loadingApprLevels,
    savingRow,
    handleAddApprLevel,
  };
};

export default useApprLevelTabHandler;