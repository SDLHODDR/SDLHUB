import { useState } from 'react'
import SaveButton from '../../../../shared/components/buttons/SaveButton'
import CancelButton from '../../../../shared/components/buttons/CancelButton'
import { confirmAction } from '../../../../shared/services/alertService'
import useExitTask from '../../hooks/useExitTask'
import { saveExitActivity } from '../../services/exitService'
import ExitModalShell from './ExitModalShell'
import ExitEmployeeSummary from './ExitEmployeeSummary'

// HR_EMP_DEPT_ACTIVITY.STATUS (legacy exit_act.php).
const ACTIVITY_STATUS_OPTIONS = [
  { value: 'Y', label: 'Yes' },
  { value: 'N', label: 'No' },
  { value: 'X', label: 'Not Applicable' }
]

const ActivityForm = ({ details, task, shellProps }) => {
  const { employee, separation, activities = [], activityDepartment } = details
  const { busyAction, run, record } = task

  const [rows, setRows] = useState(() =>
    Object.fromEntries(
      activities.map(activity => [
        activity.id,
        { status: activity.status || '', remarks: activity.remarks || '' }
      ])
    )
  )
  const [errors, setErrors] = useState({})
  // Submit is enabled only after the current values have been saved.
  const [saved, setSaved] = useState(
    activities.length > 0 && activities.every(activity => activity.status)
  )

  const updateRow = (id, field, value) => {
    setRows(current => ({ ...current, [id]: { ...current[id], [field]: value } }))
    setErrors(current => ({ ...current, [id]: '' }))
    setSaved(false)
  }

  const validate = () => {
    const next = {}
    activities.forEach(activity => {
      const row = rows[activity.id] || {}
      if (!row.status || !row.remarks?.trim()) {
        next[activity.id] = 'Status and remarks are required.'
      }
    })
    setErrors(next)
    return Object.keys(next).length === 0
  }

  // No activity may be left as 'No' to submit (legacy exit_act.php).
  const hasPending = activities.some(activity => rows[activity.id]?.status === 'N')

  const payload = action => ({
    user_task_id: record.ID,
    action,
    rows: activities.map(activity => ({
      dept_act_id: activity.id,
      status: rows[activity.id]?.status || '',
      remarks: rows[activity.id]?.remarks || ''
    }))
  })

  // Save only updates the activity values; the task stays open.
  const handleSave = async () => {
    if (!validate()) return
    const ok = await run('save', () => saveExitActivity(payload('save')))
    if (ok) setSaved(true)
  }

  // Submit saves the values and closes this department's task, which marks
  // the department as cleared on Deactivate Employee.
  const handleSubmit = async () => {
    if (!validate()) return
    const confirmed = await confirmAction(
      'Submit departmental activity?',
      'Do you want to submit Departmental activity?'
    )
    if (!confirmed) return
    run('submit', () => saveExitActivity(payload('submit')), { close: true })
  }

  const busy = Boolean(busyAction)

  return (
    <ExitModalShell
      {...shellProps}
      footer={
        activities.length > 0 && (
          <>
            <SaveButton
              onClick={handleSave}
              disabled={busy}
              isSubmitting={busyAction === 'save'}
              className='me-2'
            >
              Save
            </SaveButton>
            <button
              type='button'
              className='btn btn-success me-2'
              onClick={handleSubmit}
              disabled={busy || !saved || hasPending}
              title={
                hasPending
                  ? 'All activities must be Yes or Not Applicable to submit.'
                  : !saved
                    ? 'Save the activities before submitting.'
                    : undefined
              }
            >
              {busyAction === 'submit' ? 'Processing...' : 'Submit'}
            </button>
            <CancelButton onClick={task.onClose} disabled={busy} />
          </>
        )
      }
    >
      <ExitEmployeeSummary
        employee={employee}
        relievingDate={separation.relievingDate}
        extra={[
          { label: 'Email', value: employee.email },
          { label: 'Department Activity For', value: activityDepartment }
        ]}
      />

      {activities.length === 0 ? (
        <div className='alert alert-warning'>
          No exit activities are mapped for this department.
        </div>
      ) : (
        <div className='table-responsive tenure-ctc-table-wrap'>
          <table className='table table-sm tenure-ctc-table mb-2'>
            <thead>
              <tr>
                <th style={{ width: '50px' }}>No</th>
                <th>Activity Description</th>
                <th style={{ width: '220px' }}>
                  Status <span className='text-danger'>*</span>
                </th>
                <th style={{ width: '360px' }}>
                  Remarks <span className='text-danger'>*</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {activities.map((activity, index) => (
                <tr key={activity.id}>
                  <td>{index + 1}</td>
                  <td>{activity.activity}</td>
                  <td>
                    <select
                      className={`form-select form-select-sm tenure-change-select${errors[activity.id] && !rows[activity.id]?.status ? ' is-invalid' : ''}`}
                      value={rows[activity.id]?.status ?? ''}
                      onChange={event =>
                        updateRow(activity.id, 'status', event.target.value)
                      }
                      aria-label={`Status for ${activity.activity}`}
                    >
                      <option value=''>Select Status</option>
                      {ACTIVITY_STATUS_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      type='text'
                      className={`form-control form-control-sm${errors[activity.id] && !rows[activity.id]?.remarks?.trim() ? ' is-invalid' : ''}`}
                      value={rows[activity.id]?.remarks ?? ''}
                      maxLength={200}
                      onChange={event =>
                        updateRow(activity.id, 'remarks', event.target.value)
                      }
                      aria-label={`Remarks for ${activity.activity}`}
                    />
                    {errors[activity.id] && (
                      <small className='text-danger d-block mt-1'>
                        {errors[activity.id]}
                      </small>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ExitModalShell>
  )
}

const ExitActivityModal = ({ config, record, onClose, onSuccess }) => {
  const task = useExitTask({ record, onClose, onSuccess })
  const shellProps = {
    titleId: 'exit-activity-title',
    title: config?.title || 'Exit Activity',
    record,
    loading: task.loading,
    loadError: task.loadError,
    actionError: task.actionError,
    onClose
  }

  if (!task.details) return <ExitModalShell {...shellProps} />
  return (
    <ActivityForm
      details={task.details}
      task={{ ...task, record, onClose }}
      shellProps={shellProps}
    />
  )
}

export default ExitActivityModal
