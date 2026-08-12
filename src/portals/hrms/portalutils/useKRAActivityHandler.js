import { useCallback } from "react";
import { saveKRAActivity, deleteKRAActivity } from "../services/kraActivityService";
import { notifySuccess, notifyError, confirmAction } from "../../../services/alertService";

export const useKRAActivityHandler = ({
  formData,
  setFormData,
  setErrors,
  validateForm,
  setIsSubmitting,
  setDeletingId,
  dispatch,
  getKRAActivityDataResponse,
  listData,
  setSelectedActivity,
  setIsEditing,
  setShowAll,
  resetForm,
}) => {
  const handleFieldChange = useCallback((name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }, [setFormData, setErrors]);

  const handleSave = useCallback(async (e) => {
    e?.preventDefault?.();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const response = await saveKRAActivity({ ...formData });

      if (response?.status) {
        notifySuccess(response?.message || "KRA Activity saved successfully.");
        resetForm();
        dispatch(getKRAActivityDataResponse());
        setShowAll(true);
      } else {
        notifyError(response?.message || "Unable to save KRA Activity");
      }
    } catch (err) {
      console.error("Save Error:", err);
      notifyError("Something went wrong while saving data.");
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, setIsSubmitting, dispatch, getKRAActivityDataResponse, resetForm, setShowAll]);

  const handleEditActivity = useCallback((activity) => {
    setSelectedActivity(activity.ID);
    setIsEditing(true);
    setShowAll(false);
    setFormData({
      ID: activity.ID,
      KRA_ID: activity.KRA_ID || "",
      KRA_DESC: activity.KRA_DESC,
      ACTT_DESC: activity.ACTT_DESC,
    });
  }, [setSelectedActivity, setIsEditing, setShowAll, setFormData]);

  const handleSelectActivity = useCallback((value) => {
    setSelectedActivity(value);

    if (!value) {
      resetForm();
      return;
    }

    setShowAll(false);
    const activity = listData.find((item) => String(item.ID) === String(value));
    if (activity) {
      setIsEditing(true);
      setFormData({
        ID: activity.ID,
        KRA_ID: activity.KRA_ID || "",
        KRA_DESC: activity.KRA_DESC,
        ACTT_DESC: activity.ACTT_DESC,
      });
    }
  }, [listData, setSelectedActivity, resetForm, setShowAll, setIsEditing, setFormData]);

  const handleDeleteActivity = useCallback(async (row) => {
    try {
      const result = await confirmAction("Are you sure you want to Delete?");
      if (!result?.isConfirmed) return;

      setDeletingId(row.ID);
      const response = await deleteKRAActivity({ ID: row.ID });

      if (response?.status) {
        notifySuccess(response?.message || "Record deleted successfully.");
      } else {
        notifyError(response?.message || "Unable to delete record.");
      }
      dispatch(getKRAActivityDataResponse());
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  }, [dispatch, getKRAActivityDataResponse, setDeletingId]);

  return {
    handleFieldChange,
    handleSave,
    handleSelectActivity,
    handleEditActivity,
    handleDeleteActivity,
  };
};