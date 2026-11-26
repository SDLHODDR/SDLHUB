import { useEffect, useState } from 'react'
import SaveButton from '../../../../shared/components/buttons/SaveButton'
import SDLCalendar from '../../../../shared/components/calendar/SDLCalendar'
import SDLReactSelect from '../../../../shared/components/form/SDLReactSelect'
import {
  confirmAction,
  notifyError,
  notifySuccess
} from '../../../../shared/services/alertService'
import { parseDateValue } from '../../../../shared/utils/commonUtils'
import RecruitmentModal from '../../pages/recruitment/RecruitmentModal'
import { toDateValue } from '../../pages/joining/joiningFormUtils'
import { getJoiningChecklist, saveJoiningChecklist } from '../../services/newEmployeeService'

/*
 * Joining checklist tasks for a newly activated employee:
 *   4  Joining Activity      - the department's joining activities (legacy dept_access_req.php)
 *   15 Employee Induction    - the JD's induction areas, with the induction date (employee_induction.php)
 *   14 Employee Verification - the experience references (employee_verify.php)
 * Each row needs a status and remarks; Save keeps partial work, Submit needs every row.
 */

const REMARK_MAX = 200

const EmployeeSummary = ({ employee, taskDepartment, taskId }) => {
  const fields = [
    ['Employee', `${employee.code} - ${employee.name || '-'}`],
    ['Date Of Joining', employee.doj],
    ['Designation', employee.designation],
    ['Department', employee.department],
    ['Division', employee.division],
    ['Location', employee.location]
  ]
  if (taskId === '4') fields.push(['Activities Of', taskDepartment])
  return (
    <div className='row g-2 tenure-legacy-grid pb-3 mb-3 border-bottom'>
      {fields.map(([label, value]) => (
        <div className='col-md-4' key={label}>
          <strong className='grid-label'>{label} : </strong>
          <span className='grid-val'>{value || '-'}</span>
        </div>
      ))}
    </div>
  )
}

const isMissing = (row, taskId) =>
  !row.status || !String(row.remarks || '').trim() || (taskId === '15' && !row.date)

