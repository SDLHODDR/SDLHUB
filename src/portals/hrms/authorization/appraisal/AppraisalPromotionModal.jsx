import { useEffect, useState } from 'react'
import SaveButton from '../../../../shared/components/buttons/SaveButton'
import SDLReactSelect from '../../../../shared/components/form/SDLReactSelect'
import {
  confirmAction,
  notifyError,
  notifySuccess
} from '../../../../shared/services/alertService'
import RecruitmentModal from '../../pages/recruitment/RecruitmentModal'
import { getAppraisalPromotion, saveAppraisalPromotion } from '../../services/appraisalService'
import { AppraisalEmployeeSummary } from './appraisalShared'

/*
 * Appraisal Employee Promotion (49) and Promotion Auth (50), legacy appr_promo_request.php /
 * appr_promo_req_auth.php: choose the new organogram and a location free on the promotion date.
 * Send (49) raises the authorization; Authorize (50) moves the employee from the promotion date.
 */

const AppraisalPromotionModal = ({ record, onClose, onDone }) => {
  const [data, setData] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [orgId, setOrgId] = useState('')
  const [locId, setLocId] = useState('')
  const [locations, setLocations] = useState([])
  const [busy, setBusy] = useState('')
  const [showMissing, setShowMissing] = useState(false)

  useEffect(() => {
    let active = true
    getAppraisalPromotion(record.ID)
      .then(response => {
        if (!active) return
        if (!response?.status) throw new Error(response?.message)
        setData(response.data)
        setOrgId(response.data.promotion.orgId)
        setLocId(response.data.promotion.orgLocId)
        setLocations(response.data.locations)
      })
      .catch(error => {
        if (active) setLoadError(error?.message || 'Unable to load the promotion.')
      })
    return () => {
      active = false
    }
  }, [record.ID])

  const isAuth = data?.taskId === '50'

  const changeOrg = value => {
    setOrgId(value || '')
    setLocId('')
    setLocations([])
    if (!value) return
    getAppraisalPromotion(record.ID, value)
      .then(response => {
        if (!response?.status) throw new Error(response?.message)
        setLocations(response.data.locations)
      })
      .catch(error => notifyError(error?.message || 'Unable to load the locations.'))
  }

  const run = async action => {
    if (!orgId || !locId) {
      setShowMissing(true)
      notifyError('Please select the new organogram and its location.')
      return
    }
    if (action !== 'save') {
      const confirmed = await confirmAction(
        isAuth ? 'Authorize the promotion?' : 'Send the promotion for authorization?',
        isAuth
          ? `The employee moves to the new position from ${data.promotion.promotionFrom} and a Print Promotion Letter task is generated.`
          : 'A Promotion Auth task will be generated.'
      )
      if (!confirmed) return
    }
    setBusy(action)
    try {
      const response = await saveAppraisalPromotion({ user_task_id: record.ID, action, org_id: orgId, org_loc_id: locId })
      if (!response?.status) throw new Error(response?.message)
      notifySuccess(response.message)
      if (action !== 'save') {
        window.dispatchEvent(new Event('hrms-auth-tasks-changed'))
        onDone?.()
        onClose()
      }
    } catch (error) {
      notifyError(error?.message || 'Unable to save the promotion.')
    } finally {
      setBusy('')
    }
  }

  return (
    <RecruitmentModal
      titleId='appraisal-promotion-title'
      title={isAuth ? 'Appraisal - Employee Promotion Auth' : 'Appraisal - Employee Promotion'}
      subtitle={data ? <>Employee Code: <strong>{data.employee.code}</strong><span className='mx-2'>|</span>Task ID: <strong>{record.ID}</strong></> : null}
      size='lg'
      loading={!data && !loadError}
      loadError={loadError}
      onClose={onClose}
      footer={
        data && (
          <div className='d-flex gap-2'>
            <SaveButton onClick={() => run('save')} isSubmitting={busy === 'save'} disabled={Boolean(busy)}>
              Save
            </SaveButton>
            <button type='button' className='btn btn-success' onClick={() => run(isAuth ? 'authorize' : 'send')} disabled={Boolean(busy)}>
              {busy && busy !== 'save' ? 'Processing...' : isAuth ? 'Authorize' : 'Send for Authorization'}
            </button>
          </div>
        )
      }
    >
      {data && (
        <>
          <AppraisalEmployeeSummary
            employee={data.employee}
            extra={[
              ['Current Organogram', data.employee.organogram],
              ['Promotion Approved By', data.promotion.approvedBy],
              ['Promotion Effective From', data.promotion.promotionFrom],
              ['Increment Effective From', data.promotion.incrementFrom],
              ['Promotion Remarks', data.promotion.remarks]
            ]}
          />
          <div className='row g-3'>
            <div className='col-md-7'>
              <label className='form-label'>
                New Organogram <span className='text-danger'>*</span>
              </label>
              <SDLReactSelect
                value={orgId}
                options={data.organograms}
                placeholder='Please Select'
                isDisabled={Boolean(busy)}
                hasError={showMissing && !orgId}
                onChange={changeOrg}
              />
            </div>
            <div className='col-md-5'>
              <label className='form-label'>
                New Organogram Location <span className='text-danger'>*</span>
              </label>
              <SDLReactSelect
                value={locId}
                options={locations}
                placeholder={orgId ? 'Please Select' : 'Select the organogram first'}
                isDisabled={Boolean(busy) || !orgId}
                hasError={showMissing && !locId}
                onChange={value => setLocId(value || '')}
              />
              {orgId && locations.length === 0 && (
                <div className='form-text'>No location of this organogram is free on {data.promotion.promotionFrom}.</div>
              )}
            </div>
          </div>
        </>
      )}
    </RecruitmentModal>
  )
}

export default AppraisalPromotionModal
