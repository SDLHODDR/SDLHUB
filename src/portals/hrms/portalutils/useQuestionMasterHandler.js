import { useCallback } from "react";
import { saveQuestion, deleteQuestion } from "../services/questionService";
import { notifySuccess, notifyError, confirmAction } from "../../../services/alertService";
import { buildOptionsFromRow } from "./questionOptionsUtils";

const ANSWER_TYPES_WITH_OPTIONS = ["Radio", "Checkbox"];

export const useQuestionMasterHandler = ({
  form,
  setForm,
  setErrors,
  setLoading,
  setDeletingId,
  dispatch,
  getQuestionMasterDataResponse,
  setShowAll,
  setSelectedQuestion,
  setIsEditing,
  resetForm,
}) => {
  const handleGroupChange = useCallback((val) => {
    setForm((p) => ({ ...p, QGRP_ID: val, QSGRP_ID: "" }));
  }, [setForm]);

  const handleField = useCallback((name, value) => {
    setForm((p) => {
      const next = { ...p, [name]: value };
      if (name === "ANSWER_TYPE" && value === "Text") {
        next.NO_OF_OPTIONS = "";
        next.OPTIONS = [];
      }
      if (name === "NO_OF_OPTIONS") {
        const n = parseInt(value, 10) || 0;
        next.OPTIONS = Array.from({ length: n }, (_, i) => p.OPTIONS[i] || "");
      }
      return next;
    });
    setErrors((e) => ({ ...e, [name]: "" }));
  }, [setForm, setErrors]);

  const handleOptionChange = useCallback((index, value) => {
    setForm((p) => {
      const opts = [...(p.OPTIONS || [])];
      opts[index] = value;
      return { ...p, OPTIONS: opts };
    });
  }, [setForm]);

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!form.QGRP_ID) newErrors.QGRP_ID = "Group required";
    //if (!form.QUES_DESCR || !form.QUES_DESCR.trim()) newErrors.QUES_DESCR = "Question required";
    const actDescRaw = String(form.QUES_DESCR ?? "").trim();
    if (!actDescRaw) {
      newErrors.QUES_DESCR = "Question is required";
    } else if (actDescRaw.length > 1000) {
      newErrors.QUES_DESCR = "Question must not exceed 1000 characters";
    }

    if (ANSWER_TYPES_WITH_OPTIONS.includes(form.ANSWER_TYPE)) {
      if (!form.NO_OF_OPTIONS) newErrors.NO_OF_OPTIONS = "Number of options required";
      (form.OPTIONS || []).forEach((o, i) => {
        const optRaw = String(o ?? "").trim();
        if (!optRaw) {
          newErrors[`OPTION_${i}`] = "Option required";
        } else if (optRaw.length > 500) {
          newErrors[`OPTION_${i}`] = "Option must not exceed 500 characters";
        }
        //if (!o || !o.trim()) newErrors[`OPTION_${i}`] = "Option required";
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form, setErrors]);

  const handleSave = useCallback(async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const optionPayload = (form.OPTIONS || []).reduce((acc, option, index) => {
        acc[`opts_${index + 1}`] = option;
        return acc;
      }, {});

      const payload = {
        ID: form.ID,
        QGRP_ID: form.QGRP_ID,
        QSGRP_ID: form.QSGRP_ID,
        QUES_DESCR: form.QUES_DESCR,
        rateyn: form.ANSWER_TYPE === "Text" ? "N" : "Y",
        noopts: form.ANSWER_TYPE === "Text" ? 0 : Number(form.NO_OF_OPTIONS) || 0,
        answer_type: form.ANSWER_TYPE,
        ...optionPayload,
      };

      const res = await saveQuestion(payload);
      if (res?.status) {
        notifySuccess(res?.message || "Question saved");
        dispatch(getQuestionMasterDataResponse());
        setShowAll(true);
        resetForm();
      } else {
        notifyError(res?.message || "Unable to save question");
      }
    } catch (err) {
      console.error(err);
      notifyError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [form, validateForm, setLoading, dispatch, getQuestionMasterDataResponse, setShowAll, resetForm]);

  const handleEdit = useCallback((row) => {
    console.log("==========EDIT ROW===========", row);
    setSelectedQuestion(row.ID);
    setIsEditing(true);
    setShowAll(false);
    setForm({
      ID: row.ID,
      QGRP_ID: row.QGRP_ID || row.GROUP_ID || "",
      QSGRP_ID: row.QSGRP_ID || row.SUBGROUP_ID || "",
      QUES_DESCR: row.QUES_DESCR || row.QUESTION || "",
      ANSWER_TYPE: row.ANSWER_TYPE || row.answer_type || "Text",
      NO_OF_OPTIONS: row.NO_OF_OPTIONS || row.noopts || row.no_of_options || "",
      OPTIONS: buildOptionsFromRow(row),
    });
  }, [setSelectedQuestion, setIsEditing, setShowAll, setForm]);

  const handleSelectQuestion = useCallback((value, listData) => {
    setSelectedQuestion(value);

    if (!value) {
      resetForm();
      return;
    }

    const selected = listData.find((item) => String(item.ID) === String(value));
    if (!selected) return;

    handleEdit(selected);
  }, [setSelectedQuestion, resetForm, handleEdit]);

  const handleDelete = useCallback(async (row) => {
    const result = await confirmAction("Are you sure you want to Delete?");
    if (!result?.isConfirmed) return;

    try {
      setDeletingId(row.ID);
      const res = await deleteQuestion({ ID: row.ID });
      if (res?.status) {
        notifySuccess(res?.message || "Deleted");
        dispatch(getQuestionMasterDataResponse());
      } else {
        notifyError(res?.message || "Unable to delete");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  }, [setDeletingId, dispatch, getQuestionMasterDataResponse]);

  return {
    handleGroupChange,
    handleField,
    handleOptionChange,
    handleSave,
    handleEdit,
    handleSelectQuestion,
    handleDelete,
  };
};