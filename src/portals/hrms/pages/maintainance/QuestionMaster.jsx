import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import SDLDataTable from "../../../../components/datatable/SDLDataTable";
import SDLSearch from "../../../../components/datatable/SDLSearch";
import BreadcrumbNav from "../../components/breadcrumb-nav/BreadcrumbNav";
import { getPortalFromPath } from "../../../../config/portalConfig";
import {
  getQuestions,
  saveQuestion,
  deleteQuestion,
  getQuestionGroups,
  getQuestionSubGroups,
  getAllQuestionSubGroups,
} from "../../services/questionService";
import { notifySuccess, notifyError, confirmAction } from "../../../../services/alertService";

const ANSWER_TYPES = ["Text", "Radio", "Checkbox"];

const QuestionMaster = () => {
  const dispatch = useDispatch();
  const [list, setList] = useState([]);
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

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showAll, setShowAll] = useState(true);
  const [selectedQuestion, setSelectedQuestion] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchAll();
    fetchGroups();
    fetchSubGroups();
  }, []);

  const fetchSubGroups = async () => {
    try {
      const res = await getAllQuestionSubGroups();
      const raw = res?.data || [];
      const subNormalized = (raw || []).map((s) => ({
        ID: String(s.QSSGRP_ID ?? s.ID ?? s.id ?? ""),
        NAME: s.QSSGRP_DESC ?? s.NAME ?? s.label ?? "",
      }));
      setSubgroups(subNormalized);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAll = async () => {
    try {
      setLoading(true);
      const res = await getQuestions();
      // Normalize backend response to expected keys used in the table
      const raw = res?.data || [];
      const normalized = (raw || []).map((row) => ({
        ...row,
        // question text could be returned as QUESTION or QUES_DESCR
        QUES_DESCR: row.QUES_DESCR || row.QUESTION || "",
        // subgroup description
        QSGRP_DESC: row.QSGRP_DESC || row.SUBGROUP_DESC || row.GROUP_NAME || "",
        // rating/type
        RATING: row.RATING || row.rating || row.answer_type || row.ANSWER_TYPE || "",
        // options can be comma-separated string or array
        OPTIONS: row.OPTIONS != null ? row.OPTIONS : row.options || "",
      }));
      setList(normalized);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await getQuestionGroups();
      // Normalize group payload to `{ ID, NAME }` used by the select
      const raw = res?.data || [];
      const groupsNormalized = (raw || []).map((g) => ({
        ID: String(g.QSGRP_ID ?? g.ID ?? g.id ?? ""),
        NAME: g.QSGRP_DESC ?? g.NAME ?? g.label ?? "",
      }));
      setGroups(groupsNormalized);
    } catch (err) {
      console.error(err);
    }
  };

  const handleGroupChange = async (val) => {
    // Sub-groups are independent; only update selected group id and reset sub-group
    setForm((p) => ({ ...p, QGRP_ID: val, QSGRP_ID: "" }));
  };

  const handleField = (name, value) => {
    setForm((p) => {
      const next = { ...p, [name]: value };
      if (name === "ANSWER_TYPE") {
        if (value === "Text") {
          next.NO_OF_OPTIONS = "";
          next.OPTIONS = [];
        }
      }
      if (name === "NO_OF_OPTIONS") {
        const n = parseInt(value, 10) || 0;
        next.OPTIONS = Array.from({ length: n }, (_, i) => p.OPTIONS[i] || "");
      }
      return next;
    });
    setErrors((e) => ({ ...e, [name]: "" }));
  };

  const handleOptionChange = (index, value) => {
    setForm((p) => {
      const opts = [...(p.OPTIONS || [])];
      opts[index] = value;
      return { ...p, OPTIONS: opts };
    });
  };

  const handleSave = async () => {
    const newErrors = {};
    if (!form.QGRP_ID) newErrors.QGRP_ID = "Group required";
    if (!form.QUES_DESCR || !form.QUES_DESCR.trim()) newErrors.QUES_DESCR = "Question required";
    if (form.ANSWER_TYPE !== "Text") {
      if (!form.NO_OF_OPTIONS) newErrors.NO_OF_OPTIONS = "Number of options required";
      (form.OPTIONS || []).forEach((o, i) => {
        if (!o || !o.trim()) newErrors[`OPTION_${i}`] = "Option required";
      });
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length) return;

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
        fetchAll();
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
  };

  const buildOptionsFromRow = (row) => {
    // Prefer array if provided
    if (!row) return [];
    if (Array.isArray(row.OPTIONS) && row.OPTIONS.length) return row.OPTIONS;
    // If backend provides a comma-separated OPTIONS string, split and trim
    if (typeof row.OPTIONS === "string" && row.OPTIONS.trim() !== "") {
      return row.OPTIONS.split(",").map((s) => s.trim()).filter(Boolean);
    }
    // Fallback to numbered opts_1..opts_n or noopts count
    const count = Number(row.noopts || row.NO_OF_OPTIONS || 0);
    if (count > 0) return Array.from({ length: count }, (_, i) => row[`opts_${i + 1}`] || "");
    return [];
  };

  const handleEdit = (row) => {
    setSelectedQuestion(row.ID);
    setIsEditing(true);
    setShowAll(false);
    setForm({
      ID: row.ID,
      QGRP_ID: row.QGRP_ID || row.GROUP_ID || "",
      QSGRP_ID: row.QSGRP_ID || row.SUBGROUP_ID || "",
      QUES_DESCR: row.QUES_DESCR || row.QUESTION || "",
      ANSWER_TYPE: row.answer_type || row.ANSWER_TYPE || "Text",
      NO_OF_OPTIONS: row.noopts || row.NO_OF_OPTIONS || "",
      OPTIONS: buildOptionsFromRow(row),
    });
    if (row.QGRP_ID || row.GROUP_ID) handleGroupChange(row.QGRP_ID || row.GROUP_ID);
    // Inform user that edit is disabled (read-only view)
    notifyError("You cannot edit this form. Editing is disabled.");
  };

  const resetForm = () => {
    setIsEditing(false);
    setSelectedQuestion("");
    setForm({ ID: "", QGRP_ID: "", QSGRP_ID: "", QUES_DESCR: "", ANSWER_TYPE: "Text", NO_OF_OPTIONS: "", OPTIONS: [] });
    setErrors({});
  };

  const handleSelectQuestion = (value) => {
    setSelectedQuestion(value);

    if (!value) {
      resetForm();
      return;
    }

    const selected = list.find((item) => String(item.ID) === String(value));
    if (!selected) return;

    handleEdit(selected);
  };

  const handleDelete = async (row) => {
    const result = await confirmAction("Are you sure you want to Delete?");
    if (!result?.isConfirmed) return;
    try {
      setDeletingId(row.ID);
      const res = await deleteQuestion({ ID: row.ID });
      if (res?.status) notifySuccess(res?.message || "Deleted");
      else notifyError(res?.message || "Unable to delete");
      fetchAll();
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return list;
    const q = search.trim().toLowerCase();
    return list.filter((r) => (r.QUES_DESCR || r.QUESTION || "").toLowerCase().includes(q) || (r.GROUP_NAME || "").toLowerCase().includes(q));
  }, [search, list]);

  const columns = [
    { header: "#", body: (r, o) => o.rowIndex + 1 },
    { header: "Group", body: (r) => r.QSGRP_DESC || r.GROUP_NAME || "", style: { width: "200px" } },
    { header: "Question", body: (r) => r.QUES_DESCR || r.QUESTION || "" , style: { minWidth: "300px" } },
    { header: "Type", body: (r) => r.RATING || r.rating || r.answer_type || r.ANSWER_TYPE || "" , style: { width: "120px" } },
    { header: "Options", body: (r) => buildOptionsFromRow(r).filter(Boolean).join(", ") },
    {
      header: "Action",
      body: (r) => (
        <div className="d-flex gap-2">
          <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(r)} disabled={deletingId === r.ID}>
            {deletingId === r.ID ? <span className="spinner-border spinner-border-sm" /> : <i className="ti ti-trash" />}
          </button>
        </div>
      ),
    },
  ];

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
            {
              text: "Home",
              link: portalHome,
            },
            {
              text: "Question Master",
            },
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
                    onChange={(e) => handleSelectQuestion(e.target.value)}
                    style={{ minWidth: "220px" }}
                    disabled={loading}
                  >
                    <option value="">Select Question Master</option>
                    {list.map((item) => (
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
                    <div className="alert alert-warning">You cannot edit this form. Editing is disabled.</div>
                  )}
                  <div className="row mb-3">
                    <div className="col-lg-4">
                      <label className="form-label">Question Group</label>
                      <select className={`form-select ${errors.QGRP_ID ? "is-invalid" : ""}`} value={form.QGRP_ID} onChange={(e) => handleGroupChange(e.target.value)} disabled={isEditing}>
                        <option value="">Select Group</option>
                        {groups.map((g) => (
                          <option key={g.ID} value={g.ID}>{g.NAME}</option>
                        ))}
                      </select>
                      {errors.QGRP_ID && <div className="invalid-feedback">{errors.QGRP_ID}</div>}
                    </div>

                    <div className="col-lg-4">
                      <label className="form-label">Question Sub Group</label>
                      <select className="form-select" value={form.QSGRP_ID} onChange={(e) => handleField("QSGRP_ID", e.target.value)} disabled={isEditing}>
                        <option value="">Select Sub Group</option>
                        {subgroups.map((s) => (
                          <option key={s.ID} value={s.ID}>{s.NAME}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-lg-4">
                      <label className="form-label">Answer Type</label>
                      <select className="form-select" value={form.ANSWER_TYPE} onChange={(e) => handleField("ANSWER_TYPE", e.target.value)} disabled={isEditing}>
                        {ANSWER_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-lg-8">
                      <label className="form-label">Question</label>
                      <input type="text" className={`form-control ${errors.QUES_DESCR ? "is-invalid" : ""}`} value={form.QUES_DESCR} onChange={(e) => handleField("QUES_DESCR", e.target.value)} disabled={isEditing} />
                      {errors.QUES_DESCR && <div className="invalid-feedback">{errors.QUES_DESCR}</div>}
                    </div>

                    {form.ANSWER_TYPE !== "Text" && (
                      <div className="col-lg-4">
                        <label className="form-label">Number of Options</label>
                        <select className={`form-select ${errors.NO_OF_OPTIONS ? "is-invalid" : ""}`} value={form.NO_OF_OPTIONS} onChange={(e) => handleField("NO_OF_OPTIONS", e.target.value)} disabled={isEditing}>
                          <option value="">Select</option>
                          {[2,3,4,5].map((n) => <option key={n} value={String(n)}>{n}</option>)}
                        </select>
                        {errors.NO_OF_OPTIONS && <div className="invalid-feedback">{errors.NO_OF_OPTIONS}</div>}
                      </div>
                    )}
                  </div>

                  {form.ANSWER_TYPE !== "Text" && (form.OPTIONS || []).map((opt, idx) => (
                    <div className="row mb-2" key={idx}>
                      <div className="col-lg-8">
                        <div className="input-group">
                          {form.ANSWER_TYPE === "Radio" && (
                            <span className="input-group-text"><input type="radio" name="defaultOption" checked={form.DEFAULT_OPTION === idx} onChange={() => setForm((p) => ({ ...p, DEFAULT_OPTION: idx }))} disabled={isEditing} /></span>
                          )}
                          <input className={`form-control ${errors[`OPTION_${idx}`] ? "is-invalid" : ""}`} value={opt} onChange={(e) => handleOptionChange(idx, e.target.value)} disabled={isEditing} />
                          {errors[`OPTION_${idx}`] && <div className="invalid-feedback">{errors[`OPTION_${idx}`]}</div>}
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="text-end mb-3">
                    <button className="btn btn-secondary me-2" type="button" onClick={resetForm}>Cancel</button>
                    <button className="btn btn-primary" type="button" onClick={handleSave} disabled={loading || isEditing}>{loading ? 'Processing...' : isEditing ? 'Update' : 'Save'}</button>
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
