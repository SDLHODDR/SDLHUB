import { useState, useEffect, useCallback, useMemo } from "react";
import {
  getFinEntities,
  getCompanies,
  getDepartments,
  getDesignations,
  getJDLabels,
  getDivisions,
  getEmployeeLevels,
  getOrganogramLevels,
  getOrganogramDetails,
  getOrganogramLocations,
  getOrganogramApprLevels,
  getOrgLocReportingRows,
  saveOrganogram,
} from "../services/orgonogramService";
import { notifyError, notifySuccess } from "../../../services/alertService";
import { normalizeOrganogramStatus } from "./organogramStatus";

const INITIAL_FORM_STATE = {
  FIN_ENTITY_ID: "",
  COMPANY_ID: "",
  DEPARTMENT_ID: "",
  DESIGNATION_ID: "",
  JD_LABEL_ID: "",
  DIVISION_ID: "",
  EMP_LEVEL_ID: "",
  ORG_LEVEL_ID: "",
  POSITION_COUNT: "",
  POSITION_OCCUPIED: "",
  STATUS: "N",
};

// Maps the raw HR_ORGANOGRAM row (from $res in the old PHP) onto our formData shape.
// NOTE: confirm DESI_ID / JD field names against the actual HR_ORGANOGRAM columns —
// they weren't in the sample row you shared, so update these two keys if they differ.
const mapOrganogramRowToFormData = (row = {}) => ({
  FIN_ENTITY_ID: row.FINENT ?? "",
  COMPANY_ID: row.COMPANY ?? "",
  DEPARTMENT_ID: row.DEPT_ID ?? "",
  DESIGNATION_ID: row.DESI_ID ?? "",
  JD_LABEL_ID: row.JD_ID ?? "",
  DIVISION_ID: row.DIVSN_ID ?? "",
  EMP_LEVEL_ID: row.EMP_LEVEL ?? "",
  ORG_LEVEL_ID: row.OLVL_ID ?? "",
  POSITION_COUNT: row.POSI_COUNT ?? "",
  POSITION_OCCUPIED: row.FILL_COUNT || "0",
  STATUS: normalizeOrganogramStatus(row.STATUS ?? row.status),
});

const mapToOptions = (list = [], labelKey = "LABEL", valueKey = "ID") =>
  Array.isArray(list)
    ? list.map((item) => ({ label: item[labelKey] ?? "", value: item[valueKey] }))
    : [];