const JoiningChecklistModal = ({ record, onClose, onDone }) => {
  const [data, setData] = useState(null)
  const [rows, setRows] = useState([])
  const [loadError, setLoadError] = useState('')
  const [busy, setBusy] = useState('')
  const [showMissing, setShowMissing] = useState(false)

  useEffect(() => {
    let active = true
    getJoiningChecklist(record.ID)
      .then(response => {
        if (!active) return
        if (!response?.status) throw new Error(response?.message)
        setData(response.data)
        setRows(response.data.rows || [])
      })
      .catch(error => {
        if (active) setLoadError(error?.message || 'Unable to load the task.')
      })
    return () => {
      active = false
    }
  }, [record.ID])

  const taskId = data?.taskId || ''
  const isVerification = taskId === '14'
  const isInduction = taskId === '15'
  const statusOptions = data?.statuses || []

  const setField = (id, key, value) =>
    setRows(current => current.map(row => (row.id === id ? { ...row, [key]: value } : row)))

  const payload = action => ({
    user_task_id: record.ID,
    action,
    rows: rows.map(row => ({ id: row.id, status: row.status, remarks: row.remarks, date: row.date || '' }))
  })

  const handleSave = async () => {
    setBusy('save')
    try {
      const response = await saveJoiningChecklist(payload('save'))
      if (!response?.status) throw new Error(response?.message)
      notifySuccess(response.message || 'Saved successfully.')
    } catch (error) {
      notifyError(error?.message || 'Unable to save.')
    } finally {
      setBusy('')
    }
  }

  const handleSubmit = async () => {
    const pending = rows.filter(row => isMissing(row, taskId)).length
    if (pending > 0) {
      setShowMissing(true)
      notifyError(
        `Please enter ${isInduction ? 'a date, status and remarks' : 'a status and remarks'} for every row (${pending} pending).`
      )
      return
    }
    const confirmed = await confirmAction(`Submit ${data.title}?`, 'The task closes and can no longer be changed.')
    if (!confirmed) return
    setBusy('submit')
    try {
      const response = await saveJoiningChecklist(payload('submit'))
      if (!response?.status) throw new Error(response?.message)
      notifySuccess(response.message)
      window.dispatchEvent(new Event('hrms-auth-tasks-changed'))
      onDone?.()
      onClose()
    } catch (error) {
      notifyError(error?.message || 'Unable to submit.')
    } finally {
      setBusy('')
    }
  }

  const missing = row => showMissing && isMissing(row, taskId)

  return (
    <RecruitmentModal
      titleId='joining-checklist-title'
      title={data?.title || 'Joining Task'}
      subtitle={
        data ? (
          <>
            Employee Code: <strong>{data.employee.code}</strong>
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
            <SaveButton onClick={handleSave} isSubmitting={busy === 'save'} disabled={Boolean(busy) || rows.length === 0}>
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
          <EmployeeSummary employee={data.employee} taskDepartment={data.taskDepartment} taskId={taskId} />
          {rows.length === 0 ? (
            <div className='alert alert-info mb-0'>
              Nothing is set up for this task, so it can be submitted directly.
            </div>
          ) : (
            <table className='table table-bordered table-sm align-middle mb-0 recruitment-flow-table recruitment-questions-table'>
              <thead>
                <tr>
                  <th style={{ width: '4%' }}>No</th>
                  <th style={{ width: isVerification ? '14%' : '34%' }}>
                    {isVerification ? 'Reference' : isInduction ? 'Induction Area' : 'Activity'}
                  </th>
                  {isVerification && (
                    <>
                      <th style={{ width: '14%' }}>Organisation</th>
                      <th style={{ width: '10%' }}>Position</th>
                      <th style={{ width: '10%' }}>Telephone</th>
                      <th style={{ width: '7%' }}>Years Known</th>
                    </>
                  )}
                  {isInduction && <th style={{ width: '16%' }}>Induction On <span className='text-danger'>*</span></th>}
                  <th style={{ width: '16%' }}>
                    {isVerification ? 'Verified' : 'Status'} <span className='text-danger'>*</span>
                  </th>
                  <th>
                    Remarks <span className='text-danger'>*</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={row.id}>
                    <td>{index + 1}</td>
                    <td className={missing(row) ? 'text-danger fw-semibold' : 'fw-semibold'}>{row.label || '-'}</td>
                    {isVerification && (
                      <>
                        <td>{row.organisation || '-'}</td>
                        <td>{row.position || '-'}</td>
                        <td>{row.telephone || '-'}</td>
                        <td>{row.yearsKnown || '-'}</td>
                      </>
                    )}
                    {isInduction && (
                      <td>
                        <SDLCalendar
                          value={parseDateValue(row.date)}
                          allowAllDates
                          disabled={Boolean(busy)}
                          inputClassName={showMissing && !row.date ? 'p-invalid' : ''}
                          onChange={date => setField(row.id, 'date', toDateValue(date))}
                        />
                      </td>
                    )}
                    <td>
                      <SDLReactSelect
                        value={row.status || ''}
                        options={statusOptions}
                        placeholder='Please Select'
                        isDisabled={Boolean(busy)}
                        hasError={showMissing && !row.status}
                        onChange={value => setField(row.id, 'status', value || '')}
                      />
                    </td>
                    <td>
                      <input name="checklistRemarks"
                        type='text'
                        className={`form-control form-control-sm${showMissing && !String(row.remarks || '').trim() ? ' is-invalid' : ''}`}
                        aria-label={`Remarks for ${row.label}`}
                        maxLength={REMARK_MAX}
                        value={row.remarks || ''}
                        disabled={Boolean(busy)}
                        onChange={event => setField(row.id, 'remarks', event.target.value)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </RecruitmentModal>
  )
}

export default JoiningChecklistModal
