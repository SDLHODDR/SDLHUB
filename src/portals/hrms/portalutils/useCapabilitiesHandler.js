import { useCallback } from "react";
import { saveCapabilities } from "../services/capablitiesService";
import { notifySuccess, notifyError } from "../../../services/alertService";

export const useCapabilitiesHandler = ({
  formData,
  setFormData,
  setErrors,
  setIsSubmitting,
  dispatch,
  getCapabilitiesDataResponse,
  setShowAll,
  setSelectedCapability,
  setIsEditing,
  resetForm,
  list,
}) => {
  const handleFieldChange = useCallback((name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }, [setFormData, setErrors]);

  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.CAPA_CODE || String(formData.CAPA_CODE).trim() === "") {
      newErrors.CAPA_CODE = "Capabilities code is required";
    }
    if (!formData.CAPA_DESC || String(formData.CAPA_DESC).trim() === "") {
      newErrors.CAPA_DESC = "Description is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, setErrors]);

  const handleSave = useCallback(async (e) => {
    e?.preventDefault?.();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        ID: formData.CAPA_ID,
        CAPA_ID: formData.CAPA_ID,
        CAPA_CODE: formData.CAPA_CODE,
        CAPA_DESC: formData.CAPA_DESC,
      };

      const response = await saveCapabilities(payload);

      if (response?.status) {
        notifySuccess(response?.message || "Capabilities saved successfully.");
        resetForm();
        dispatch(getCapabilitiesDataResponse());
        setShowAll(true);
      } else {
        notifyError(response?.message || "Unable to save capabilities.");
      }
    } catch (error) {
      console.error("Save error:", error);
      notifyError("Something went wrong while saving capabilities.");
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, setIsSubmitting, dispatch, getCapabilitiesDataResponse, resetForm, setShowAll]);

  const handleEdit = useCallback((row) => {
    setSelectedCapability(String(row.CAPA_ID ?? row.ID ?? row.id));
    setIsEditing(true);
    setShowAll(false);
    setFormData({
      CAPA_ID: row.CAPA_ID ?? row.ID ?? row.id ?? "",
      CAPA_CODE: row.CAPA_CODE || row.code || "",
      CAPA_DESC: row.CAPA_DESC || row.description || row.DESCR || "",
    });
  }, [setSelectedCapability, setIsEditing, setShowAll, setFormData]);

  const handleSelectCapability = useCallback((value) => {
    setSelectedCapability(value);

    if (!value) {
      resetForm();
      return;
    }

    setShowAll(false);

    const selected = list.find(
      (item) => String(item.CAPA_CODE_DISPLAY) === String(value),
    );
    if (selected) {
      setIsEditing(true);
      setFormData({
        CAPA_ID: selected.CAPA_ID ?? selected.ID ?? selected.id ?? "",
        CAPA_CODE: selected.CAPA_CODE_DISPLAY || "",
        CAPA_DESC: selected.CAPA_DESC_DISPLAY || "",
      });
    }
  }, [list, setSelectedCapability, resetForm, setShowAll, setIsEditing, setFormData]);

  return {
    handleFieldChange,
    validateForm,
    handleSave,
    handleEdit,
    handleSelectCapability,
  };
};