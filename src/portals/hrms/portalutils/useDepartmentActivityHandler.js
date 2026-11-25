import { useCallback } from "react";
import { saveDeptActivity, deleteDeptActivity } from "../services/departmentActivityService";
import { notifySuccess, notifyError, confirmAction } from "../../../shared/services/alertService";
import { validateDigits } from "../../../shared/validation";
import { handleError } from "../../../shared/services/errorHandler";

export const useDepartmentActivityHandler = ({
  form,
  setForm,
  setErrors,
  setIsSubmitting,
  setDeletingId,
  dispatch,
  getDeptActivitiesDataResponse,
  setSelectedPair,
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

    const actDescRaw = String(form.ACT_DESC ?? "").trim();
    if (!actDescRaw) {
      newErrors.ACT_DESC = "Department Activity is required";
    } else if (actDescRaw.length > 100) {
      newErrors.ACT_DESC = "Department Activity must not exceed 100 characters";
    }

    const seqError = validateDigits(form.DISP_SEQ, {
      label: "Sequence",
      required: true,
      minValue: 1,
      maxValue: 100,
      messages: { invalid: "Sequence must be a whole number" },
    });
    if (seqError) newErrors.DISP_SEQ = seqError;

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
    setSelectedPair(JSON.stringify([
      activity.DEPT_ID != null ? String(activity.DEPT_ID) : "",
      String(activity.ACT_TYPE || ""),
    ]));
    setIsEditing(true);
    setShowAll(false);
    setForm({
      ID: activity.ID,
      DEPT_ID: activity.DEPT_ID != null ? String(activity.DEPT_ID) : "",
      ACT_TYPE: activity.ACT_TYPE || "",
      DISP_SEQ: activity.DISP_SEQ ?? "",
      ACT_DESC: activity.ACT_DESC,
    });
  }, [setSelectedPair, setIsEditing, setShowAll, setForm]);

  const handleDeleteActivity = useCallback(async (row) => {
    try {
      const result = await confirmAction("Are you sure you want to Delete?");
      if (!result) return;

      setDeletingId(row.ID);
      const response = await deleteDeptActivity({ ID: row.ID });

      if (response?.status) {
        notifySuccess(response?.message || "Record deleted successfully.");
      } else {
        notifyError(response?.message || "Unable to delete record.");
      }

      dispatch(getDeptActivitiesDataResponse());
    } catch (err) {
      handleError(err, { context: "Delete department activity", fallback: "Unable to delete record." });
    } finally {
      setDeletingId(null);
    }
  }, [dispatch, getDeptActivitiesDataResponse, setDeletingId]);

  return {
    handleFieldChange,
    validateForm,
    handleSave,
    handleEditActivity,
    handleDeleteActivity,
  };
};