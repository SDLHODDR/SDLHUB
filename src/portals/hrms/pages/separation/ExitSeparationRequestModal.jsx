import { useState } from 'react'
import CancelButton from '../../../../shared/components/buttons/CancelButton'
import SDLReactSelect from '../../../../shared/components/form/SDLReactSelect'
import { confirmAction } from '../../../../shared/services/alertService'
import useExitTask from '../../hooks/useExitTask'
import {
  saveExitSeparation,
  deactivateExitEmployee
} from '../../services/exitService'
import ExitModalShell from './ExitModalShell'
import { RESIGNATION_TYPES, RESIGNATION_MODES } from './exitOptions'

const RequiredMark = () => <span className='text-danger'>*</span>

const labelFor = (options, value) =>
  options.find(option => option.value === value)?.label || value || '-'

const SeparationForm = ({ details, isDeactivate, task, shellProps }) => {
  const { employee, separation, handoverOptions = [], clearances = [] } = details
  const { busyAction, run } = task

  const [form, setForm] = useState({
    resignType: separation.resignType || '',
    resignMode: separation.resignMode || '',
    handoverTo: separation.handoverTo || '',
    actualRelieveDate: separation.relievingDateIso || separation.expectedRelievingDateIso || '',
    authorizeComments: isDeactivate ? separation.authorizeComments || '' : ''
  })
  const [errors, setErrors] = useState({})

  const update = (field, value) => {
    setForm(current => ({ ...current, [field]: value }))
    setErrors(current => ({ ...current, [field]: '' }))
  }

  const validate = action => {
    const next = {}
    if (!form.authorizeComments.trim()) next.authorizeComments = 'Comments are required.'
    if (action === 'authorize') {
      if (!form.handoverTo) next.handoverTo = 'Handover employee is required.'
      if (!form.actualRelieveDate) next.actualRelieveDate = 'Approved relieve date is required.'
    }
    if (action === 'deactivate') {
      if (!form.resignType) next.resignType = 'Resignation type is required.'
      if (!form.resignMode) next.resignMode = 'Resignation mode is required.'
      if (!form.handoverTo) next.handoverTo = 'Handover employee is required.'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleAuthorize = async action => {
    if (!validate(action)) return
    const confirmed = await confirmAction(
      action === 'authorize' ? 'Authorize separation?' : 'Reject separation?',
      action === 'authorize'
        ? 'Once authorized, the system will generate the Exit Interview task.'
        : 'This action will reject the separation request.'
    )
    if (!confirmed) return
    run(
      action,
      () =>
        saveExitSeparation({
          user_task_id: task.record.ID,
          action,
          handover_to: form.handoverTo,
          relieving_date: form.actualRelieveDate,
          authorize_comments: form.authorizeComments
        }),
      { close: true }
    )
  }

  const handleDeactivate = async () => {
    if (!validate('deactivate')) return
    const openCount = clearances.filter(item => item.status === 'Open').length
    const confirmed = await confirmAction(
      'Deactivate employee?',
      `This will deactivate the employee from all systems and generate the relieving letter task.${openCount ? ` ${openCount} department exit activit${openCount === 1 ? 'y is' : 'ies are'} still open.` : ''}`
    )
    if (!confirmed) return
    run(
      'deactivate',
      () =>
        deactivateExitEmployee({
          user_task_id: task.record.ID,
          resign_type: form.resignType,
          resign_mode: form.resignMode,
          handover_to: form.handoverTo
        }),
      { close: true }
    )
  }

  const fieldError = field =>
    errors[field] && (
      <small className='text-danger d-block mt-1'>{errors[field]}</small>
    )

  const busy = Boolean(busyAction)

  const footer = isDeactivate ? (
    <>
      <button
        type='button'
        className='btn btn-danger me-2'
        onClick={handleDeactivate}
        disabled={busy}
      >
        {busyAction === 'deactivate' ? 'Processing...' : 'Deactivate Employee'}
      </button>
      <CancelButton onClick={task.onClose} disabled={busy} />
    </>
  ) : (
    <>
      <button
        type='button'
        className='btn btn-success me-2'
        onClick={() => handleAuthorize('authorize')}
        disabled={busy}
      >
        {busyAction === 'authorize' ? 'Processing...' : 'Authorize'}
      </button>
      <button
        type='button'
        className='btn btn-danger me-2'
        onClick={() => handleAuthorize('reject')}
        disabled={busy}
      >
        {busyAction === 'reject' ? 'Processing...' : 'Reject'}
      </button>
      <CancelButton onClick={task.onClose} disabled={busy} />
    </>
  )

  return (
    <ExitModalShell {...shellProps} footer={footer}>
      <div className='row g-3'>
        <div className='col-lg-6'>
          <div className='row g-3'>
            <div className='col-12'>
              <label className='form-label'>
                Employee Code <RequiredMark />
              </label>
              <input
                className='form-control'
                value={`${employee.name || '-'} - ${employee.code || '-'}`}
                disabled
              />
            </div>
            <div className='col-md-4'>
              <label className='form-label'>
                Resignation Type <RequiredMark />
              </label>
              {isDeactivate ? (
                <select
                  className={`form-select tenure-change-select${errors.resignType ? ' is-invalid' : ''}`}
                  value={form.resignType}
                  onChange={event => update('resignType', event.target.value)}
                >
                  <option value=''>Please Select</option>
                  {RESIGNATION_TYPES.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  className='form-control'
                  value={labelFor(RESIGNATION_TYPES, separation.resignType)}
                  disabled
                />
              )}
              {fieldError('resignType')}
            </div>
            <div className='col-md-4'>
              <label className='form-label'>
                Resignation Mode <RequiredMark />
              </label>
              {isDeactivate ? (
                <select
                  className={`form-select tenure-change-select${errors.resignMode ? ' is-invalid' : ''}`}
                  value={form.resignMode}
                  onChange={event => update('resignMode', event.target.value)}
                >
                  <option value=''>Please Select</option>
                  {RESIGNATION_MODES.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  className='form-control'
                  value={labelFor(RESIGNATION_MODES, separation.resignMode)}
                  disabled
                />
              )}
              {fieldError('resignMode')}
            </div>
            <div className='col-md-4'>
              <label className='form-label'>Recipient Email</label>
              <input
                className='form-control'
                value={separation.recipientEmail || ''}
                disabled
              />
            </div>
            <div className='col-md-6'>
              <label className='form-label'>
                Resignation Date <RequiredMark />
              </label>
              <input
                className='form-control'
                value={separation.resignationDate || '-'}
                disabled
              />
            </div>
            <div className='col-md-6'>
              <label className='form-label'>
                Expected Relieving Date <RequiredMark />
              </label>
              <input
                className='form-control'
                value={separation.expectedRelievingDate || '-'}
                disabled
              />
            </div>
          </div>
        </div>

        <div className='col-lg-6 d-flex flex-column'>
          <label className='form-label'>
            Employee Comments <RequiredMark />
          </label>
          <textarea
            className='form-control flex-grow-1'
            style={{ minHeight: '206px' }}
            value={separation.employeeComments || ''}
            disabled
          />
        </div>

        <div className='col-lg-3 col-md-6'>
          <label className='form-label'>
            Handover To <RequiredMark />
          </label>
          <SDLReactSelect
            value={form.handoverTo}
            options={handoverOptions}
            onChange={value => update('handoverTo', value)}
            placeholder='Select Employee'
          />
          {fieldError('handoverTo')}
        </div>
        <div className='col-lg-3 col-md-6'>
          <label className='form-label'>
            Approved Relieve Date <RequiredMark />
          </label>
          {isDeactivate ? (
            <input
              className='form-control'
              value={separation.relievingDate || '-'}
              disabled
            />
          ) : (
            <input
              type='date'
              className={`form-control tenure-change-select${errors.actualRelieveDate ? ' is-invalid' : ''}`}
              value={form.actualRelieveDate}
              onChange={event => update('actualRelieveDate', event.target.value)}
            />
          )}
          {fieldError('actualRelieveDate')}
        </div>
        <div className='col-lg-6'>
          <label className='form-label'>
            Authorize Comments <RequiredMark />
          </label>
          <input
            className={`form-control${errors.authorizeComments ? ' is-invalid' : ''}`}
            value={form.authorizeComments}
            disabled={isDeactivate}
            maxLength={500}
            onChange={event => update('authorizeComments', event.target.value)}
          />
          {fieldError('authorizeComments')}
        </div>
      </div>

      {isDeactivate && clearances.length > 0 && (
        <div className='table-responsive tenure-ctc-table-wrap mt-3'>
          <table className='table table-sm tenure-ctc-table mb-0'>
            <thead>
              <tr>
                <th style={{ width: '50px' }}>No</th>
                <th>Department</th>
                <th>Exit Activity Status</th>
                <th>Exit Activity Done By</th>
              </tr>
            </thead>
            <tbody>
              {clearances.map((item, index) => (
                <tr key={`${item.department}-${index}`}>
                  <td>{index + 1}</td>
                  <td>{item.department || '-'}</td>
                  <td>
                    <span className={`badge ${item.status === 'Open' ? 'bg-warning text-dark' : 'bg-success'}`}>
                      {item.status}
                    </span>
                  </td>
                  <td>{item.doneBy || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ExitModalShell>
  )
}

/*
 * Employee Separation screen. Used for Separation Request (18) and, with
 * mode='deactivate', for Deactivate Employee (23).
 */
const ExitSeparationRequestModal = ({
  config,
  record,
  onClose,
  onSuccess,
  mode = 'authorize'
}) => {
  const isDeactivate = mode === 'deactivate'
  const task = useExitTask({ record, onClose, onSuccess })
  const shellProps = {
    titleId: 'exit-separation-title',
    title: config?.title || 'Separation Request',
    record,
    loading: task.loading,
    loadError: task.loadError,
    actionError: task.actionError,
    onClose
  }

  if (!task.details) return <ExitModalShell {...shellProps} />
  return (
    <SeparationForm
      details={task.details}
      isDeactivate={isDeactivate}
      task={{ ...task, record, onClose }}
      shellProps={shellProps}
    />
  )
}

export default ExitSeparationRequestModal
