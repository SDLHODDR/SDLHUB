import { useState, useEffect, useCallback } from "react";
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
  saveOrganogram,
} from "../services/orgonogramService";
import { notifyError, notifySuccess } from "../../../services/alertService";

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
});

const mapToOptions = (list = [], labelKey = "LABEL", valueKey = "ID") =>
  Array.isArray(list)
    ? list.map((item) => ({ label: item[labelKey] ?? "", value: item[valueKey] }))
    : [];

const useOrganogramFormHandler = (organogramId) => {
  /* ==========================================================
      FORM STATE
  ========================================================== */
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  /* ==========================================================
      DROPDOWN OPTIONS
  ========================================================== */
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

  /* ==========================================================
      INITIAL MASTER DATA LOAD
      Fin Entity, Company, Department, Division, Emp Level, Org Level
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

        setFinEntityOptions(mapToOptions(finEntityRes?.data, "FINDESC", "FIN_ENTITY" ));
        setCompanyOptions(mapToOptions(companyRes?.data, "COMP_DESC", "COMP_ID"));
        setDepartmentOptions(mapToOptions(departmentRes?.data, "DEPT_DESC", "DEPT_ID"));
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
      CASCADE: DEPARTMENT -> DESIGNATION
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
        setDesignationOptions(mapToOptions(res?.data));
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
        const res = await getJDLabels({ DESIGNATION_ID: formData.DESIGNATION_ID });
        setJdLabelOptions(mapToOptions(res?.data));
      } catch (error) {
        console.error("Load JD labels error:", error);
        notifyError(error?.message || "Unable to load JD labels.");
      } finally {
        setLoadingJdLabels(false);
      }
    };

    loadJdLabels();
  }, [formData.DESIGNATION_ID]);

  /* ==========================================================
      FIELD CHANGE (resets dependent fields)
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
      VALIDATION
  ========================================================== */
  const validate = useCallback(() => {
    const newErrors = {};
    const required = [
      "FIN_ENTITY_ID",
      "COMPANY_ID",
      "DEPARTMENT_ID",
      "DIVISION_ID",
      "EMP_LEVEL_ID",
      "ORG_LEVEL_ID",
    ];

    required.forEach((field) => {
      if (!formData[field]) newErrors[field] = "This field is required.";
    });

    if (formData.POSITION_COUNT !== "" && Number.isNaN(Number(formData.POSITION_COUNT))) {
      newErrors.POSITION_COUNT = "Position count must be a number.";
    }
    if (formData.POSITION_OCCUPIED !== "" && Number.isNaN(Number(formData.POSITION_OCCUPIED))) {
      newErrors.POSITION_OCCUPIED = "Position occupied must be a number.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  /* ==========================================================
      SAVE / CANCEL
  ========================================================== */
  const handleSave = useCallback(async () => {
    if (!validate()) return;

    try {
      setSaving(true);
      const res = await saveOrganogram(formData);

      if (res?.status) {
        notifySuccess(res?.message || "Organogram saved successfully.");
        setFormData(INITIAL_FORM_STATE);
        setErrors({});
      } else {
        notifyError(res?.message || "Unable to save organogram.");
      }
    } catch (error) {
      console.error("Save organogram error:", error);
      notifyError(error?.message || "Unable to save organogram.");
    } finally {
      setSaving(false);
    }
  }, [formData, validate]);

  const handleCancel = useCallback(() => {
    setFormData(INITIAL_FORM_STATE);
    setErrors({});
  }, []);

  return {
    formData,
    errors,
    saving,
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
  };
};

export default useOrganogramFormHandler;