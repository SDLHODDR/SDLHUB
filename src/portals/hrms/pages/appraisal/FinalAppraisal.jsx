import { Fragment, useEffect, useMemo, useState } from 'react'
import BreadcrumbNav from '../../../../shared/components/BreadcrumbNav'
import SaveButton from '../../../../shared/components/buttons/SaveButton'
import CancelButton from '../../../../shared/components/buttons/CancelButton'
import SDLCalendar from '../../../../shared/components/calendar/SDLCalendar'
import SDLReactSelect from '../../../../shared/components/form/SDLReactSelect'
import { parseDateValue, toDateInputValue } from '../../../../shared/utils/commonUtils'
import { confirmAction, notifyError, notifySuccess } from '../../../../shared/services/alertService'
import { getAppraiserResponse, getFinalAppraisal, processFinalAppraisal } from '../../services/appraisalService'
import RecruitmentModal from '../recruitment/RecruitmentModal'
import '../../assets/css/appraisal.css'

const INCREMENT_PATTERN = /^\d{1,7}(\.\d{1,2})?$/
const REMARK_MAX = 4000

const rupees = value => (value ? Number(value).toLocaleString('en-IN', { maximumFractionDigits: 0 }) : '-')
/** Like rupees, but a recorded 0 shows as 0 (only a missing figure is '-'). */
const amount = value => (value === null || value === undefined || value === '' ? '-' : Number(value).toLocaleString('en-IN', { maximumFractionDigits: 0 }))

/** First day of the date's month, as YYYY-MM-DD (increments start on the 1st, legacy month picker). */
const monthStart = date => (date ? toDateInputValue(new Date(date.getFullYear(), date.getMonth(), 1)) : '')

/** Editable values of each employee: rows not yet submitted start selected (legacy). */
const editsFrom = employees =>
  Object.fromEntries(
    employees.map(employee => [
      employee.code,
      {
        selected: employee.editable,
        promotion: employee.promotion,
        increment: String(employee.increment ?? ''),
        incrementFrom: employee.incrementFrom,
        promotionFrom: employee.promotionFrom,
        remarks: employee.remarks
      }
    ])
  )

