import { useEffect, useRef, useState } from 'react'
import CancelButton from '../../../../shared/components/buttons/CancelButton'
import {
  confirmAction,
  notifyError,
  notifySuccess
} from '../../../../shared/services/alertService'
import RecruitmentModal from '../../pages/recruitment/RecruitmentModal'
import { appraisalLetterUrl, getAppraisalLetter, processAppraisalLetter } from '../../services/appraisalService'
import { AppraisalEmployeeSummary } from './appraisalShared'

/*
 * Print Promotion Letter (51) / Print Increment Letter (52), legacy print_promotion_letter.php /
 * print_increment_letter.php: preview the letter, generate the reference code once payroll has
 * confirmed the new salary, then print (closes the task).
 */

const AppraisalLetterModal = ({ record, onClose, onDone }) => {
  const [details, setDetails] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [frameKey, setFrameKey] = useState(0)
  const [busy, setBusy] = useState('')
  const onLoaded = useRef(null)

  // State is set only in the promise callbacks.
  const load = () =>
    getAppraisalLetter(record.ID)
      .then(response => {
        if (!response?.status) throw new Error(response?.message)
        setDetails(response.data)
        setLoadError('')
        onLoaded.current?.()
      })
      .catch(error => setLoadError(error?.message || 'Unable to load the letter.'))

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once per task
  }, [record.ID])

  const isPromotion = details?.taskId === '51'
  const title = isPromotion ? 'Print Promotion Letter' : 'Print Increment Letter'
  const reference = details?.reference
  const blocked = Boolean(details?.salaryPending) && !reference

  const handleGenerate = async () => {
    const confirmed = await confirmAction('Generate reference code?', 'A letter reference number will be issued for this letter.')
    if (!confirmed) return
    setBusy('generate')
    try {
      const response = await processAppraisalLetter({ user_task_id: record.ID, action: 'reference' })
      if (!response?.status) throw new Error(response?.message)
      notifySuccess(response.message || 'Reference Code generated successfully.')
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
    const confirmed = await confirmAction(`${title}?`, `This closes the ${title} task.`)
    if (!confirmed) return
    setBusy('print')
    try {
      const response = await processAppraisalLetter({ user_task_id: record.ID, action: 'close' })
      if (!response?.status) throw new Error(response?.message)
      notifySuccess(response.message)
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
      titleId='appraisal-letter-title'
      title={details ? title : 'Appraisal Letter'}
      subtitle={details ? <>Employee Code: <strong>{details.empCode}</strong><span className='mx-2'>|</span>Task ID: <strong>{record.ID}</strong></> : null}
      size='xl'
      loading={!details && !loadError}
      loadError={loadError}
      onClose={onClose}
      footer={<CancelButton onClick={onClose} disabled={Boolean(busy)} />}
    >
      {details && (
        <div>
          <AppraisalEmployeeSummary
            employee={details.employee}
            extra={[
              ['Increment Effective From', details.effectiveFrom],
              ...(isPromotion ? [['Promotion Effective From', details.promotionFrom]] : [])
            ]}
          />
          {blocked && (
            <div className='alert py-2' style={{ background: '#fff4e5', border: '1px solid #f5c37a', color: '#8a4b00' }}>
              <i className='fas fa-triangle-exclamation me-2' />
              The revised salary has not been confirmed by payroll yet. The reference code can be generated once it is confirmed.
            </div>
          )}
          <div className='d-flex justify-content-end align-items-center gap-2 mb-2'>
            {reference ? (
              <span className='badge sdl-reference-badge'>
                Reference Code: {reference.docRef} ({reference.docDate})
              </span>
            ) : (
              <button type='button' className='btn btn-warning btn-sm px-3 fw-bold text-dark' onClick={handleGenerate} disabled={blocked || Boolean(busy)}>
                {busy === 'generate' ? 'Generating...' : 'Generate Reference Code'}
              </button>
            )}
            <button
              className='btn btn-outline-info btn-sm px-3'
              type='button'
              onClick={handlePrint}
              disabled={!reference || Boolean(busy)}
              title={!reference ? 'Generate the reference code first' : undefined}
            >
              <i className='fas fa-print me-1' />
              {busy === 'print' ? 'Processing...' : title}
            </button>
          </div>
          <div style={{ height: '60vh', minHeight: '420px', background: '#525659' }} className='border rounded overflow-hidden'>
            <iframe
              key={frameKey}
              title={title}
              src={appraisalLetterUrl(details.script, details.empCode, record.ID)}
              className='w-100 h-100 border-0'
            />
          </div>
        </div>
      )}
    </RecruitmentModal>
  )
}

export default AppraisalLetterModal
