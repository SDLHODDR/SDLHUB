import { useEffect, useMemo, useState } from "react";
import {
  getTenureChangeDetails,
  saveTenureChangeAssessment,
  submitTenureChangeAssessment,
} from "../../services/tenureChangeService";
// import {
//   tenureRatingOptions,
//   tenureRatingQuestions,
//   tenureAssessmentPostData,
//   tenureAssessmentSubmitPostData,
//   tenureTypeOptions,
// } from "./tenureChangeOptions";
import "../../assets/css/tenureChange.css";

const emptyAssessment = {
  ratings: {},
  improvement: "",
  appraiserComments: "",
  employeeType: "",
  period: "",
  proposedCtc: "",
  effectiveFrom: "",
  nextAppraisalYear: "",
  remarks: "",
};

const TenureChangeAssessmentModal = ({ config, show, record, onClose, onSuccess }) => {
  const [employee, setEmployee] = useState(null);
  const [assessmentMeta, setAssessmentMeta] = useState({});
  const [questions, setQuestions] = useState([]);
  const [ratingOptions, setRatingOptions] = useState([]);
  const [typeOptions, setTypeOptions] = useState([]);
  const [assessment, setAssessment] = useState(emptyAssessment);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [saveSucceeded, setSaveSucceeded] = useState(false);
  const [actionMessage, setActionMessage] = useState("");

  useEffect(() => {
    if (!show || !record) return undefined;

    let active = true;
    const loadDetails = async () => {
      setLoading(true);
      setLoadError("");
      setEmployee(null);
      setQuestions([]);
      setRatingOptions([]);
      setTypeOptions([]);
      setAssessment(emptyAssessment);
      setAssessmentMeta({});
      setSaveSucceeded(false);
      setActionMessage("");

      try {
        console.log(record.TRAN_CODE, record.TASK_ID, record.ID);

        const response = await getTenureChangeDetails({
          empCode: record.TRAN_CODE,
          taskId: record.TASK_ID,
          tenureChangeId: record.ID,
        });

        const payload = response?.data?.data ?? response?.data ?? response?.response?.data ?? {};
        if (!(response?.status === true || response?.success === true || payload?.employee)) {
          throw new Error(response?.message || "Tenure details could not be loaded.");
        }

        const emp = payload.employee ?? {};
        const meta = payload.tenure_assessment ?? {};
        const questionList = Array.isArray(payload.questions) ? payload.questions : [];
        const empTypes = Array.isArray(payload.employee_type_options)
          ? payload.employee_type_options
          : [];

        const normalizedQuestions = questionList.map((q, index) => ({
          ...q,
          id: q.id ?? q.QUESTION_ID ?? index,
          question: q.question ?? q.QUESTION ?? `Question ${index + 1}`,
          group: q.group ?? "GENERAL",
          subgroup: q.subgroup ?? "PERSONAL",
          options: Array.isArray(q.options) ? q.options : [],
          saved_answer: q.saved_answer ?? "",
        }));

        const firstOptions = normalizedQuestions.find((q) => q.options.length)?.options ?? [];
        const normalizedEmployee = {
          code: emp.emp_code ?? record.TRAN_CODE ?? "-",
          name: emp.name ?? "-",
          dateOfJoining: emp.doj ?? "-",
          designation: emp.designation ?? "-",
          department: emp.department ?? "-",
          employeeType: emp.current_emp_type ?? "-",
          tenureDueDate: emp.tenure_due_date ?? "-",
          currentCtc: emp.current_ctc ?? "",
        };

        const ratings = {};
        normalizedQuestions.forEach((q) => {
          if (q.saved_answer) ratings[q.id] = q.saved_answer;
        });

        if (!active) return;
        setEmployee(normalizedEmployee);
        setAssessmentMeta(meta);
        setQuestions(normalizedQuestions);
        setRatingOptions(firstOptions);
        setTypeOptions(empTypes);
        setAssessment({
          ...emptyAssessment,
          ratings,
          employeeType: String(meta.etype_id ?? ""),
          period: meta.etype_period ?? "",
          proposedCtc: meta.proposed_ctc ?? "",
          effectiveFrom: meta.effective_from ?? "",
          remarks: meta.remarks ?? "",
        });
      } catch (error) {
        if (active) setLoadError(error?.message || "Tenure details could not be loaded.");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadDetails();
    return () => {
      active = false;
    };
  }, [show, record?.TRAN_CODE, record?.TASK_ID, record?.ID]);

  const updateAssessment = (field, value) => {
    setAssessment((current) => ({ ...current, [field]: value }));
    setSaveSucceeded(false);
    setActionMessage("");
  };

  const updateRating = (questionId, value) => {
    setAssessment((current) => ({
      ...current,
      ratings: { ...current.ratings, [questionId]: value },
    }));
    setSaveSucceeded(false);
    setActionMessage("");
  };

  const postData = useMemo(() => ({
    emp_code: employee?.code ?? record?.TRAN_CODE ?? "",
    task_id: record?.TASK_ID ?? assessmentMeta.task_id ?? "",
    tenure_change_id: assessmentMeta.tenure_change_id ?? record?.ID ?? null,
    jd_id: assessmentMeta.jd_id ?? null,
    etype_id: assessment.employeeType,
    etype_period: assessment.period,
    proposed_ctc: assessment.proposedCtc,
    effective_from: assessment.effectiveFrom,
    next_appraisal_year: assessment.nextAppraisalYear,
    remarks: assessment.remarks,
    answers: questions.map((q) => ({
      ques_id: q.id,
      answer: assessment.ratings[q.id] ?? "",
    })),
    improvement: assessment.improvement,
    appraiser_comments: assessment.appraiserComments,
  }), [employee, record, assessmentMeta, assessment, questions]);

  const assessmentComplete = questions.every((q) => Boolean(assessment.ratings[q.id])) &&
    Boolean(assessment.employeeType);
  const canSubmit = saveSucceeded && assessmentComplete &&
    Boolean(assessmentMeta.tenure_change_id ?? record?.ID);

  const handleSave = async (event) => {
    event.preventDefault();
    if (!employee || saving) return;
    setSaving(true);
    setSaveSucceeded(false);
    setActionMessage("");
    try {
      const response = await saveTenureChangeAssessment(postData);
      if (response?.status === true || response?.success === true) {
        setSaveSucceeded(true);
        setActionMessage(response?.message || "Assessment saved.");
        //onSuccess?.();
      } else {
        setActionMessage(response?.message || "Assessment could not be saved.");
      }
    } catch (error) {
      setActionMessage(error?.message || "Assessment could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setActionMessage("");
    try {
      const response = await submitTenureChangeAssessment(postData);
      if (response?.status === true || response?.success === true) {
        setActionMessage(response?.message || "Assessment submitted.");
        onSuccess?.();
        onClose();
      } else {
        setActionMessage(response?.message || "Assessment could not be submitted.");
      }
    } catch (error) {
      setActionMessage(error?.message || "Assessment could not be submitted.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!show || !record) return null;

  const optionValue = (option) => option?.VALUE ?? option?.value ?? option?.ETYPE_ID ?? option;
  const optionLabel = (option) => option?.LABEL ?? option?.label ?? option?.EMP_TYPE ?? option;

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}
      tabIndex="-1"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tenure-assessment-title"
    >
      <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <form className="modal-content shadow-lg border-0" onSubmit={handleSave}>
          <div className="modal-header">
            <div>
              <h5 className="modal-title mb-1" id="tenure-assessment-title">
                {config?.title || "Employee Tenure Change"}
              </h5>
              <small className="text-muted">
                Employee Code: <strong>{record.TRAN_CODE || "-"}</strong>
                <span className="mx-2">|</span>
                Task ID: <strong>{record.ID || "-"}</strong>
                <span className="mx-2">|</span>
                Workflow Task: <strong>{record.TASK_ID || "-"}</strong>
              </small>
            </div>
            <button type="button" className="close" onClick={onClose} aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>

          <div className="modal-body">
            {loading ? (
              <div className="text-center py-5">
                <span className="spinner-border" role="status" aria-label="Loading" />
                <div className="mt-2">Loading tenure assessment...</div>
              </div>
            ) : loadError ? (
              <div className="alert alert-warning mb-0" role="alert">{loadError}</div>
            ) : employee ? (
              <div className="tenure-change-page">
                <div className="row g-3 mb-3 tenure-employee-summary">
                  <div className="col-lg-4">
                    <div><strong>Employee:</strong> {employee.code} - {employee.name}</div>
                    <div><strong>Current Employee Type:</strong> {employee.employeeType}</div>
                  </div>
                  <div className="col-lg-4">
                    <div><strong>Date of Joining:</strong> {employee.dateOfJoining}</div>
                    <div><strong>Designation:</strong> {employee.designation}</div>
                  </div>
                  <div className="col-lg-4">
                    <div><strong>Tenure Due Date:</strong> {employee.tenureDueDate}</div>
                    <div><strong>Department:</strong> {employee.department}</div>
                  </div>
                </div>

                {questions.length === 0 ? (
                  <div className="alert alert-info">No tenure assessment questions are configured for this employee.</div>
                ) : (
                  <>
                    <div className="tenure-rating-section-title">GENERAL</div>
                    <div className="table-responsive tenure-rating-table-wrap">
                      <table className="table table-bordered tenure-rating-table mb-0">
                        <tbody>
                          {questions.map((question, index) => (
                            <tr key={question.id}>
                              {index === 0 && (
                                <th
                                  className="tenure-rating-group"
                                  rowSpan={questions.length}
                                >
                                  {question.subgroup || "PERSONAL"}
                                </th>
                              )}
                              <th className="tenure-rating-question">
                                {index + 1}) {question.question}
                              </th>
                              <td>
                                {question.input_type === "checkbox" ? (
                                  <div className="tenure-rating-options">
                                    {question.options.map((option) => {
                                      const selected = String(assessment.ratings[question.id] ?? "")
                                        .split(",").map((v) => v.trim()).includes(option);
                                      return (
                                        <label key={option} className="form-check form-check-inline">
                                          <input
                                            className="form-check-input"
                                            type="checkbox"
                                            checked={selected}
                                            onChange={(event) => {
                                              const current = String(assessment.ratings[question.id] ?? "")
                                                .split(",").map((v) => v.trim()).filter(Boolean);
                                              const next = event.target.checked
                                                ? [...current, option]
                                                : current.filter((v) => v !== option);
                                              updateRating(question.id, next.join(","));
                                            }}
                                          />
                                          <span className="form-check-label">{option}</span>
                                        </label>
                                      );
                                    })}
                                  </div>
                                ) : question.input_type === "radio" || question.rating_type === "R" ? (
                                  <div className="tenure-rating-options">
                                    {(question.options.length ? question.options : ratingOptions).map((option) => (
                                      <label key={option} className="form-check form-check-inline">
                                        <input
                                          className="form-check-input"
                                          type="radio"
                                          name={`rating-${question.id}`}
                                          value={option}
                                          checked={assessment.ratings[question.id] === option}
                                          onChange={() => updateRating(question.id, option)}
                                        />
                                        <span className="form-check-label">{option}</span>
                                      </label>
                                    ))}
                                  </div>
                                ) : (
                                  <textarea
                                    className="form-control"
                                    rows="2"
                                    value={assessment.ratings[question.id] ?? question.saved_answer ?? ""}
                                    onChange={(event) => updateRating(question.id, event.target.value)}
                                  />
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}

                <div className="row g-3 mt-2">
                  <div className="col-lg-4 col-md-6">
                    <label className="form-label">Employee Type <span className="text-danger">*</span></label>
                    <select
                      className="form-select tenure-change-select"
                      value={assessment.employeeType}
                      onChange={(event) => updateAssessment("employeeType", event.target.value)}
                    >
                      <option value="">Select Employee Type</option>
                      {typeOptions.map((type, index) => (
                        <option key={optionValue(type) ?? index} value={optionValue(type)}>
                          {optionLabel(type)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-lg-4 col-md-6">
                    <label className="form-label">Period (In Months)</label>
                    <input className="form-control" type="number" min="0" value={assessment.period}
                      onChange={(event) => updateAssessment("period", event.target.value)} />
                  </div>
                  <div className="col-lg-4 col-md-6">
                    <label className="form-label">Current CTC</label>
                    <input className="form-control" value={employee.currentCtc || "-"} disabled />
                  </div>
                  <div className="col-lg-4 col-md-6">
                    <label className="form-label">Proposed CTC</label>
                    <input className="form-control" type="number" min="0" placeholder="Enter proposed CTC"
                      value={assessment.proposedCtc}
                      onChange={(event) => updateAssessment("proposedCtc", event.target.value)} />
                  </div>
                  <div className="col-lg-4 col-md-6">
                    <label className="form-label">Effective From <span className="text-danger">*</span></label>
                    <input className="form-control" type="date" min={assessmentMeta.min_effective_date || undefined}
                      value={assessment.effectiveFrom}
                      onChange={(event) => updateAssessment("effectiveFrom", event.target.value)} />
                  </div>
                  <div className="col-lg-4 col-md-6">
                    <label className="form-label">Next Appraisal Year</label>
                    <select className="form-select tenure-change-select" value={assessment.nextAppraisalYear}
                      onChange={(event) => updateAssessment("nextAppraisalYear", event.target.value)}>
                      <option value="">Select Year</option>
                      {[2027, 2028, 2029, 2030, 2031].map((year) => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-12">
                    <label className="form-label">Assessment Remarks</label>
                    <textarea className="form-control" rows="2" value={assessment.remarks}
                      onChange={(event) => updateAssessment("remarks", event.target.value)} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="alert alert-warning mb-0" role="alert">
                Employee details are not available for this request.
              </div>
            )}
          </div>

          <div className="modal-footer">
            {actionMessage && <span className="small text-muted me-auto" role="status">{actionMessage}</span>}
            <button type="submit" className="btn btn-primary" disabled={loading || !employee || saving || submitting}>
              {saving ? "Saving..." : "Save"}
            </button>
            {canSubmit && (
              <button type="button" className="btn btn-warning" onClick={handleSubmit} disabled={submitting || saving}>
                {submitting ? "Submitting..." : "Submit"}
              </button>
            )}
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TenureChangeAssessmentModal;
