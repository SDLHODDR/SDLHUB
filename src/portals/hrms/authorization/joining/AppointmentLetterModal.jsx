import { useEffect, useRef, useState } from 'react'
import CancelButton from '../../../../shared/components/buttons/CancelButton'
import SDLReactSelect from '../../../../shared/components/form/SDLReactSelect'
import {
  confirmAction,
  notifyError,
  notifySuccess
} from '../../../../shared/services/alertService'
import RecruitmentModal from '../../pages/recruitment/RecruitmentModal'
import {
  appointmentLetterUrl,
  closeAppointmentLetterTask,
  generateAppointmentLetterReference,
  getAppointmentLetter
} from '../../services/newEmployeeService'

/*
 * Print Appointment Letter task (44, legacy print_appointment_letter.php):
 * choose the staff type (HO / Field / Contract / Trainee), view the letter,
 * generate the reference code, then print (closes the task).
 */

/* Employee details in the Print Tenure Change Letter layout. */
const LetterDetails = ({ employee }) => {
  const fields = [
    ['Employee', `${employee.EMP_CODE} - ${employee.NAME || '-'}`],
    ['Date Of Joining', employee.DOJ],
    ['Company', employee.COMPANY],
    ['Department', employee.DEPARTMENT],
    ['Designation', employee.DESIGNATION],
    ['Division', employee.DIVISION],
    ['Location', employee.LOCATION],
    ['Email', employee.EMAIL],
    ['Mobile', employee.MOBILE]
  ]
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

const AppointmentLetterModal = ({ record, onClose, onDone }) => {
  const [details, setDetails] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [staffType, setStaffType] = useState('')
  const [frameKey, setFrameKey] = useState(0)
  const [busy, setBusy] = useState('')
  const onLoaded = useRef(null)

  // State is set only in the promise callbacks.
  const load = () =>
    getAppointmentLetter(record.ID)
      .then(response => {
        if (!response?.status) throw new Error(response?.message)
        setDetails(response.data)
        setLoadError('')
        onLoaded.current?.()
      })
      .catch(error => {
        setLoadError(error?.message || 'Unable to load the appointment letter details.')
      })

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once per task
  }, [record.ID])

  const template = details?.templates?.find(item => item.value === staffType)
  const letterUrl =
    template && details
      ? appointmentLetterUrl(template.script, details.task.empCode, record.ID)
      : ''
  const reference = details?.reference
  const blocked = Boolean(details?.salaryPending)

  const handleGenerate = async () => {
    const confirmed = await confirmAction(
      'Generate reference code?',
      'A letter reference number will be issued for this appointment letter.'
    )
    if (!confirmed) return
    setBusy('generate')
    try {
      const response = await generateAppointmentLetterReference({ user_task_id: record.ID })
      if (!response?.status) throw new Error(response?.message)
      notifySuccess(response.message || 'Reference Code generated successfully.')
      // Reload the letter so it shows the reference (and its copy is saved).
      onLoaded.current = () => setFrameKey(key => key + 1)
      await load()
      onLoaded.current = null
    } catch (error) {
      notifyError(error?.message || 'Unable to generate the reference code.')
    } finally {
      setBusy('')
    }
  }

  const handlePrint = async () => {
    const confirmed = await confirmAction(
      'Print Appointment Letter?',
      'This closes the Print Appointment Letter task.'
    )
    if (!confirmed) return
    setBusy('print')
    try {
      const response = await closeAppointmentLetterTask({ user_task_id: record.ID })
      if (!response?.status) throw new Error(response?.message)
      notifySuccess(response.message || 'Appointment letter task closed.')
      window.dispatchEvent(new Event('hrms-auth-tasks-changed'))
      onDone?.()
      onClose()
    } catch (error) {
      notifyError(error?.message || 'Unable to close the task.')
    } finally {
      setBusy('')
    }
  }

  return (
    <RecruitmentModal
      titleId='appointment-letter-title'
      title='Print Appointment Letter'
      subtitle={
        details ? (
          <>
            Employee Code: <strong>{details.task.empCode}</strong>
            <span className='mx-2'>|</span>
            Task ID: <strong>{record.ID}</strong>
            <span className='mx-2'>|</span>
            Workflow Task: <strong>44</strong>
          </>
        ) : null
      }
      size='xl'
      loading={!details && !loadError}
      loadError={loadError}
      onClose={onClose}
      footer={<CancelButton onClick={onClose} disabled={Boolean(busy)} />}
    >
      {details && (
        <div>
          <LetterDetails employee={details.employee} />

          {blocked && (
            <div className='alert alert-danger py-2'>
              <i className='fas fa-triangle-exclamation me-2' />
              Please authorize the salary for {details.employee.NAME || details.task.empCode} before
              printing the appointment letter.
            </div>
          )}
          {!blocked && !details.hasPayroll && (
            <div className='alert alert-warning py-2'>
              <i className='fas fa-circle-info me-2' />
              {details.ctcTaskPending
                ? 'The CTC Details task for this employee is still pending, so the CTC in the letter will be blank.'
                : 'No salary has been posted to payroll for this employee yet, so the CTC in the letter will be blank.'}
            </div>
          )}

          <div className='row align-items-center g-2 mb-2'>
            <div className='col-md-4 col-sm-6'>
              <SDLReactSelect
                value={staffType}
                options={(details.templates || []).map(item => ({ value: item.value, label: item.label }))}
                onChange={value => setStaffType(value || '')}
                placeholder='Select Staff Type'
                isDisabled={blocked || Boolean(busy)}
                width='100%'
              />
            </div>
            <div className='col d-flex justify-content-end align-items-center gap-2'>
              {reference ? (
                <span className='badge bg-success-subtle text-success border px-2 py-1'>
                  Reference Code: {reference.docRef} ({reference.docDate})
                </span>
              ) : (
                <button
                  type='button'
                  className='btn btn-warning btn-sm px-3 fw-bold text-dark'
                  onClick={handleGenerate}
                  disabled={blocked || !staffType || Boolean(busy)}
                  title={!staffType ? 'Select the staff type first' : undefined}
                >
                  {busy === 'generate' ? 'Generating...' : 'Generate Reference Code'}
                </button>
              )}
              <button
                className='btn btn-outline-info btn-sm px-3'
                type='button'
                onClick={handlePrint}
                disabled={blocked || !reference || !staffType || Boolean(busy)}
                title={!reference ? 'Generate the reference code first' : !staffType ? 'Select the staff type first' : undefined}
              >
                <i className='fas fa-print me-1' />
                {busy === 'print' ? 'Processing...' : 'Print Appointment Letter'}
              </button>
            </div>
          </div>

          <div
            style={{ height: '60vh', minHeight: '420px', background: '#525659' }}
            className='border rounded overflow-hidden'
          >
            {letterUrl && !blocked ? (
              <iframe
                key={`${staffType}-${frameKey}`}
                title='Appointment letter'
                src={letterUrl}
                className='w-100 h-100 border-0'
              />
            ) : (
              <div className='d-flex justify-content-center align-items-center h-100 text-light small'>
                {blocked ? 'Salary authorization pending.' : 'Select the staff type to view the letter.'}
              </div>
            )}
          </div>
        </div>
      )}
    </RecruitmentModal>
  )
}

export default AppointmentLetterModal
