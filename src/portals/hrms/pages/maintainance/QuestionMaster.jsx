import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { getQuestionMasterDataResponse } from "../../../../store/hrms/hrmsQuestionMasterSlice";
import SDLDataTable from "../../../../components/datatable/SDLDataTable";
import SDLSearch from "../../../../components/datatable/SDLSearch";
import SDLDropdownSelect from "../../components/forms/SDLDropdownSelect";
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

  const listData = useMemo(() => {
    try {
      return normalizeRecords(questionMasterData).map((item, index) => {
        const rawOptions = item.OPTIONS ?? item.options ?? "";
        const optionsArr =
          typeof rawOptions === "string"
            ? rawOptions.split(",").map((o) => o.trim()).filter(Boolean)
            : Array.isArray(rawOptions)
            ? rawOptions
            : [];

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
          QGRP_ID: String(
            item.QGRP_ID ?? item.GROUP_ID ?? item.QSGRP_ID ?? item.qgrp_id ?? "",
          ),
          QSGRP_ID: String(item.QSSGRP_ID ?? item.SUBGROUP_ID ?? item.qssgrp_id ?? ""),
          QUES_DESCR: getDisplayValue(item, ["QUES_DESCR", "QUESTION", "question", "ques_descr", "label"], "-"),
          GROUP_NAME: getDisplayValue(item, ["QSGRP_DESC", "GROUP_NAME", "group_name", "groupName"], "-"),
          // Renamed from QSGRP_DESC (which collided with the API's group
          // field name above and was overwriting it downstream in the
          // table) to SUBGROUP_NAME, which unambiguously holds QSSGRP_DESC.
          SUBGROUP_NAME: getDisplayValue(item, ["QSSGRP_DESC", "SUBGROUP_DESC", "subgroup_desc", "name"], "-"),
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
  }, [questionMasterData]);

  // (1) Top "Select Question Master" — keyword-searchable, same pattern as
  // the other pages' top selectors.
  const questionOptions = useMemo(
    () => listData.map((item) => ({ id: String(item.ID), label: item.QUES_DESCR || item.QUESTION || "" })),
    [listData],
  );

  // Table-mode search — driven only by the visible SDLSearch box.
  const filtered = useMemo(() => {
    if (!search.trim()) return listData;
    const q = search.trim().toLowerCase();
    return listData.filter(
      (r) =>
        (r.QUES_DESCR || r.QUESTION || "").toLowerCase().includes(q) ||
        (r.GROUP_NAME || "").toLowerCase().includes(q),
    );
  }, [search, listData]);

  // (2)-(6) Form-mode search — driven by typing in (or selecting from) the
  // Question Group / Question Sub Group dropdowns. No "add new" for either
  // (point 3) — these stay pure search-and-select.
  //
  // Filter is cumulative:
  //   - Group match narrows by QGRP_ID          (point 4)
  //   - Sub Group match narrows further by QSGRP_ID (point 5)
  //   - Currently selected Answer Type narrows further still (point 6)
  const [groupSearchQuery, setGroupSearchQuery] = useState("");
  const [subGroupSearchQuery, setSubGroupSearchQuery] = useState("");

  const matchedGroupIds = useMemo(() => {
    if (!groupSearchQuery.trim()) return null;
    const q = groupSearchQuery.trim().toLowerCase();
    return new Set(groups.filter((g) => g.NAME.toLowerCase().includes(q)).map((g) => g.ID));
  }, [groupSearchQuery, groups]);

  const matchedSubGroupIds = useMemo(() => {
    if (!subGroupSearchQuery.trim()) return null;
    const q = subGroupSearchQuery.trim().toLowerCase();
    return new Set(subgroups.filter((s) => s.NAME.toLowerCase().includes(q)).map((s) => s.ID));
  }, [subGroupSearchQuery, subgroups]);

  const formFilteredData = useMemo(() => {
    if (!matchedGroupIds && !matchedSubGroupIds) return [];
    return listData.filter((item) => {
      const matchesGroup = matchedGroupIds ? matchedGroupIds.has(String(item.QGRP_ID)) : true;
      const matchesSubGroup = matchedSubGroupIds ? matchedSubGroupIds.has(String(item.QSGRP_ID)) : true;
      const matchesAnswerType = form.ANSWER_TYPE ? item.ANSWER_TYPE === form.ANSWER_TYPE : true;
      return matchesGroup && matchesSubGroup && matchesAnswerType;
    });
  }, [matchedGroupIds, matchedSubGroupIds, listData, form.ANSWER_TYPE]);

  const showInlineTable = Boolean(groupSearchQuery.trim() || subGroupSearchQuery.trim());

  const resetForm = useCallback(() => {
    setIsEditing(false);
    setSelectedQuestion("");
    setForm({ ID: "", QGRP_ID: "", QSGRP_ID: "", QUES_DESCR: "", ANSWER_TYPE: "Text", NO_OF_OPTIONS: "", OPTIONS: [] });
    setErrors({});
    setGroupSearchQuery("");
    setSubGroupSearchQuery("");
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

  const groupSearchDebounceRef = useRef(null);
  const subGroupSearchDebounceRef = useRef(null);

  const handleGroupSearch = useCallback((text) => {
    if (groupSearchDebounceRef.current) clearTimeout(groupSearchDebounceRef.current);
    groupSearchDebounceRef.current = setTimeout(() => setGroupSearchQuery(text ?? ""), 250);
  }, []);

  const handleSubGroupSearch = useCallback((text) => {
    if (subGroupSearchDebounceRef.current) clearTimeout(subGroupSearchDebounceRef.current);
    subGroupSearchDebounceRef.current = setTimeout(() => setSubGroupSearchQuery(text ?? ""), 250);
  }, []);

  useEffect(() => {
    return () => {
      if (groupSearchDebounceRef.current) clearTimeout(groupSearchDebounceRef.current);
      if (subGroupSearchDebounceRef.current) clearTimeout(subGroupSearchDebounceRef.current);
    };
  }, []);

  const handleToggleView = useCallback(() => {
    resetForm();
    setShowAll((prev) => !prev);
  }, [resetForm]);

  const columns = useMemo(
    () => questionMasterColumns({ handleEdit, handleDelete, deletingId }),
    [handleEdit, handleDelete, deletingId],
  );

  const isTextType = form.ANSWER_TYPE === "Text";
  const optionCount = Number(form.NO_OF_OPTIONS) || 0;

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

                {/* (1) Keyword-searchable "Select Question Master" — same
                    pattern as the top selectors elsewhere. Toggle button
                    kept as its own explicit sibling, matching this file's
                    original icon+label style. */}
                <div className="d-flex align-items-center gap-2">
                  <div style={{ minWidth: "260px" }}>
                    <SDLDropdownSelect
                      id="questionMasterSelect"
                      options={questionOptions}
                      value={selectedQuestion}
                      onChange={(id) => handleSelectQuestion(id, listData)}
                      placeholder="Select Question Master"
                      disabled={loading}
                      wrapperClassName=""
                    />
                  </div>
                  <button
                    type="button"
                    className="btn btn-outline-secondary d-flex align-items-center gap-2"
                    onClick={handleToggleView}
                    style={{ minWidth: "15px" }}
                  >
                    <i className={`fas ${showAll ? "fa-edit" : "fa-table"}`} />
                    
                  </button>
                </div>
              </div>

              {!showAll ? (
                <>
                  {/* (7) Row 1 — Question Group, Sub Group, Answer Type,
                      No of Options — four across, matching the screenshot. */}
                  <div className="row mb-3">
                    <div className="col-lg-3 col-md-6">
                      {/* (2)+(3) Keyword-searchable, no "add new". */}
                      <SDLDropdownSelect
                        id="questionGroup"
                        label="Question Group"
                        options={groups.map((g) => ({ id: g.ID, label: g.NAME }))}
                        value={form.QGRP_ID}
                        onChange={(id) => handleGroupChange(id)}
                        invalid={!!errors.QGRP_ID}
                        errorMessage={errors.QGRP_ID}
                        onFilterChange={handleGroupSearch}
                        placeholder="Select Group"
                      />
                    </div>

                    <div className="col-lg-3 col-md-6">
                      <SDLDropdownSelect
                        id="questionSubGroup"
                        label="Question Sub Group"
                        options={subgroups.map((s) => ({ id: s.ID, label: s.NAME }))}
                        value={form.QSGRP_ID}
                        onChange={(id) => handleField("QSGRP_ID", id)}
                        onFilterChange={handleSubGroupSearch}
                        placeholder="Select Sub Group"
                      />
                    </div>

                    <div className="col-lg-3 col-md-6">
                      <div className="mb-3">
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

                    <div className="col-lg-3 col-md-6">
                      {/* (8) Always visible now — disabled (not hidden)
                          when Answer Type is Text. */}
                      <div className="mb-3">
                        <label className="form-label">Number of Options</label>
                        <select
                          className={`form-select ${errors.NO_OF_OPTIONS ? "is-invalid" : ""}`}
                          value={form.NO_OF_OPTIONS}
                          onChange={(e) => handleField("NO_OF_OPTIONS", e.target.value)}
                          disabled={isTextType}
                        >
                          <option value="">Select</option>
                          {[2, 3, 4, 5].map((n) => (
                            <option key={n} value={String(n)}>{n}</option>
                          ))}
                        </select>
                        {errors.NO_OF_OPTIONS && <div className="invalid-feedback">{errors.NO_OF_OPTIONS}</div>}
                      </div>
                    </div>
                  </div>

                  {/* (9) Row 2 — big Question textarea on the left, stacked
                      Option inputs on the right (per the screenshot layout).
                      When Text, there are no options, so the textarea takes
                      the full width. */}
                  <div className="row mb-3">
                    <div className={isTextType ? "col-lg-12" : "col-lg-6"}>
                      <label className="form-label">Question</label>
                      <textarea
                        className={`form-control ${errors.QUES_DESCR ? "is-invalid" : ""}`}
                        value={form.QUES_DESCR}
                        maxLength={1000}
                        rows={isTextType ? 4 : 8}
                        onChange={(e) => handleField("QUES_DESCR", e.target.value)}
                      />
                      {errors.QUES_DESCR && <div className="invalid-feedback">{errors.QUES_DESCR}</div>}
                    </div>

                    {!isTextType && (
                      <div className="col-lg-6">
                        <label className="form-label">Options</label>
                        {(form.OPTIONS || []).slice(0, optionCount || undefined).map((opt, idx) => (
                          <div className="input-group mb-2" key={idx}>
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
                              maxLength={500}
                              placeholder={`Option ${idx + 1}`}
                              onChange={(e) => handleOptionChange(idx, e.target.value)}
                            />
                            {errors[`OPTION_${idx}`] && (
                              <div className="invalid-feedback">{errors[`OPTION_${idx}`]}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="text-end mb-3">
                    <button className="btn btn-primary me-2" type="button" onClick={handleSave} disabled={loading}>
                      {loading ? "Processing..." : isEditing ? "Update" : "Save"}
                    </button>
                    <button className="btn btn-secondary" type="button" onClick={resetForm}>
                      Cancel
                    </button>
                  </div>

                  {/* (4)-(6) Inline preview table — only while there's an
                      active Group or Sub Group search and we're still in
                      form mode. Also re-filters automatically whenever
                      Answer Type changes, since formFilteredData depends
                      on form.ANSWER_TYPE too. */}
                  {showInlineTable && (
                    <div className="table-responsive mt-2">
                      {formFilteredData.length === 0 ? (
                        <div className="p-3 text-center text-muted border rounded">
                          No matching questions
                        </div>
                      ) : (
                        <SDLDataTable
                          data={formFilteredData}
                          columns={columns}
                          loading={false}
                          emptyMessage="No matching questions"
                          removableSort
                        />
                      )}
                    </div>
                  )}
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