/* The approving appraiser's answers and remarks (legacy "HOD Remarks"). */
const AppraiserResponseModal = ({ appraisalId, employee, onClose }) => {
  const [response, setResponse] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    getAppraiserResponse(appraisalId, employee.code)
      .then(result => {
        if (!result?.status) throw new Error(result?.message)
        if (active) setResponse(result.data)
      })
      .catch(loadError => {
        if (active) setError(loadError?.message || 'Unable to load the response.')
      })
    return () => {
      active = false
    }
  }, [appraisalId, employee.code])

  return (
    <RecruitmentModal
      titleId='appraiser-response-title'
      title={`Appraiser's Response - ${employee.name}`}
      size='lg'
      loading={!response && !error}
      loadError={error}
      onClose={onClose}
    >
      {response && (
        <>
          <div className='row g-2 mb-3'>
            <div className='col-sm-6'>
              <strong>Appraiser:</strong> {response.appraiser}
            </div>
            <div className='col-sm-3'>
              <strong>Promotion:</strong> {response.promotion}
            </div>
            <div className='col-sm-3'>
              <strong>Increment P.M.:</strong> {amount(response.increment)}
            </div>
            <div className='col-12'>
              <strong>Remarks:</strong>
              <div className='border rounded p-2 mt-1 bg-light' style={{ whiteSpace: 'pre-wrap' }}>
                {response.remarks || '-'}
              </div>
            </div>
          </div>
          <div className='table-responsive'>
            <table className='table table-bordered table-sm align-middle mb-0 appraisal-table'>
              <thead>
                <tr>
                  <th>SubGroup</th>
                  <th>Question</th>
                  <th>Answer</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {response.answers.length === 0 && (
                  <tr>
                    <td colSpan={4} className='text-center text-muted'>
                      No answers recorded.
                    </td>
                  </tr>
                )}
                {response.answers.map((answer, index) => (
                  <tr key={index}>
                    <td>{answer.subgroup || answer.group || '-'}</td>
                    <td>{answer.question}</td>
                    <td>{answer.answer || '-'}</td>
                    <td>{answer.remarks || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </RecruitmentModal>
  )
}

/*
 * Final Appraisal (legacy final_appraisal.php): for employees an appraiser has approved, HR sets the final
 * promotion, monthly increment, effective dates and remarks (Save), then Submit raises the CTC Change and,
 * when promoted, the Promotion task. Submitted employees are read-only.
 */
const FinalAppraisal = () => {
  const [options, setOptions] = useState([])
  const [appraisalId, setAppraisalId] = useState('')
  const [data, setData] = useState(null)
  const [edits, setEdits] = useState({})
  const [loading, setLoading] = useState(false)
  const [busy, setBusy] = useState(false)
  const [responseFor, setResponseFor] = useState(null)

  useEffect(() => {
    getFinalAppraisal()
      .then(response => {
        if (!response?.status) throw new Error(response?.message)
        setOptions(response.data.appraisals || [])
      })
      .catch(error => notifyError(error?.message || 'Unable to load the appraisals.'))
  }, [])

  const load = id => {
    setAppraisalId(id || '')
    setData(null)
    setEdits({})
    if (!id) return
    setLoading(true)
    getFinalAppraisal(id)
      .then(response => {
        if (!response?.status) throw new Error(response?.message)
        setData(response.data)
        setEdits(editsFrom(response.data.employees))
      })
      .catch(error => notifyError(error?.message || 'Unable to load the appraisal.'))
      .finally(() => setLoading(false))
  }

  const set = (code, key, value) => setEdits(current => ({ ...current, [code]: { ...current[code], [key]: value } }))

  const departments = useMemo(() => {
    const groups = []
    ;(data?.employees || []).forEach(employee => {
      const last = groups[groups.length - 1]
      if (last && last.name === employee.department) last.employees.push(employee)
      else groups.push({ name: employee.department, employees: [employee] })
    })
    return groups
  }, [data])

  const send = async action => {
    const chosen = (data?.employees || []).filter(employee => employee.editable && edits[employee.code]?.selected)
    if (chosen.length === 0) {
      notifyError('Please select one or more employees!')
      return
    }
    const invalid = chosen.filter(employee => !INCREMENT_PATTERN.test(String(edits[employee.code].increment).trim()))
    if (invalid.length) {
      notifyError(`Please enter a valid monthly increment for: ${invalid.map(employee => employee.name).join(', ')}`)
      return
    }
    const missing = chosen.filter(employee => edits[employee.code].promotion === 'Y' && !edits[employee.code].remarks.trim())
    if (missing.length) {
      notifyError(`Promotion Remarks are required for: ${missing.map(employee => employee.name).join(', ')}`)
      return
    }
    if (action === 'submit' && !(await confirmAction('Are you sure?', 'This will generate task for further process!'))) return
    setBusy(true)
    try {
      const response = await processFinalAppraisal({
        action,
        id: appraisalId,
        employees: chosen.map(employee => {
          const edit = edits[employee.code]
          return {
            code: employee.code,
            promotion: edit.promotion,
            increment: String(edit.increment).trim(),
            increment_from: edit.incrementFrom,
            promotion_from: edit.promotionFrom,
            remarks: edit.remarks.trim()
          }
        })
      })
      if (!response?.status) throw new Error(response?.message)
      notifySuccess(response.message)
      load(appraisalId)
    } catch (error) {
      notifyError(error?.message || 'Unable to save the final appraisal.')
    } finally {
      setBusy(false)
    }
  }

  const editableCount = (data?.employees || []).filter(employee => employee.editable).length
  const minDate = parseDateValue(data?.minEffectiveFrom) || undefined

  return (
    <>
      <div className='page-header' style={{ marginBottom: '8px' }}>
        <div className='page-title'>
          <h4>Final Appraisal</h4>
        </div>
        <BreadcrumbNav items={[{ text: 'Home', link: '/hrms/dashboard' }, { text: 'Appraisal', link: '#' }, { text: 'Final Appraisal' }]} />
      </div>
      <div className='row'>
        <div className='col-12 px-0'>
          <div className='card'>
            <div className='card-body'>
              <div className='row mb-3'>
                <div className='col-md-6 col-lg-5'>
                  <label className='form-label'>Appraisal</label>
                  <SDLReactSelect value={appraisalId} options={options} placeholder='Please Select Appraisal' onChange={load} />
                </div>
              </div>
              {loading && <div className='text-muted'>Loading...</div>}
              {data && !loading && (
                <>
                  <div className='final-appraisal-scroll'>
                    <table className='table table-bordered table-sm mb-0 appraisal-table final-appraisal-table'>
                      <thead>
                        <tr>
                          <th rowSpan={2} className='text-center'>
                            #
                          </th>
                          <th rowSpan={2}>
                            Name
                          </th>
                          <th rowSpan={2}>Designation</th>
                          <th rowSpan={2}>DOJ</th>
                          {data.ctcYears.map((label, index) => (
                            <th key={label} colSpan={2} className='text-center'>
                              {index === 0 ? 'Current CTC' : 'CTC'}
                              <br />({label})
                            </th>
                          ))}
                          <th colSpan={2} className='text-center'>
                            HOD Recommendation
                          </th>
                          <th colSpan={4} className='text-center'>
                            Final Recommendation
                          </th>
                          <th rowSpan={2} style={{ minWidth: '16rem' }}>
                            Remarks
                          </th>
                        </tr>
                        <tr>
                          {data.ctcYears.map(label => (
                            <Fragment key={label}>
                              <th className='text-center'>P. M.</th>
                              <th className='text-center'>P. A.</th>
                            </Fragment>
                          ))}
                          <th className='text-center'>Promotion</th>
                          <th className='text-center'>Increment P.M.</th>
                          <th className='text-center'>Promotion</th>
                          <th className='text-center'>Increment P.M.</th>
                          <th className='text-center'>Increment Effective From</th>
                          <th className='text-center'>Promo Effective From</th>
                        </tr>
                      </thead>
                      <tbody>
                        {departments.length === 0 && (
                          <tr>
                            <td colSpan={17} className='text-center text-muted'>
                              No approved employees in this appraisal.
                            </td>
                          </tr>
                        )}
                        {departments.map(department => [
                          <tr key={`d-${department.name}`} className='final-appraisal-dept'>
                            <td colSpan={17}>{department.name || '-'}</td>
                          </tr>,
                          ...department.employees.map(employee => {
                            const edit = edits[employee.code] || {}
                            const disabled = !employee.editable || !edit.selected || busy
                            return (
                              <tr key={employee.code} className={employee.editable ? '' : 'final-appraisal-locked'}>
                                <td className='text-center'>
                                  {employee.editable ? (
                                    <input
                                      type='checkbox'
                                      className='form-check-input'
                                      aria-label={`Select ${employee.name}`}
                                      checked={Boolean(edit.selected)}
                                      disabled={busy}
                                      onChange={event => set(employee.code, 'selected', event.target.checked)}
                                    />
                                  ) : (
                                    <i className='ti ti-lock text-muted' title='Submitted' />
                                  )}
                                </td>
                                <td>
                                  {employee.name}
                                </td>
                                <td>{employee.designation}</td>
                                <td>{employee.doj}</td>
                                {employee.ctc.map((annual, index) => (
                                  <Fragment key={index}>
                                    <td className='text-end'>{annual ? rupees(annual / 12) : '-'}</td>
                                    <td className='text-end'>{rupees(annual)}</td>
                                  </Fragment>
                                ))}
                                <td className='text-center'>{employee.hodPromotion}</td>
                                <td className='text-end'>
                                  {amount(employee.hodIncrement)}
                                  <button
                                    type='button'
                                    className='btn btn-link p-0 ms-1'
                                    title='HOD Remarks'
                                    aria-label={`HOD remarks for ${employee.name}`}
                                    onClick={() => setResponseFor(employee)}
                                  >
                                    <i className='ti ti-eye' />
                                  </button>
                                </td>
                                <td>
                                  <select
                                    className='form-select form-select-sm'
                                    aria-label={`Promotion for ${employee.name}`}
                                    value={edit.promotion || 'N'}
                                    disabled={disabled}
                                    onChange={event => set(employee.code, 'promotion', event.target.value)}
                                  >
                                    <option value='Y'>Yes</option>
                                    <option value='N'>No</option>
                                  </select>
                                </td>
                                <td>
                                  <input
                                    type='number'
                                    min='0'
                                    step='1'
                                    className='form-control form-control-sm text-end'
                                    style={{ width: '6.5rem' }}
                                    aria-label={`Increment for ${employee.name}`}
                                    value={edit.increment ?? ''}
                                    disabled={disabled}
                                    onChange={event => set(employee.code, 'increment', event.target.value)}
                                  />
                                </td>
                                {['incrementFrom', 'promotionFrom'].map(key => (
                                  <td key={key} style={{ minWidth: '9.5rem' }}>
                                    <SDLCalendar
                                      value={parseDateValue(edit[key])}
                                      onChange={date => set(employee.code, key, monthStart(date))}
                                      minDate={minDate}
                                      allowAllDates
                                      showHolidays={false}
                                      disabled={disabled}
                                    />
                                  </td>
                                ))}
                                <td>
                                  <textarea
                                    className='form-control form-control-sm'
                                    rows={2}
                                    style={{ minWidth: '16rem' }}
                                    maxLength={REMARK_MAX}
                                    aria-label={`Remarks for ${employee.name}`}
                                    value={edit.remarks ?? ''}
                                    disabled={disabled}
                                    onChange={event => set(employee.code, 'remarks', event.target.value)}
                                  />
                                </td>
                              </tr>
                            )
                          })
                        ])}
                      </tbody>
                    </table>
                  </div>
                  <p className='text-muted small mt-2 mb-0'>
                    Increments take effect from the 1st of the month chosen. Saving replaces the appraiser&apos;s figures with the final ones.
                  </p>
                  <div className='d-flex justify-content-center gap-2 mt-3'>
                    <SaveButton onClick={() => send('save')} isSubmitting={busy} disabled={editableCount === 0}>
                      Save
                    </SaveButton>
                    <button type='button' className='btn btn-warning' onClick={() => send('submit')} disabled={busy || editableCount === 0}>
                      Submit
                    </button>
                    <CancelButton onClick={() => load(appraisalId)} disabled={busy} />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      {responseFor && <AppraiserResponseModal appraisalId={appraisalId} employee={responseFor} onClose={() => setResponseFor(null)} />}
    </>
  )
}

export default FinalAppraisal
