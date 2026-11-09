import { useEffect, useState } from 'react'
import SDLAuthorizationActionButtons from '../../../../shared/components/buttons/SDLAuthorizationActionButtons'
import SaveButton from '../../../../shared/components/buttons/SaveButton'
import SDLReactSelect from '../../../../shared/components/form/SDLReactSelect'
import { confirmAction, notifySuccess } from '../../../../shared/services/alertService'
import { getRecruitmentTask, processRecruitmentTask } from '../../services/recruitmentService'
import RecruitmentModal from '../../pages/recruitment/RecruitmentModal'
import { REMARK_MAX_LENGTH } from '../../pages/recruitment/recruitmentOptions'

const TASK_AUTHORIZE = 2

const CONFIRMATIONS = {
  authorize: ['Authorize this request?', 'The system will generate a task for HR to assign a recruiter.'],
  reject: ['Reject this request?', 'This action will reject the recruitment request.'],
  assign: ['Assign this recruiter?', 'The system will generate a task for the recruiter for further process.']
}

const Detail = ({ label, value, className = 'col-sm-6 col-lg-3' }) => (
  <div className={className}>
    <label className='form-label mb-1'>{label}</label>
    <div className='form-control-plaintext py-0 text-break'>{value || '-'}</div>
  </div>
)

/* HOD Authorize / Reject (task 2) and Assign Recruiter (task 5). Legacy recruitment_req.php with a task. */
const RecruitmentTaskModal = ({ taskId, title, record, onClose, onSuccess }) => {
  const [details, setDetails] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [remarks, setRemarks] = useState('')
  const [recruiter, setRecruiter] = useState('')
  const [fieldError, setFieldError] = useState('')
  const [actionError, setActionError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let active = true
    getRecruitmentTask({ taskId, userTaskId: record.ID })
      .then(response => {
        if (!response?.status) throw new Error(response?.message)
        if (active) setDetails(response.data)
      })
      .catch(error => {
        if (active) setLoadError(error?.message || 'Unable to load the task.')
      })
    return () => {
      active = false
    }
  }, [taskId, record.ID])

  const run = async action => {
    if (action === 'assign' && !recruiter) {
      setFieldError('Please select a recruiter.')
      return
    }
    if (action !== 'assign' && !remarks.trim()) {
      setFieldError('Authorization remarks are required.')
      return
    }
    setFieldError('')
    const confirmed = await confirmAction(...CONFIRMATIONS[action])
    if (!confirmed) return

    setBusy(true)
    setActionError('')
    try {
      const response = await processRecruitmentTask({
        task_id: taskId,
        user_task_id: record.ID,
        action,
        remarks: remarks.trim(),
        assigned_to: recruiter
      })
      if (!response?.status) throw new Error(response?.message)
      notifySuccess(response.message)
      onSuccess()
    } catch (error) {
      setActionError(error?.message || 'Unable to process the task.')
    } finally {
      setBusy(false)
    }
  }

  const request = details?.request
  const isAuthorizeTask = taskId === TASK_AUTHORIZE

  return (
    <RecruitmentModal
      titleId='recruitment-task-title'
      title={request ? `${title} - #REQ${request.id}` : title}
      size='lg'
      loading={!details && !loadError}
      loadError={loadError}
      onClose={onClose}
      footer={
        isAuthorizeTask ? (
          <SDLAuthorizationActionButtons
            loading={busy}
            onAuthorize={() => run('authorize')}
            onReject={() => run('reject')}
          />
        ) : (
          <SaveButton onClick={() => run('assign')} isSubmitting={busy}>
            Assign Recruiter
          </SaveButton>
        )
      }
    >
      {request && (
        <>
          {actionError && <div className='alert alert-danger py-2'>{actionError}</div>}
          <div className='row g-3'>
            <Detail label='Organogram' value={request.organogram} className='col-md-8' />
            <Detail label='Open Location' value={request.location} className='col-md-4' />
            <Detail label='Position Count' value={request.positionCount} />
            <Detail label='Positions Occupied' value={request.positionsOccupied} />
            <Detail label='Required Positions' value={request.requiredPositions} />
            <Detail label='Fill By Date' value={request.tillDate} />
            <Detail label='Raised By' value={request.raisedBy} />
            <Detail label='Raised On' value={request.raisedOn} />
            <Detail label='Remarks' value={request.remarks} className='col-lg-6' />

            {isAuthorizeTask ? (
              <div className='col-12'>
                <label className='form-label' htmlFor='recruitment-auth-remarks'>
                  Authorization Remarks <span className='text-danger'>*</span>
                </label>
                <textarea
                  id='recruitment-auth-remarks'
                  className={`form-control${fieldError ? ' is-invalid' : ''}`}
                  rows={3}
                  maxLength={REMARK_MAX_LENGTH}
                  value={remarks}
                  disabled={busy}
                  onChange={event => {
                    setRemarks(event.target.value)
                    setFieldError('')
                  }}
                />
                {fieldError && <small className='text-danger d-block mt-1'>{fieldError}</small>}
              </div>
            ) : (
              <>
                <Detail label='Authorization Remarks' value={request.authRemark} className='col-md-6' />
                <div className='col-md-6'>
                  <label className='form-label'>
                    Assigned To <span className='text-danger'>*</span>
                  </label>
                  <SDLReactSelect
                    value={recruiter}
                    options={details.recruiters}
                    placeholder='Please Select'
                    isDisabled={busy}
                    onChange={value => {
                      setRecruiter(value || '')
                      setFieldError('')
                    }}
                  />
                  {fieldError && <small className='text-danger d-block mt-1'>{fieldError}</small>}
                </div>
              </>
            )}
          </div>
        </>
      )}
    </RecruitmentModal>
  )
}

export default RecruitmentTaskModal
