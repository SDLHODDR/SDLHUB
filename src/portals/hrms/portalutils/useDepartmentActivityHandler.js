import { useCallback } from "react";
import { saveDeptActivity, deleteDeptActivity } from "../services/departmentActivityService";
import { notifySuccess, notifyError, confirmAction } from "../../../services/alertService";

export const useDepartmentActivityHandler = ({
  form,
  setForm,
  setErrors,
  setIsSubmitting,
  setDeletingId,
  dispatch,
  getDeptActivitiesDataResponse,
  listData,
  setSelectedActivity,
  setIsEditing,
  setShowAll,
  resetForm,
}) => {
  const handleFieldChange = useCallback((name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }, [setForm, setErrors]);

  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!form.DEPT_ID || String(form.DEPT_ID).trim() === "") {
      newErrors.DEPT_ID = "Department Master is required";
    }
    if (!form.ACT_TYPE || String(form.ACT_TYPE).trim() === "") {
      newErrors.ACT_TYPE = "Type is required";
    }
    if (!form.ACT_DESC || String(form.ACT_DESC).trim() === "") {
      newErrors.ACT_DESC = "Department Activity is required";
    }

    const seqRaw = String(form.DISP_SEQ).trim();
    if (!seqRaw) {
      newErrors.DISP_SEQ = "Sequence is required";
    } else if (!/^\d+$/.test(seqRaw)) {
      newErrors.DISP_SEQ = "Sequence must be a whole number";
    } else {
      const seqNum = Number(seqRaw);
      if (seqNum < 1 || seqNum > 100) {
        newErrors.DISP_SEQ = "Sequence must be between 1 and 100";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form, setErrors]);

  const handleSave = useCallback(async (e) => {
    e?.preventDefault?.();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        ...form,
        DISP_SEQ: Number(form.DISP_SEQ),
      };

      const response = await saveDeptActivity(payload);

      if (response?.status) {
        notifySuccess(response?.message || "Department Activity saved successfully.");
        resetForm();
        dispatch(getDeptActivitiesDataResponse());
        setShowAll(true);
      } else {
        notifyError(response?.message || "Unable to save Department Activity");
      }
    } catch (err) {
      console.error("Save Error:", err);
      notifyError("Something went wrong while saving data.");
    } finally {
      setIsSubmitting(false);
    }
  }, [form, validateForm, setIsSubmitting, dispatch, getDeptActivitiesDataResponse, resetForm, setShowAll]);

  const handleEditActivity = useCallback((activity) => {
    setSelectedActivity(activity.ID);
    setIsEditing(true);
    setShowAll(false);
    setForm({
      ID: activity.ID,
      DEPT_ID: activity.DEPT_ID != null ? String(activity.DEPT_ID) : "",
      ACT_TYPE: activity.ACT_TYPE || "",
      DISP_SEQ: activity.DISP_SEQ ?? "",
      ACT_DESC: activity.ACT_DESC,
    });
  }, [setSelectedActivity, setIsEditing, setShowAll, setForm]);

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
      setForm({
        ID: activity.ID,
        DEPT_ID: activity.DEPT_ID != null ? String(activity.DEPT_ID) : "",
        ACT_TYPE: activity.ACT_TYPE || "",
        DISP_SEQ: activity.DISP_SEQ ?? "",
        ACT_DESC: activity.ACT_DESC,
      });
    }
  }, [listData, setSelectedActivity, resetForm, setShowAll, setIsEditing, setForm]);

  const handleDeleteActivity = useCallback(async (row) => {
    try {
      const result = await confirmAction("Are you sure you want to Delete?");
      if (!result?.isConfirmed) return;

      setDeletingId(row.ID);
      const response = await deleteDeptActivity({ ID: row.ID });

      if (response?.status) {
        notifySuccess(response?.message || "Record deleted successfully.");
      } else {
        notifyError(response?.message || "Unable to delete record.");
      }

      dispatch(getDeptActivitiesDataResponse());
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  }, [dispatch, getDeptActivitiesDataResponse, setDeletingId]);

  return {
    handleFieldChange,
    validateForm,
    handleSave,
    handleEditActivity,
    handleSelectActivity,
    handleDeleteActivity,
  };
};