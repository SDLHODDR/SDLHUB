import { useCallback } from "react";
import { savePolicy, publishPolicy, getPolicyAssociations } from "../services/policyService";
import { notifySuccess, notifyError, confirmAction } from "../../../services/alertService";
import { validateDocFile } from "./policyOptionsUtils";
import { toDateInputValue } from "../../../utils/formatUtils";
import moment from "moment";

export const usePolicyHandler = ({
  formData,
  setFormData,
  setErrors,
  setIsSubmitting,
  dispatch,
  getPolicyDataResponse,
  setShowAll,
  setSelectedPolicy,
  setIsEditing,
  resetForm,
}) => {
  const formatDateForForm = (value) => {
      if (!value) return "";
  
      if (moment.isMoment(value)) {
        return value.format("YYYY-MM-DD");
      }
  
      if (value instanceof Date) {
        if (Number.isNaN(value.getTime())) return "";
  
        return moment(value).format("YYYY-MM-DD");
      }
  
      const str = String(value);
  
      if (!str) return "";
  
      /*
       * Already YYYY-MM-DD
       */
      if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
        return str;
      }
  
      const parsed = moment(str);
  
      return parsed.isValid()
        ? parsed.format("YYYY-MM-DD")
        : "";
    };

  const handleFieldChange = useCallback((name, value) => {
    if(name === "START_DATE" || name === "END_DATE")
    {
      const formatted = formatDateForForm(value);
      value = formatted;
    }
     
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }, [setFormData, setErrors]);

  const handleMultiSelectChange = useCallback((name, selectedOptions) => {
    const values = Array.from(selectedOptions).map((opt) => opt.value);
    setFormData((prev) => ({ ...prev, [name]: values }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }, [setFormData, setErrors]);

  const handleFileChange = useCallback((file) => {
    const fileError = validateDocFile(file);
    if (fileError) {
      setErrors((prev) => ({ ...prev, doc: fileError }));
      return false;
    }
    setFormData((prev) => ({ ...prev, doc: file }));
    setErrors((prev) => ({ ...prev, doc: "" }));
    return true;
  }, [setFormData, setErrors]);

  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.COMP_NAME) newErrors.COMP_NAME = "Company is required";
    if (!formData.POLICY_NAME || !formData.POLICY_NAME.trim()) newErrors.POLICY_NAME = "Policy name is required";
    if (!formData.START_DATE) newErrors.START_DATE = "Start date is required";
    if (!formData.END_DATE) newErrors.END_DATE = "End date is required";
    if (formData.START_DATE && formData.END_DATE && formData.END_DATE < formData.START_DATE) {
      newErrors.END_DATE = "End date cannot be before start date";
    }
    if (!formData.POLICY_DESC || !formData.POLICY_DESC.trim()) newErrors.POLICY_DESC = "Policy description is required";
    if (!formData.doc && !formData.DOC_PATH) newErrors.doc = "Document upload is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, setErrors]);

  const buildFormPayload = useCallback(() => {
    const payload = new FormData();
    payload.append("id", formData.ID || "");
    payload.append("COMP_NAME", formData.COMP_NAME || "");
    (formData.DEPT_ID || []).forEach((id) => payload.append("DEPT_ID[]", id));
    (formData.DIVISION_ID || []).forEach((id) => payload.append("DIVISION_ID[]", id));
    payload.append("POLICY_NAME", formData.POLICY_NAME || "");
    payload.append("START_DATE", formData.START_DATE || "");
    payload.append("END_DATE", formData.END_DATE || "");
    payload.append("POLICY_DESC", formData.POLICY_DESC || "");
    payload.append("IS_MANDAT", formData.IS_MANDAT ? "Y" : "N");
    if (formData.doc) payload.append("doc", formData.doc);
    return payload;
  }, [formData]);

  const handleSave = useCallback(async (e) => {
    e?.preventDefault?.();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const response = await savePolicy(buildFormPayload());

      if (response?.status) {
        notifySuccess(response?.message || "Policy saved successfully.");
        resetForm();
        dispatch(getPolicyDataResponse());
        setShowAll(true);
      } else {
        notifyError(response?.message || "Unable to save policy.");
      }
    } catch (error) {
      console.error("Save Error:", error);
      notifyError("Something went wrong while saving policy.");
    } finally {
      setIsSubmitting(false);
    }
  }, [validateForm, buildFormPayload, setIsSubmitting, dispatch, getPolicyDataResponse, resetForm, setShowAll]);

  // const handlePublish = useCallback(async (row) => {
  //   const result = await confirmAction("Are you sure you want to Publish this policy?");
  //   if (!result?.isConfirmed) return;

  //   try {
  //     const response = await publishPolicy({ ID: row.ID });
  //     if (response?.status) {
  //       notifySuccess(response?.message || "Policy published successfully.");
  //       dispatch(getPolicyDataResponse());
  //     } else {
  //       notifyError(response?.message || "Unable to publish policy.");
  //     }
  //   } catch (error) {
  //     console.error("Publish Error:", error);
  //     notifyError("Something went wrong while publishing policy.");
  //   }
  // }, [dispatch, getPolicyDataResponse]);

  const handlePublish = useCallback(async (row) => {
    const result = await confirmAction("Are you sure you want to Publish this policy?");
    if (!result?.isConfirmed) return;

    try {
      const response = await publishPolicy({ ID: row.ID });
      if (response?.status) {
        notifySuccess(response?.message || "Policy published successfully.");
        dispatch(getPolicyDataResponse());
        resetForm();
        setShowAll(true);
      } else {
        notifyError(response?.message || "Unable to publish policy.");
      }
    } catch (error) {
      console.error("Publish Error:", error);
      notifyError("Something went wrong while publishing policy.");
    }
  }, [dispatch, getPolicyDataResponse, resetForm, setShowAll]);

  const handleEdit = useCallback(async (row) => {
    setSelectedPolicy(row.ID);
    setIsEditing(true);
    setShowAll(false);
    setFormData({
      ID: row.ID,
      COMP_NAME: row.COMP_NAME || "",
      DEPT_ID: [],
      DIVISION_ID: [],
      POLICY_NAME: row.POLICY_NAME || "",
      START_DATE: toDateInputValue(row.START_DATE_RAW || ""),
      END_DATE: toDateInputValue(row.END_DATE_RAW || ""),
      POLICY_DESC: row.POLICY_DESC || "",
      IS_MANDAT: row.IS_MANDAT === "Y",
      DOC_PATH: row.DOC_PATH || "",
      doc: null,
      STATUS: row.STATUS || "N",
    });
    // Department/Division live in junction tables, not on the list row —
    // fetch them only now, on edit, rather than joining on every list row.
    try {
      const response = await getPolicyAssociations({ ID: row.ID });
      if (response?.status) {
        setFormData((prev) => ({
          ...prev,
          DEPT_ID: response.data?.DEPT_ID || [],
          DIVISION_ID: response.data?.DIVISION_ID || [],
        }));
      } else {
        notifyError(response?.message || "Unable to load department/division for this policy.");
      }
    } catch (error) {
      console.error("Fetch policy associations error:", error);
      notifyError("Something went wrong while loading department/division.");
    }
  }, [setSelectedPolicy, setIsEditing, setShowAll, setFormData]);

  return {
    handleFieldChange,
    handleMultiSelectChange,
    handleFileChange,
    handleSave,
    handlePublish,
    handleEdit,
  };
};