const useOrganogramFormHandler = (organogramId, onOrganogramSaved) => {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const [finEntityOptions, setFinEntityOptions] = useState([]);
  const [companyOptions, setCompanyOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [designationOptions, setDesignationOptions] = useState([]);
  const [jdLabelOptions, setJdLabelOptions] = useState([]);
  const [divisionOptions, setDivisionOptions] = useState([]);
  const [empLevelOptions, setEmpLevelOptions] = useState([]);
  const [orgLevelOptions, setOrgLevelOptions] = useState([]);

  const [loadingMasters, setLoadingMasters] = useState(false);
  const [loadingDesignations, setLoadingDesignations] = useState(false);
  const [loadingJdLabels, setLoadingJdLabels] = useState(false);

  const isEditMode = !!organogramId;

  /* ==========================================================
      INITIAL MASTER DATA LOAD (unchanged)
  ========================================================== */
  useEffect(() => {
    const loadMasters = async () => {
      try {
        setLoadingMasters(true);
        const [finEntityRes, companyRes, departmentRes, divisionRes, empLevelRes, orgLevelRes] =
          await Promise.all([
            getFinEntities(),
            getCompanies(),
            getDepartments(),
            getDivisions(),
            getEmployeeLevels(),
            getOrganogramLevels(),
          ]);

        setFinEntityOptions(mapToOptions(finEntityRes?.data, "FINDESC", "FIN_ENTITY"));
        setCompanyOptions(mapToOptions(companyRes?.data, "COMP_DESC", "COMP_ID"));
        setDepartmentOptions(mapToOptions(departmentRes?.data, "DEPT_DESC", "DEPT_ID" ));
        setDivisionOptions(mapToOptions(divisionRes?.data, "DIVSN_DESC", "DIVSN_ID"));
        setEmpLevelOptions(mapToOptions(empLevelRes?.data, "LEVL_DESC", "LEVL"));
        setOrgLevelOptions(mapToOptions(orgLevelRes?.data, "OLVL_DESC", "OLVL_ID"));
      } catch (error) {
        console.error("Load organogram masters error:", error);
        notifyError(error?.message || "Unable to load master data.");
      } finally {
        setLoadingMasters(false);
      }
    };

    loadMasters();
  }, []);

  /* ==========================================================
      LOAD DETAILS WHEN TOP "Select Orgonogram" DROPDOWN CHANGES
  ========================================================== */
  useEffect(() => {
    if (!organogramId) {
      setFormData(INITIAL_FORM_STATE);
      setErrors({});
      return;
    }

    const loadDetails = async () => {
      try {
        setLoadingDetails(true);
        const res = await getOrganogramDetails({ ID: organogramId });

        if (res?.status) {
          setFormData(mapOrganogramRowToFormData(res.data));
          setErrors({});
        } else {
          notifyError(res?.message || "Unable to load organogram details.");
        }
      } catch (error) {
        console.error("Load organogram details error:", error);
        notifyError(error?.message || "Unable to load organogram details.");
      } finally {
        setLoadingDetails(false);
      }
    };

    loadDetails();
  }, [organogramId]);

  /* ==========================================================
      CASCADE: DEPARTMENT -> DESIGNATION
      (fires both on manual selection AND after details load,
       since formData.DEPARTMENT_ID changes either way)
  ========================================================== */
  useEffect(() => {
    if (!formData.DEPARTMENT_ID) {
      setDesignationOptions([]);
      return;
    }

    const loadDesignations = async () => {
      try {
        setLoadingDesignations(true);
        const res = await getDesignations({ DEPARTMENT_ID: formData.DEPARTMENT_ID });
        setDesignationOptions(mapToOptions(res?.data, "LABEL", "ID"));
      } catch (error) {
        console.error("Load designations error:", error);
        notifyError(error?.message || "Unable to load designations.");
      } finally {
        setLoadingDesignations(false);
      }
    };

    loadDesignations();
  }, [formData.DEPARTMENT_ID]);

  /* ==========================================================
      CASCADE: DESIGNATION -> JD LABEL
  ========================================================== */
  useEffect(() => {
    if (!formData.DESIGNATION_ID) {
      setJdLabelOptions([]);
      return;
    }

    const loadJdLabels = async () => {
      try {
        setLoadingJdLabels(true);
        const res = await getJDLabels({
          DEPARTMENT_ID: formData.DEPARTMENT_ID,
          DESIGNATION_ID: formData.DESIGNATION_ID,
        });
        setJdLabelOptions(mapToOptions(res?.data, "LABEL", "ID"));
      } catch (error) {
        console.error("Load JD labels error:", error);
        notifyError(error?.message || "Unable to load JD labels.");
      } finally {
        setLoadingJdLabels(false);
      }
    };

    loadJdLabels();
  }, [formData.DEPARTMENT_ID, formData.DESIGNATION_ID]);

  /* ==========================================================
      FIELD CHANGE (resets dependent fields — manual edits only)
  ========================================================== */
  const handleFieldChange = useCallback((field, value) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "DEPARTMENT_ID") {
        next.DESIGNATION_ID = "";
        next.JD_LABEL_ID = "";
      }
      if (field === "DESIGNATION_ID") {
        next.JD_LABEL_ID = "";
      }
      return next;
    });

    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  /* ==========================================================
      VALIDATION / SAVE / CANCEL (unchanged from before)
  ========================================================== */
  const validate = useCallback(() => {
    const newErrors = {};
    const required = ["FIN_ENTITY_ID", "COMPANY_ID", "DEPARTMENT_ID", "DIVISION_ID", "EMP_LEVEL_ID", "ORG_LEVEL_ID"];
    required.forEach((field) => {
      if (!formData[field]) newErrors[field] = "This field is required.";
    });
    if (formData.POSITION_COUNT !== "" && Number.isNaN(Number(formData.POSITION_COUNT))) {
      newErrors.POSITION_COUNT = "Position count must be a number.";
    }
    if (formData.POSITION_OCCUPIED !== "" && Number.isNaN(Number(formData.POSITION_OCCUPIED))) {
      newErrors.POSITION_OCCUPIED = "Position occupied must be a number.";
    }
    if(formData.POSITION_OCCUPIED > formData.POSITION_COUNT) {
      newErrors.POSITION_OCCUPIED = "Position occupied must be less than Position count.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSave = useCallback(async (sendForAuth = false) => {
    if (!validate()) return;
    try {
      setSaving(true);
      let status = sendForAuth ? "T" : "N";

      if (sendForAuth && organogramId) {
          const [locationsRes, appraisalRes] = await Promise.all([
            getOrganogramLocations({ ID: organogramId }),
            getOrganogramApprLevels({ ID: organogramId }),
          ]);
        const locations = Array.isArray(locationsRes)
          ? locationsRes
          : Array.isArray(locationsRes?.data)
            ? locationsRes.data
            : [];
        const appraisalLevels = Array.isArray(appraisalRes)
          ? appraisalRes
          : Array.isArray(appraisalRes?.data)
            ? appraisalRes.data
            : [];
        const activeLocations = locations.filter((row) => {
          const rowStatus = normalizeOrganogramStatus(row.STATUS ?? row.status);
          return !["I", "INACTIVE", "0"].includes(rowStatus)
            && !row.TO_DATE
            && !row.EFFEC_TO;
        });
          const locationsWithReporting = await Promise.all(
            activeLocations.map(async (row) => {
              if (row.HAS_REPORTING || row.PARENT_LOCID || row.PARENT_ID) return true;
              if (!row.ID) return false;
              const reportingRes = await getOrgLocReportingRows({ LOC_ID: row.ID });
              const responseRows = Array.isArray(reportingRes)
                ? reportingRes
                : Array.isArray(reportingRes?.data)
                  ? reportingRes.data
                  : [];
              return responseRows.some((parent) => {
                const parentStatus = normalizeOrganogramStatus(parent.STATUS ?? parent.status);
                return !["I", "INACTIVE", "0"].includes(parentStatus)
                  && (parent.PARENT_LOCID || parent.PARENT_ID)
                  && !parent.EFFEC_TO
                  && !parent.TO_DATE;
              });
            })
          );
          const isReadyForAuthorization =
            activeLocations.length === Number(formData.POSITION_OCCUPIED || 0)
            && locationsWithReporting.every(Boolean)
            && appraisalLevels.length > 0;

          if (!isReadyForAuthorization) status = "N";
      }

      const payload = {
        ...formData,
        STATUS: status,
        ...(organogramId && { ID: organogramId }),
        mode: isEditMode ? "edit" : "add",
        sendForAuth,
      };
      const res = await saveOrganogram(payload);

      if (res?.status) {
        // Edit mode already knows its ID. Add mode needs it back from the API.
        // TODO: confirm the actual key your backend returns the new ID under —
        // assuming res.data.ID below; change if it's e.g. res.data.ORGANOGRAM_ID.
        const savedId = organogramId ?? res?.data?.ID ?? res?.task_id ?? res?.data?.id ?? null;

        const didSendForAuth = status === "T";
        notifySuccess(
          res?.message ||
          (didSendForAuth
              ? "Organogram saved and sent for authorization."
              : "Organogram saved successfully."),
          { onClose: () => onOrganogramSaved?.(savedId) }
        );
        
      } else {
        notifyError(res?.message || "Unable to save organogram.", {
          onClose: onOrganogramSaved,
        });
      }
    } catch (error) {
      console.error("Save organogram error:", error);
      notifyError(error?.message || "Unable to save organogram.", {
        onClose: onOrganogramSaved,
      });
    } finally {
      setSaving(false);
    }
  }, [formData, validate, organogramId, onOrganogramSaved, isEditMode]);

  const handleCancel = useCallback(() => {
    setFormData(organogramId ? INITIAL_FORM_STATE : INITIAL_FORM_STATE);
    setErrors({});
  }, [organogramId]);

  // status values are examples — match these to your actual enum
  const canSendForAuth = useMemo(() => {
    const status = normalizeOrganogramStatus(formData?.STATUS);
    return status === "N" || status === "R" || status === "REJECTED";
  }, [formData?.STATUS]);

  return {
    formData,
    errors,
    saving,
    loadingDetails,
    handleFieldChange,
    handleSave,
    handleCancel,
    finEntityOptions,
    companyOptions,
    departmentOptions,
    designationOptions,
    jdLabelOptions,
    divisionOptions,
    empLevelOptions,
    orgLevelOptions,
    loadingMasters,
    loadingDesignations,
    loadingJdLabels,
    isEditMode,
    canSendForAuth
  };
};

export default useOrganogramFormHandler;