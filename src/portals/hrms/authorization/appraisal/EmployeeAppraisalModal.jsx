import { useEffect, useMemo, useState } from 'react'
import SaveButton from '../../../../shared/components/buttons/SaveButton'
import SDLReactSelect from '../../../../shared/components/form/SDLReactSelect'
import {
  confirmAction,
  notifyError,
  notifySuccess
} from '../../../../shared/services/alertService'
import RecruitmentModal from '../../pages/recruitment/RecruitmentModal'
import { getEmployeeAppraisal, saveEmployeeAppraisal } from '../../services/appraisalService'

/*
 * Employee Appraisal task (46), legacy employee_appraisal.php. Each appraiser in the
 * employee's chain answers the appraisal (fixed-format questions, or KRA percentages and
 * activity remarks) and recommends a CTC, promotion and the next appraisal due date.
 * Save keeps partial work; Submit needs everything and hands the appraisal to the next appraiser.
 */

const REMARK_MAX = 500
const REVIEW_MAX = 3000
const inr = value =>
  value === null || value === undefined || value === '' || Number(value) === 0
    ? '-'
    : Number(value).toLocaleString('en-IN', { maximumFractionDigits: 0 })
const titleCase = text =>
  String(text || '')
    .toLowerCase()
    .replace(/(^|[\s(/-])(\p{L})/gu, (_, sep, ch) => sep + ch.toUpperCase())

const Detail = ({ label, children }) => (
  <div className='col-md-3 col-sm-6'>
    <strong className='grid-label'>{label} : </strong>
    <span className='grid-val'>{children || '-'}</span>
  </div>
)

const History = ({ history }) => {
  const columns = history.columns || []
  if (!history.heads?.length) return null
  // Increment against the next older column.
  const increment = index => {
    const current = history.ctc[columns[index].key] || 0
    const older = columns[index + 1] ? history.ctc[columns[index + 1].key] || 0 : 0
    return current && older ? current - older : null
  }
  return (
    <>
      <div className='fw-semibold mb-2'>History of Increments (per month, ₹)</div>
      <div className='table-responsive mb-3'>
        <table className='table table-bordered table-sm mb-0 recruitment-flow-table'>
          <thead>
            <tr>
              <th>Heads</th>
              {columns.map(column => (
                <th key={column.key} className='text-end'>
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {history.heads.map(head => (
              <tr key={head.label}>
                <td>{head.label}</td>
                {columns.map(column => (
                  <td key={column.key} className='text-end'>
                    {inr(head.values[column.key])}
                  </td>
                ))}
              </tr>
            ))}
            <tr className='fw-semibold'>
              <td>Total</td>
              {columns.map(column => (
                <td key={column.key} className='text-end'>
                  {inr(history.totals[column.key])}
                </td>
              ))}
            </tr>
            <tr className='fw-semibold'>
              <td>CTC per month</td>
              {columns.map(column => (
                <td key={column.key} className='text-end'>
                  {inr(history.ctc[column.key])}
                </td>
              ))}
            </tr>
            <tr>
              <td>Increment</td>
              {columns.map((column, index) => (
                <td key={column.key} className='text-end'>
                  {increment(index) === null ? '-' : inr(increment(index))}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </>
  )
}

const QuestionInput = ({ question, value, disabled, onChange }) => {
  if (question.type === 'T') {
    return (
      <textarea
        className='form-control form-control-sm'
        rows={2}
        maxLength={1000}
        aria-label={question.question}
        value={value || ''}
        disabled={disabled}
        onChange={event => onChange(event.target.value)}
      />
    )
  }
  const multiple = question.type === 'C'
  const chosen = multiple ? (Array.isArray(value) ? value : []) : value
  return question.options.map((option, index) => {
    const id = `appr-q-${question.id}-${index}`
    return (
      <div className='form-check form-check-inline' key={id}>
        <input
          className='form-check-input'
          type={multiple ? 'checkbox' : 'radio'}
          name={`appr-q-${question.id}`}
          id={id}
          checked={multiple ? chosen.includes(option) : chosen === option}
          disabled={disabled}
          onChange={() =>
            onChange(
              multiple
                ? chosen.includes(option)
                  ? chosen.filter(item => item !== option)
                  : [...chosen, option]
                : option
            )
          }
        />
        <label className='form-check-label' htmlFor={id}>
          {option}
        </label>
      </div>
    )
  })
}

const isAnswered = value => (Array.isArray(value) ? value.length > 0 : String(value ?? '').trim() !== '')

const EmployeeAppraisalModal = ({ record, onClose, onDone }) => {
  const [data, setData] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [answers, setAnswers] = useState({})
  const [remarks, setRemarks] = useState({})
  const [kras, setKras] = useState({})
  const [decision, setDecision] = useState({ propCtc: '', recoPromo: '', nextDue: '', remarks: '' })
  const [busy, setBusy] = useState('')
  const [showMissing, setShowMissing] = useState(false)

  useEffect(() => {
    let active = true
    getEmployeeAppraisal(record.ID)
      .then(response => {
        if (!active) return
        if (!response?.status) throw new Error(response?.message)
        const d = response.data
        setData(d)
        setAnswers(Object.fromEntries(d.form.questions.map(q => [q.id, q.answer])))
        setRemarks(Object.fromEntries(d.form.questions.map(q => [q.id, q.remarks])))
        setKras(
          Object.fromEntries(
            d.form.kras.map(k => [
              k.id,
              { perc: k.perc, activities: Object.fromEntries(k.activities.map(a => [a.id, a.remarks])) }
            ])
          )
        )
        setDecision({
          ...d.decision,
          // Legacy default: April of the coming year.
          nextDue: d.decision.nextDue || d.dueOptions[0]?.value || ''
        })
      })
      .catch(error => {
        if (active) setLoadError(error?.message || 'Unable to load the appraisal.')
      })
    return () => {
      active = false
    }
  }, [record.ID])

  const isKra = data?.appraisal.base === 'K'
  const isAdhoc = data?.appraisal.type === 'A'

  // Questions grouped by group, then subgroup, keeping order.
  const groups = useMemo(() => {
    const list = []
    ;(data?.form.questions || []).forEach(question => {
      let group = list.find(g => g.name === question.group)
      if (!group) list.push((group = { name: question.group, subgroups: [] }))
      let sub = group.subgroups.find(s => s.name === question.subgroup)
      if (!sub) group.subgroups.push((sub = { name: question.subgroup, questions: [] }))
      sub.questions.push(question)
    })
    return list
  }, [data])

  const missing = useMemo(() => {
    if (!data) return { questions: new Set(), kras: new Set(), fields: [] }
    const questions = new Set(data.form.questions.filter(q => !isAnswered(answers[q.id])).map(q => q.id))
    const kraMissing = new Set(
      data.form.kras
        .filter(
          k =>
            !String(kras[k.id]?.perc ?? '').trim() ||
            k.activities.some(a => !String(kras[k.id]?.activities?.[a.id] ?? '').trim())
        )
        .map(k => k.id)
    )
    const fields = []
    if (!String(decision.propCtc).trim()) fields.push('propCtc')
    if (!decision.recoPromo) fields.push('recoPromo')
    if (!decision.nextDue) fields.push('nextDue')
    if (!decision.remarks.trim()) fields.push('remarks')
    return { questions, kras: kraMissing, fields }
  }, [data, answers, kras, decision])

  const payload = action => ({
    user_task_id: record.ID,
    action,
    answers,
    remarks,
    kras,
    prop_ctc: decision.propCtc,
    reco_promo: decision.recoPromo,
    nxt_appr_due: decision.nextDue,
    appr_remarks: decision.remarks
  })

  const handleSave = async () => {
    setBusy('save')
    try {
      const response = await saveEmployeeAppraisal(payload('save'))
      if (!response?.status) throw new Error(response?.message)
      notifySuccess(response.message || 'Saved Successfully!')
    } catch (error) {
      notifyError(error?.message || 'Unable to save the appraisal.')
    } finally {
      setBusy('')
    }
  }

  const handleSubmit = async () => {
    const formMissing = isKra
      ? missing.kras.size > 0 || data.form.kras.length === 0
      : isAdhoc
        ? missing.questions.size === data.form.questions.length
        : missing.questions.size > 0
    if (formMissing || missing.fields.length > 0) {
      setShowMissing(true)
      const parts = []
      if (formMissing) parts.push(isKra ? 'every KRA percentage and activity remark' : isAdhoc ? 'at least one question' : `every question (${missing.questions.size} pending)`)
      if (missing.fields.length) parts.push('the recommendation details')
      notifyError(`Please fill in ${parts.join(' and ')} before submitting.`)
      return
    }
    const confirmed = await confirmAction(
      'Submit the appraisal?',
      'You will not be able to change it afterwards. It goes to the next appraiser, if there is one.'
    )
    if (!confirmed) return
    setBusy('submit')
    try {
      const response = await saveEmployeeAppraisal(payload('submit'))
      if (!response?.status) throw new Error(response?.message)
      notifySuccess(response.message)
      window.dispatchEvent(new Event('hrms-auth-tasks-changed'))
      onDone?.()
      onClose()
    } catch (error) {
      notifyError(error?.message || 'Unable to submit the appraisal.')
    } finally {
      setBusy('')
    }
  }

  const flag = condition => (showMissing && condition ? ' is-invalid' : '')
  const ctcValue = Number(decision.propCtc) || 0

  return (
    <RecruitmentModal
      titleId='employee-appraisal-title'
      title={data ? `Employee Appraisal - ${data.employee.name}` : 'Employee Appraisal'}
      subtitle={
        data ? (
          <>
            {data.appraisal.title} ({data.appraisal.typeText})
            <span className='mx-2'>|</span>
            Appraiser: <strong>{data.appraiser}</strong> (Level {data.level})
            <span className='mx-2'>|</span>
            Task ID: <strong>{record.ID}</strong>
          </>
        ) : null
      }
      size='xl'
      loading={!data && !loadError}
      loadError={loadError}
      onClose={onClose}
      footer={
        data && (
          <div className='d-flex gap-2'>
            <SaveButton onClick={handleSave} isSubmitting={busy === 'save'} disabled={Boolean(busy)}>
              Save
            </SaveButton>
            <button type='button' className='btn btn-success' onClick={handleSubmit} disabled={Boolean(busy)}>
              {busy === 'submit' ? 'Processing...' : 'Submit'}
            </button>
          </div>
        )
      }
    >
      {data && (
        <>
          <div className='row g-2 tenure-legacy-grid pb-3 mb-3 border-bottom'>
            <Detail label='Employee'>{`${data.employee.name} (${data.employee.code})`}</Detail>
            <Detail label='Date Of Assessment'>{data.assessmentDate}</Detail>
            <Detail label='Reporting To'>{data.employee.reportsTo}</Detail>
            <Detail label='Date Of Joining'>{data.employee.doj}</Detail>
            <Detail label='Designation'>{data.employee.designation}</Detail>
            <Detail label='Department'>{data.employee.department}</Detail>
            <Detail label='Division'>{data.employee.division}</Detail>
            <Detail label='Location'>{data.employee.location}</Detail>
            <Detail label='Years With Company'>{data.employee.years}</Detail>
            <Detail label='Current CTC'>{data.employee.ctc ? `₹${inr(data.employee.ctc)}` : '-'}</Detail>
            <Detail label='Last Increment'>{data.employee.lastIncrement}</Detail>
            <Detail label='Next Increment Due'>{data.employee.nextIncrementDue}</Detail>
          </div>

          <History history={data.history} />

          {data.earlier.length > 0 && (
            <>
              <div className='fw-semibold mb-2'>Earlier Appraisers</div>
              <table className='table table-bordered table-sm mb-3 recruitment-flow-table recruitment-questions-table'>
                <thead>
                  <tr>
                    <th style={{ width: '6%' }}>Level</th>
                    <th style={{ width: '18%' }}>Appraiser</th>
                    <th style={{ width: '12%' }}>Promotion</th>
                    <th style={{ width: '14%' }}>Proposed CTC</th>
                    <th style={{ width: '12%' }}>Next Due</th>
                    <th>Final Review</th>
                  </tr>
                </thead>
                <tbody>
                  {data.earlier.map(row => (
                    <tr key={`${row.level}-${row.appraiser}`}>
                      <td>{row.level}</td>
                      <td>{row.appraiser}</td>
                      <td>{row.recoPromo === 'Y' ? 'Yes' : row.recoPromo === 'N' ? 'No' : '-'}</td>
                      <td>{row.propCtc ? `₹${inr(row.propCtc)}` : '-'}</td>
                      <td>{row.nextDue || '-'}</td>
                      <td>{row.remarks || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          <div className='fw-semibold mb-2'>Appraisal Form</div>
          {isKra ? (
            data.form.kras.length === 0 ? (
              <div className='alert alert-warning'>No KRAs are set for this employee.</div>
            ) : (
              <table className='table table-bordered table-sm align-middle mb-3 recruitment-flow-table recruitment-questions-table'>
                <tbody>
                  {data.form.kras.map(kra => [
                    <tr key={`k-${kra.id}`}>
                      <th className='recruitment-group-heading' style={{ width: '75%' }}>
                        {titleCase(kra.description)} (Weightage: {kra.weightage}%)
                      </th>
                      <th className='recruitment-group-heading'>
                        <div className='input-group input-group-sm'>
                          <input
                            className={`form-control text-end${flag(!String(kras[kra.id]?.perc ?? '').trim())}`}
                            inputMode='numeric'
                            aria-label={`Appraised percentage for ${kra.description}`}
                            value={kras[kra.id]?.perc ?? ''}
                            disabled={Boolean(busy)}
                            onChange={event => {
                              const perc = event.target.value.replace(/\D/g, '').slice(0, 3)
                              setKras(current => ({ ...current, [kra.id]: { ...current[kra.id], perc } }))
                            }}
                          />
                          <span className='input-group-text'>%</span>
                        </div>
                      </th>
                    </tr>,
                    ...kra.activities.map((activity, index) => (
                      <tr key={`a-${activity.id}`}>
                        <td className='fw-semibold'>
                          {index + 1}) {activity.description}
                          <span className='text-danger'> *</span>
                        </td>
                        <td>
                          <input
                            className={`form-control form-control-sm${flag(!String(kras[kra.id]?.activities?.[activity.id] ?? '').trim())}`}
                            aria-label={`Remarks for ${activity.description}`}
                            maxLength={REVIEW_MAX}
                            value={kras[kra.id]?.activities?.[activity.id] ?? ''}
                            disabled={Boolean(busy)}
                            onChange={event =>
                              setKras(current => ({
                                ...current,
                                [kra.id]: {
                                  ...current[kra.id],
                                  activities: { ...current[kra.id]?.activities, [activity.id]: event.target.value }
                                }
                              }))
                            }
                          />
                        </td>
                      </tr>
                    ))
                  ])}
                </tbody>
              </table>
            )
          ) : (
            <table className='table table-bordered table-sm align-middle mb-3 recruitment-flow-table recruitment-questions-table'>
              <colgroup>
                <col style={{ width: '40%' }} />
                <col style={{ width: '30%' }} />
                <col style={{ width: '30%' }} />
              </colgroup>
              <tbody>
                {groups.map(group => [
                  group.name && (
                    <tr key={`g-${group.name}`}>
                      <th colSpan={3} className='recruitment-group-heading'>
                        {titleCase(group.name)}
                      </th>
                    </tr>
                  ),
                  ...group.subgroups.map(sub => [
                    sub.name && (
                      <tr key={`s-${group.name}-${sub.name}`}>
                        <th colSpan={3} className='text-primary'>
                          {titleCase(sub.name)}
                        </th>
                      </tr>
                    ),
                    ...sub.questions.map(question => {
                      const isMissing = showMissing && !isAdhoc && missing.questions.has(question.id)
                      return (
                        <tr key={question.id}>
                          <td className={`fw-semibold${isMissing ? ' text-danger' : ''}`}>
                            {question.seq ? `${question.seq}) ` : ''}
                            {question.question}
                            {!isAdhoc && <span className='text-danger'> *</span>}
                          </td>
                          <td colSpan={question.type === 'T' ? 2 : 1} className={isMissing ? 'recruitment-missing-cell' : ''}>
                            <QuestionInput
                              question={question}
                              value={answers[question.id]}
                              disabled={Boolean(busy)}
                              onChange={value => setAnswers(current => ({ ...current, [question.id]: value }))}
                            />
                          </td>
                          {question.type !== 'T' && (
                            <td>
                              <textarea
                                className='form-control form-control-sm'
                                rows={2}
                                placeholder='Remarks'
                                aria-label={`Remarks for ${question.question}`}
                                maxLength={REMARK_MAX}
                                value={remarks[question.id] || ''}
                                disabled={Boolean(busy)}
                                onChange={event =>
                                  setRemarks(current => ({ ...current, [question.id]: event.target.value }))
                                }
                              />
                            </td>
                          )}
                        </tr>
                      )
                    })
                  ])
                ])}
              </tbody>
            </table>
          )}

          <div className='row g-3'>
            <div className='col-md-3'>
              <label className='form-label d-block'>
                Recommended For Promotion <span className='text-danger'>*</span>
              </label>
              {[
                ['Y', 'Yes'],
                ['N', 'No']
              ].map(([value, label]) => (
                <div className='form-check form-check-inline' key={value}>
                  <input
                    className='form-check-input'
                    type='radio'
                    name='appr-reco-promo'
                    id={`appr-reco-${value}`}
                    checked={decision.recoPromo === value}
                    disabled={Boolean(busy)}
                    onChange={() => setDecision(current => ({ ...current, recoPromo: value }))}
                  />
                  <label className='form-check-label' htmlFor={`appr-reco-${value}`}>
                    {label}
                  </label>
                </div>
              ))}
              {showMissing && !decision.recoPromo && <div className='text-danger small'>Please choose Yes or No.</div>}
            </div>
            <div className='col-md-3'>
              <label className='form-label' htmlFor='appr-prop-ctc'>
                Proposed Annual CTC (In ₹) <span className='text-danger'>*</span>
              </label>
              <input
                id='appr-prop-ctc'
                className={`form-control text-end${flag(!String(decision.propCtc).trim())}`}
                inputMode='numeric'
                placeholder='e.g. 600000'
                value={decision.propCtc}
                disabled={Boolean(busy)}
                onChange={event =>
                  setDecision(current => ({ ...current, propCtc: event.target.value.replace(/\D/g, '').slice(0, 12) }))
                }
              />
              {ctcValue > 0 && (
                <small className='text-muted d-block mt-1'>
                  ₹{ctcValue.toLocaleString('en-IN')} (
                  {(ctcValue / 100000).toLocaleString('en-IN', { maximumFractionDigits: 2 })} Lakhs p.a.)
                </small>
              )}
            </div>
            <div className='col-md-3'>
              <label className='form-label'>
                Next Appraisal Due <span className='text-danger'>*</span>
              </label>
              <SDLReactSelect
                value={decision.nextDue}
                options={data.dueOptions}
                placeholder='Please Select'
                isDisabled={Boolean(busy)}
                isClearable={false}
                hasError={showMissing && !decision.nextDue}
                onChange={value => setDecision(current => ({ ...current, nextDue: value || '' }))}
              />
            </div>
            <div className='col-12'>
              <label className='form-label' htmlFor='appr-review'>
                Final Review <span className='text-danger'>*</span>
              </label>
              <textarea
                id='appr-review'
                className={`form-control${flag(!decision.remarks.trim())}`}
                rows={3}
                maxLength={REVIEW_MAX}
                value={decision.remarks}
                disabled={Boolean(busy)}
                onChange={event => setDecision(current => ({ ...current, remarks: event.target.value }))}
              />
            </div>
          </div>
        </>
      )}
    </RecruitmentModal>
  )
}

export default EmployeeAppraisalModal
