import { useEffect, useState } from 'react'
import SaveButton from '../../../../shared/components/buttons/SaveButton'
import SDLReactSelect from '../../../../shared/components/form/SDLReactSelect'
import {
  confirmAction,
  notifyError,
  notifySuccess
} from '../../../../shared/services/alertService'
import RecruitmentModal from '../../pages/recruitment/RecruitmentModal'
import { getAppraisalCtc, saveAppraisalCtc } from '../../services/appraisalService'
import { appraisalInr } from './appraisalFormat'
import { AppraisalEmployeeSummary } from './appraisalShared'

/*
 * Appraisal CTC Change (47) and CTC Approval (48), legacy appr_chg_letter.php /
 * appr_chg_letter_auth.php: the new salary breakup for the appraisal's new CTC.
 * The structure follows the JD rules; HR enters the monthly amounts. Submit (47) sends
 * it for approval; Authorize (48) writes it to payroll from the increment date.
 */

const PF_OPTIONS = [
  { value: '1', label: '12% of 15000' },
  { value: '0', label: '12% of Basic' }
]

const AppraisalCtcModal = ({ record, onClose, onDone }) => {
  const [data, setData] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [pfBasis, setPfBasis] = useState('0')
  const [amounts, setAmounts] = useState({})
  const [busy, setBusy] = useState('')

  const apply = (response, keepAmounts) => {
    if (!response?.status) throw new Error(response?.message)
    const d = response.data
    setData(d)
    setPfBasis(d.pfBasis)
    if (!keepAmounts) {
      setAmounts(
        Object.fromEntries(d.heads.map(h => [h.code, h.monthly === null ? '' : String(h.monthly)]))
      )
    }
  }

  useEffect(() => {
    let active = true
    getAppraisalCtc(record.ID)
      .then(response => {
        if (active) apply(response, false)
      })
      .catch(error => {
        if (active) setLoadError(error?.message || 'Unable to load the CTC.')
      })
    return () => {
      active = false
    }
  }, [record.ID])

  const isApproval = data?.taskId === '48'
  const total = Object.values(amounts).reduce((sum, value) => sum + (Number(value) || 0), 0)
  const structureTotal = (data?.heads || []).reduce((sum, h) => sum + (h.structure || 0), 0)

  const changePf = value => {
    const next = value || '0'
    setPfBasis(next)
    getAppraisalCtc(record.ID, next)
      .then(response => apply(response, true))
      .catch(error => notifyError(error?.message || 'Unable to recalculate the structure.'))
  }

  const useStructure = () =>
    setAmounts(Object.fromEntries(data.heads.map(h => [h.code, h.structure === null ? '' : String(h.structure)])))

  const run = async action => {
    if (action !== 'save') {
      if (total <= 0) {
        notifyError('Please enter the salary breakup before submitting.')
        return
      }
      const confirmed = await confirmAction(
        isApproval ? 'Authorize the CTC?' : 'Send the CTC for approval?',
        isApproval
          ? 'The new salary is written to payroll from the increment date for confirmation.'
          : 'A CTC Approval task will be generated.'
      )
      if (!confirmed) return
    }
    setBusy(action)
    try {
      const response = await saveAppraisalCtc({ user_task_id: record.ID, action, pf_basis: pfBasis, amounts })
      if (!response?.status) throw new Error(response?.message)
      notifySuccess(response.message)
      if (action !== 'save') {
        window.dispatchEvent(new Event('hrms-auth-tasks-changed'))
        onDone?.()
        onClose()
      }
    } catch (error) {
      notifyError(error?.message || 'Unable to save the CTC.')
    } finally {
      setBusy('')
    }
  }

  return (
    <RecruitmentModal
      titleId='appraisal-ctc-title'
      title={isApproval ? 'Appraisal - CTC Approval' : 'Appraisal - CTC Change'}
      subtitle={data ? <>Employee Code: <strong>{data.employee.code}</strong><span className='mx-2'>|</span>Task ID: <strong>{record.ID}</strong></> : null}
      size='xl'
      loading={!data && !loadError}
      loadError={loadError}
      onClose={onClose}
      footer={
        data && (
          <div className='d-flex gap-2'>
            <SaveButton onClick={() => run('save')} isSubmitting={busy === 'save'} disabled={Boolean(busy)}>
              Save CTC
            </SaveButton>
            <button type='button' className='btn btn-success' onClick={() => run(isApproval ? 'authorize' : 'submit')} disabled={Boolean(busy)}>
              {busy && busy !== 'save' ? 'Processing...' : isApproval ? 'Authorize' : 'Submit'}
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
              ['Current CTC', data.appraisal.currentCtc ? `₹${appraisalInr(data.appraisal.currentCtc)}` : '-'],
              ['New CTC', data.appraisal.newCtc ? `₹${appraisalInr(data.appraisal.newCtc)} (${(data.appraisal.newCtc / 100000).toFixed(2)} Lakhs p.a.)` : '-'],
              ['Increment Effective From', data.appraisal.effectiveFrom],
              ['Promotion', data.appraisal.promotion ? `Yes${data.appraisal.promotionTo ? ` - ${data.appraisal.promotionTo}` : ''}` : 'No']
            ]}
          />
          <div className='row g-3 align-items-end mb-3'>
            {data.hasPfBasis && (
              <div className='col-md-4'>
                <label className='form-label'>Basic Criteria for PF</label>
                <SDLReactSelect value={pfBasis} options={PF_OPTIONS} isClearable={false} isDisabled={Boolean(busy)} onChange={changePf} />
              </div>
            )}
            <div className='col'>
              <button type='button' className='btn btn-outline-primary' style={{ minHeight: 38 }} onClick={useStructure} disabled={Boolean(busy)}>
                Fill from structure
              </button>
            </div>
          </div>
          <div className='table-responsive'>
            <table className='table table-bordered table-sm align-middle mb-0 recruitment-flow-table'>
              <thead>
                <tr>
                  <th>CTC Head</th>
                  <th className='text-end'>Current Monthly (₹)</th>
                  <th className='text-end'>As per Structure Monthly (₹)</th>
                  <th className='text-end'>As per Structure Annually (₹)</th>
                  <th className='text-end' style={{ width: '16%' }}>Monthly (₹)</th>
                  <th className='text-end'>Annual (₹)</th>
                </tr>
              </thead>
              <tbody>
                {data.heads.map(head => (
                  <tr key={head.code}>
                    <td>{head.label}</td>
                    <td className='text-end'>{appraisalInr(head.current)}</td>
                    <td className='text-end'>{appraisalInr(head.structure)}</td>
                    <td className='text-end'>{head.structure === null ? '-' : appraisalInr(head.structure * 12)}</td>
                    <td>
                      <input
                        className='form-control form-control-sm text-end'
                        inputMode='decimal'
                        aria-label={`Monthly ${head.label}`}
                        value={amounts[head.code] ?? ''}
                        disabled={Boolean(busy)}
                        onChange={event => {
                          const value = event.target.value.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1')
                          setAmounts(current => ({ ...current, [head.code]: value }))
                        }}
                      />
                    </td>
                    <td className='text-end'>{amounts[head.code] ? appraisalInr(Number(amounts[head.code]) * 12) : '-'}</td>
                  </tr>
                ))}
                <tr className='fw-semibold'>
                  <td>Sum in ₹</td>
                  <td />
                  <td className='text-end'>{appraisalInr(structureTotal)}</td>
                  <td className='text-end'>{appraisalInr(structureTotal * 12)}</td>
                  <td className='text-end'>{appraisalInr(total)}</td>
                  <td className='text-end'>{appraisalInr(total * 12)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          {data.appraisal.newCtc > 0 && total > 0 && Math.abs(total * 12 - data.appraisal.newCtc) > 100 && (
            <div className='text-muted small mt-2'>
              The entered breakup totals ₹{appraisalInr(total * 12)} a year against the appraised CTC of ₹{appraisalInr(data.appraisal.newCtc)}.
            </div>
          )}
        </>
      )}
    </RecruitmentModal>
  )
}

export default AppraisalCtcModal
