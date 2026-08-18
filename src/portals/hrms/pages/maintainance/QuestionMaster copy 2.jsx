import { useEffect, useMemo, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { getQuestionMasterDataResponse } from "../../../../store/hrms/hrmsQuestionMasterSlice";
import SDLDataTable from "../../../../components/datatable/SDLDataTable";
import SDLSearch from "../../../../components/datatable/SDLSearch";
import BreadcrumbNav from "../../components/breadcrumb-nav/BreadcrumbNav";
import { getPortalFromPath } from "../../../../config/portalConfig";
import { getQuestionGroups, getAllQuestionSubGroups } from "../../services/questionService";
import { normalizeRecords, getDisplayValue } from "../../../../utils/formatUtils";
import { questionMasterColumns } from "../../portalutils/questionMasterColumns";
import { useQuestionMasterHandler } from "../../portalutils/useQuestionMasterHandler";
import { buildOptionsFromRow } from "../../portalutils/questionOptionsUtils";

const ANSWER_TYPES = ["Text", "Radio", "Checkbox"];

const QuestionMaster = () => {
  const dispatch = useDispatch();
  const [groups, setGroups] = useState([]);
  const [subgroups, setSubgroups] = useState([]);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    ID: "",
    QGRP_ID: "",
    QSGRP_ID: "",
    QUES_DESCR: "",
    ANSWER_TYPE: "Text",
    NO_OF_OPTIONS: "",
    OPTIONS: [],
  });

  const location = useLocation();
  const portal = getPortalFromPath(location.pathname);
  const portalHome = `/${portal.key}/dashboard`;
  const questionMasterData = useSelector((state) => state.hrmsquestionMasterData?.data);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    dispatch(getQuestionMasterDataResponse());
  }, [dispatch]);

  const loadLookups = useCallback(async () => {
    try {
      const [groupsRes, subGroupsRes] = await Promise.all([
        getQuestionGroups(),
        getAllQuestionSubGroups(),
      ]);
      const groupsRaw = groupsRes?.data || [];
      const subGroupsRaw = subGroupsRes?.data || [];

      setGroups(
        groupsRaw.map((g) => ({
          ID: String(g.QSGRP_ID ?? g.ID ?? g.id ?? ""),
          NAME: g.QSGRP_DESC ?? g.NAME ?? g.label ?? "",
        })),
      );

      setSubgroups(
        subGroupsRaw.map((s) => ({
          ID: String(s.QSSGRP_ID ?? s.ID ?? s.id ?? ""),
          NAME: s.QSSGRP_DESC ?? s.NAME ?? s.label ?? "",
        })),
      );
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    loadLookups();
  }, [loadLookups]);

  // NOTE: now depends on `groups` too, since QGRP_ID is resolved by
  // matching the question row's group description against the loaded groups list.
  const listData = useMemo(() => {
    try {
      return normalizeRecords(questionMasterData).map((item, index) => {
        // The API only returns a group *description* (QSGRP_DESC / GROUP_NAME),
        // never a group ID directly on the question row. Resolve the ID by
        // matching that description against the loaded `groups` lookup list.
        const groupDesc = getDisplayValue(
          item,
          ["QGRP_DESC", "GROUP_NAME", "group_name", "groupName", "QSGRP_DESC"],
          "-",
        );
        const matchedGroup = groups.find((g) => g.NAME === groupDesc);

        // OPTIONS comes back as a comma-separated string ("test1, test2"),
        // not an array — normalize it here so downstream .map() calls are safe.
        const rawOptions = item.OPTIONS ?? item.options ?? "";
        const optionsArr =
          typeof rawOptions === "string"
            ? rawOptions.split(",").map((o) => o.trim()).filter(Boolean)
            : Array.isArray(rawOptions)
            ? rawOptions
            : [];

        // RATING comes back as "Radio Box" / "Checkbox" / null etc, not matching
        // ANSWER_TYPES exactly — normalize via pattern match instead of exact match.
        const ratingRaw = getDisplayValue(
          item,
          ["ANSWER_TYPE", "answer_type", "RATING", "rating", "type"],
          "Text",
        );
        const answerType = /radio/i.test(ratingRaw)
          ? "Radio"
          : /check/i.test(ratingRaw)
          ? "Checkbox"
          : "Text";

        return {
          ID: item.ID ?? item.id ?? index,
          QGRP_ID: matchedGroup?.ID ?? "",
          QSGRP_ID: item.QSGRP_ID ?? item.SUBGROUP_ID ?? item.qsgrp_id ?? "",
          QUES_DESCR: getDisplayValue(item, ["QUES_DESCR", "QUESTION", "question", "ques_descr", "label"], "-"),
          GROUP_NAME: groupDesc,
          QSGRP_DESC: getDisplayValue(item, ["SUBGROUP_DESC", "subgroup_desc", "name", "label"], "-"),
          ANSWER_TYPE: answerType,
          NO_OF_OPTIONS: String(optionsArr.length || ""),
          OPTIONS: optionsArr,
          RATING: ratingRaw,
        };
      });
    } catch (error) {
      console.error(error);
      return [];
    }
  }, [questionMasterData, groups]);

  const resetForm = useCallback(() => {
    setIsEditing(false);
    setSelectedQuestion("");
    setForm({ ID: "", QGRP_ID: "", QSGRP_ID: "", QUES_DESCR: "", ANSWER_TYPE: "Text", NO_OF_OPTIONS: "", OPTIONS: [] });
    setErrors({});
  }, []);

  const {
    handleGroupChange,
    handleField,
    handleOptionChange,
    handleSave,
    handleEdit,
    handleSelectQuestion,
    handleDelete,
  } = useQuestionMasterHandler({
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
  });

  const filtered = useMemo(() => {
    if (!search.trim()) return listData;
    const q = search.trim().toLowerCase();
    return listData.filter(
      (r) =>
        (r.QUES_DESCR || r.QUESTION || "").toLowerCase().includes(q) ||
        (r.GROUP_NAME || "").toLowerCase().includes(q),
    );
  }, [search, listData]);

  const columns = useMemo(
    () => questionMasterColumns({ handleEdit, handleDelete, deletingId }),
    [handleEdit, handleDelete, deletingId],
  );

  return (
    <>
      <div className="page-header">
        <div className="add-item d-flex">
          <div className="page-title">
            <h4>Question Master</h4>
          </div>
        </div>

        <BreadcrumbNav
          items={[
            { text: "Home", link: portalHome },
            { text: "Question Master" },
          ]}
        />
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  {showAll && (
                    <div className="d-flex align-items-center" style={{ minWidth: "260px" }}>
                      <SDLSearch
                        value={search}
                        onChange={setSearch}
                        placeholder="Search Question..."
                        className="mb-0"
                        style={{ width: "100%" }}
                      />
                    </div>
                  )}
                </div>

                <div className="d-flex align-items-center gap-2">
                  <select
                    className="form-select"
                    value={selectedQuestion}
                    onChange={(e) => handleSelectQuestion(e.target.value, listData)}
                    style={{ minWidth: "220px" }}
                    disabled={loading}
                  >
                    <option value="">Select Question Master</option>
                    {listData.map((item) => (
                      <option key={item.ID} value={item.ID}>
                        {item.QUES_DESCR || item.QUESTION || ""}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    className="btn btn-outline-secondary d-flex align-items-center gap-2"
                    onClick={() => setShowAll((prev) => !prev)}
                    style={{ minWidth: "120px" }}
                  >
                    <i className={`fas ${showAll ? "fa-edit" : "fa-table"}`} />
                    {showAll ? "Form" : "Table"}
                  </button>
                </div>
              </div>

              {!showAll ? (
                <>
                  {isEditing && (
                    <div className="alert alert-info">You are updating an existing question.</div>
                  )}
                  <div className="row mb-3">
                    <div className="col-lg-4">
                      <label className="form-label">Question Group</label>
                      <select
                        className={`form-select ${errors.QGRP_ID ? "is-invalid" : ""}`}
                        value={form.QGRP_ID}
                        onChange={(e) => handleGroupChange(e.target.value)}
                      >
                        <option value="">Select Group</option>
                        {groups.map((g) => (
                          <option key={g.ID} value={g.ID}>{g.NAME}</option>
                        ))}
                      </select>
                      {errors.QGRP_ID && <div className="invalid-feedback">{errors.QGRP_ID}</div>}
                    </div>

                    <div className="col-lg-4">
                      <label className="form-label">Question Sub Group</label>
                      <select
                        className="form-select"
                        value={form.QSGRP_ID}
                        onChange={(e) => handleField("QSGRP_ID", e.target.value)}
                      >
                        <option value="">Select Sub Group</option>
                        {subgroups.map((s) => (
                          <option key={s.ID} value={s.ID}>{s.NAME}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-lg-4">
                      <label className="form-label">Answer Type</label>
                      <select
                        className="form-select"
                        value={form.ANSWER_TYPE}
                        onChange={(e) => handleField("ANSWER_TYPE", e.target.value)}
                      >
                        {ANSWER_TYPES.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-lg-8">
                      <label className="form-label">Question</label>
                      <input
                        type="text"
                        className={`form-control ${errors.QUES_DESCR ? "is-invalid" : ""}`}
                        value={form.QUES_DESCR}
                        onChange={(e) => handleField("QUES_DESCR", e.target.value)}
                      />
                      {errors.QUES_DESCR && <div className="invalid-feedback">{errors.QUES_DESCR}</div>}
                    </div>

                    {form.ANSWER_TYPE !== "Text" && (
                      <div className="col-lg-4">
                        <label className="form-label">Number of Options</label>
                        <select
                          className={`form-select ${errors.NO_OF_OPTIONS ? "is-invalid" : ""}`}
                          value={form.NO_OF_OPTIONS}
                          onChange={(e) => handleField("NO_OF_OPTIONS", e.target.value)}
                        >
                          <option value="">Select</option>
                          {[2, 3, 4, 5].map((n) => (
                            <option key={n} value={String(n)}>{n}</option>
                          ))}
                        </select>
                        {errors.NO_OF_OPTIONS && <div className="invalid-feedback">{errors.NO_OF_OPTIONS}</div>}
                      </div>
                    )}
                  </div>

                  {form.ANSWER_TYPE !== "Text" &&
                    (form.OPTIONS || []).map((opt, idx) => (
                      <div className="row mb-2" key={idx}>
                        <div className="col-lg-8">
                          <div className="input-group">
                            {form.ANSWER_TYPE === "Radio" && (
                              <span className="input-group-text">
                                <input
                                  type="radio"
                                  name="defaultOption"
                                  checked={form.DEFAULT_OPTION === idx}
                                  onChange={() => setForm((p) => ({ ...p, DEFAULT_OPTION: idx }))}
                                />
                              </span>
                            )}
                            <input
                              className={`form-control ${errors[`OPTION_${idx}`] ? "is-invalid" : ""}`}
                              value={opt}
                              onChange={(e) => handleOptionChange(idx, e.target.value)}
                            />
                            {errors[`OPTION_${idx}`] && (
                              <div className="invalid-feedback">{errors[`OPTION_${idx}`]}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                  <div className="text-end mb-3">
                    <button className="btn btn-secondary me-2" type="button" onClick={resetForm}>
                      Cancel
                    </button>
                    <button className="btn btn-primary" type="button" onClick={handleSave} disabled={loading}>
                      {loading ? "Processing..." : isEditing ? "Update" : "Save"}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {filtered.length === 0 ? (
                    <div className="p-4 text-center text-muted">No records found</div>
                  ) : (
                    <div className="table-responsive">
                      <SDLDataTable data={filtered} columns={columns} loading={false} />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default QuestionMaster;