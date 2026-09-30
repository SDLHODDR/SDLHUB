import { useEffect, useMemo, useState } from 'react'
import SDLTabsComponent from '../../portals/hrms/components/tabs/SDLTabsComponent'
import { getJobDescriptionById, getKRAList } from '../../portals/hrms/services/jobDescriptionService'
import { processJobDescriptionAuthorization } from '../../portals/hrms/services/authorization/authorizationService'
import { confirmAction, notifyError, notifySuccess } from '../../services/alertService'

const tabs = [
  ['basic', 'Basic Details'],
  ['responsibilities', 'Responsibilities'],
  ['kra', 'KRA'],
  ['education', 'Education'],
  ['skills', 'Skills'],
  ['allowances', 'Allowances/Reimbursement'],
  ['ctc', 'CTC Heads'],
  ['questions', 'Question Template'],
  ['deptref', 'Department Reference'],
  ['division', 'Division Mapping'],
  ['induction', 'Induction']
]

const get = (record, ...keys) => {
  for (const key of keys) {
    if (record?.[key] !== undefined && record?.[key] !== null && record?.[key] !== '') {
      return record[key]
    }
  }
  return '—'
}

const ReadOnlyField = ({ label, value, multiline = false }) => (
  <div className={multiline ? 'col-12 mb-3' : 'col-lg-4 col-md-6 mb-3'}>
    <label className='form-label mb-1'>{label}</label>
    <div className={`form-control bg-light ${multiline ? 'text-wrap' : 'text-truncate'}`} style={{ minHeight: 38, height: multiline ? 'auto' : 38, whiteSpace: 'pre-wrap' }}>
      {value === undefined || value === null || value === '' ? '—' : String(value)}
    </div>
  </div>
)

const DetailTable = ({ rows, columns }) => (
  <div className='table-responsive mt-2'>
    <table className='table table-bordered table-hover align-middle mb-0'>
      <thead className='table-light'>
        <tr>{columns.map(column => <th key={column.key}>{column.label}</th>)}</tr>
      </thead>
      <tbody>
        {rows.length ? rows.map((row, index) => (
          <tr key={row.ID ?? row.id ?? index}>
            {columns.map(column => <td key={column.key}>{column.render ? column.render(row, index) : get(row, ...(column.fields || [column.key]))}</td>)}
          </tr>
        )) : <tr><td colSpan={columns.length} className='text-center text-muted py-3'>No data found</td></tr>}
      </tbody>
    </table>
  </div>
)

const JobDescriptionAuthorizationModal = ({ show, record, onClose, onSuccess }) => {
  const [job, setJob] = useState(null)
  const [kraMaster, setKraMaster] = useState([])
  const [activeTab, setActiveTab] = useState('basic')
  const [remark, setRemark] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!show || !record?.TRAN_CODE) {
      setJob(null)
      return
    }

    let active = true
    setActiveTab('basic')
    setRemark('')
    setJob(null)
    setLoading(true)
    getJobDescriptionById(record.TRAN_CODE)
      .then(response => {
        if (!active) return
        const detail = response?.data?.jobDescription || response?.jobDescription
        if (response?.status && detail) setJob(detail)
        else notifyError(response?.message || 'Unable to load Job Description details.')
      })
      .catch(error => {
        if (active) notifyError(error?.message || 'Unable to load Job Description details.')
      })
      .finally(() => active && setLoading(false))

    return () => { active = false }
  }, [show, record?.TRAN_CODE])

  useEffect(() => {
    if (!show) return
    getKRAList()
      .then(response => {
        const data = response?.data
        const records = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data?.records)
              ? data.records
              : []
        setKraMaster(records)
      })
      .catch(error => console.error('Load authorization KRA names error:', error))
  }, [show])

  const lists = useMemo(() => ({
    responsibilities: Array.isArray(job?.RESPONSIBILITIES_LIST) ? job.RESPONSIBILITIES_LIST : [],
    kra: Array.isArray(job?.KRA_LIST) ? job.KRA_LIST : [],
    education: Array.isArray(job?.EDUCATION_LIST) ? job.EDUCATION_LIST : [],
    skills: Array.isArray(job?.SKILLS_LIST) ? job.SKILLS_LIST : [],
    allowances: Array.isArray(job?.ALLOWANCES_LIST) ? job.ALLOWANCES_LIST : [],
    ctc: Array.isArray(job?.CTC_HEADS_LIST) ? job.CTC_HEADS_LIST : [],
    questions: Array.isArray(job?.QUESTION_TEMPLATE_LIST) ? job.QUESTION_TEMPLATE_LIST : [],
    deptref: Array.isArray(job?.DEPT_REFERENCE_LIST) ? job.DEPT_REFERENCE_LIST : [],
    division: Array.isArray(job?.DIVISION_MAPPING_LIST) ? job.DIVISION_MAPPING_LIST : [],
    induction: Array.isArray(job?.INDUCTION_LIST) ? job.INDUCTION_LIST : []
  }), [job])

  const handleDecision = async decision => {
    if (decision === 'R' && !remark.trim()) {
      notifyError('Please enter a remark before rejecting this Job Description.')
      return
    }
    const confirmed = await confirmAction(
      decision === 'A' ? 'Accept Job Description?' : 'Reject Job Description?',
      `Are you sure you want to ${decision === 'A' ? 'accept' : 'reject'} this Job Description?`
    )
    if (!confirmed?.isConfirmed) return

    try {
      setSubmitting(true)
      const response = await processJobDescriptionAuthorization({
        user_task_id: record?.ID,
        jd_id: record?.TRAN_CODE,
        decision,
        remarks: remark.trim()
      })
      if (!response?.status) {
        notifyError(response?.message || 'Unable to process authorization.')
        return
      }
      notifySuccess(response?.message || `Job Description ${decision === 'A' ? 'accepted' : 'rejected'}.`)
      onClose?.()
      onSuccess?.()
      window.dispatchEvent(new Event('hrms-auth-tasks-changed'))
    } catch (error) {
      notifyError(error?.message || 'Unable to process authorization.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!show) return null

  const renderContent = () => {
    if (!job) return null
    switch (activeTab) {
      case 'basic':
        return <div className='row pt-3'>
          <ReadOnlyField label='JD Label' value={get(job, 'SH_DESC')} />
          <ReadOnlyField label='Department' value={get(job, 'DEPT_NAME', 'DEPT_ID')} />
          <ReadOnlyField label='Designation' value={get(job, 'DESIG_NAME', 'DESIG_ID')} />
          <ReadOnlyField label='Employee Level' value={get(job, 'LVL_ID')} />
          <ReadOnlyField label='Minimum Experience' value={get(job, 'MIN_EXP')} />
          <ReadOnlyField label='Maximum Experience' value={get(job, 'MAX_EXP')} />
          <ReadOnlyField label='Minimum Age' value={get(job, 'MIN_AGE')} />
          <ReadOnlyField label='Maximum Age' value={get(job, 'MAX_AGE')} />
          <ReadOnlyField label='Minimum CTC' value={get(job, 'MIN_SAL')} />
          <ReadOnlyField label='Maximum CTC' value={get(job, 'MAX_SAL')} />
          <ReadOnlyField label='Minimum Qualification' value={get(job, 'MIN_QUALI')} />
          <ReadOnlyField label='Maximum Qualification' value={get(job, 'MAX_QUALI')} />
          <ReadOnlyField label='Reports To' value={get(job, 'REPORTS_TO')} />
          <ReadOnlyField label='Experience' value={get(job, 'EXP')} />
          <ReadOnlyField label='Age Range' value={get(job, 'AGE_RANGE')} />
          <ReadOnlyField label='Short Description About Role' value={get(job, 'DESCR')} multiline />
        </div>
      case 'responsibilities': return <DetailTable rows={lists.responsibilities} columns={[{ key: 'DESCR', label: 'Responsibilities', render: row => <span dangerouslySetInnerHTML={{ __html: row.DESCR || '' }} /> }]} />
      case 'kra': return <DetailTable rows={lists.kra} columns={[{ key: 'KRA_DESC', label: 'Description', render: row => get(row, 'KRA_DESC', 'kra_desc') !== '—' ? get(row, 'KRA_DESC', 'kra_desc') : get(kraMaster.find(master => String(master.KRA_ID ?? master.kra_id) === String(row.KRA_ID ?? row.kra_id)), 'KRA_DESC', 'KRA_NAME', 'KRA_ID') }, { key: 'RESP_PERC', label: 'Percentage' }]} />
      case 'education': return <DetailTable rows={lists.education} columns={[{ key: 'QUA_DESC', label: 'Qualification' }, { key: 'COMMENTS', label: 'Comments' }]} />
      case 'skills': return <DetailTable rows={lists.skills} columns={[{ key: 'CAPA_CODE', label: 'Skill' }, { key: 'CAPA_DESC', label: 'Description' }, { key: 'CAPALVL_DESC', label: 'Expertise Level' }]} />
      case 'allowances': return <DetailTable rows={lists.allowances} columns={[{ key: 'ALLOW_DESC', label: 'Allowance' }, { key: 'ALLOW_AMOUNT', label: 'Amount' }, { key: 'ADD_INFO', label: 'Frequency' }, { key: 'EXP_TYPE', label: 'Type' }, { key: 'FROMDT', label: 'From Date' }, { key: 'TODT', label: 'To Date' }]} />
      case 'ctc': return <DetailTable rows={lists.ctc} columns={[{ key: 'AD_CODE', label: 'CTC Head', fields: ['AD_CODE', 'AD_ID'] }, { key: 'KEY', label: 'Key' }, { key: 'VAL', label: 'Value' }, { key: 'EFFEC_FROM', label: 'Effective From' }, { key: 'EFFEC_TO', label: 'Effective To' }]} />
      case 'questions': return <DetailTable rows={lists.questions} columns={[{ key: 'QGRP_DESC', label: 'Group' }, { key: 'QSGRP_DESC', label: 'Subgroup' }, { key: 'QUESTION', label: 'Question' }, { key: 'RATING_TYPE', label: 'Rating Type' }, { key: 'DISP_SEQ', label: 'Sequence' }]} />
      case 'deptref': return <DetailTable rows={lists.deptref} columns={[{ key: 'DEPT_CODE', label: 'Department Code' }, { key: 'DEPT_DESC', label: 'Department' }]} />
      case 'division': return <DetailTable rows={lists.division} columns={[{ key: 'DIVSN_DESC', label: 'Division' }]} />
      case 'induction': return <DetailTable rows={lists.induction} columns={[{ key: 'INDUC_DESC', label: 'Induction' }, { key: 'ORG_LABEL', label: 'Organogram' }, { key: 'LOC_LABEL', label: 'Location' }, { key: 'DISP_SEQ', label: 'Sequence' }]} />
      default: return null
    }
  }

  return <div className='modal fade show d-block' style={{ backgroundColor: 'rgba(0,0,0,.5)', zIndex: 1060 }} role='dialog' aria-modal='true'>
    <div className='modal-dialog modal-xl modal-dialog-centered' style={{ maxWidth: 'min(1200px, 96vw)' }}>
      <div className='modal-content shadow-lg border-0' style={{ maxHeight: '92vh' }}>
        <div className='modal-header'>
          <div><h5 className='modal-title mb-1'>Job Description Authorization</h5><small className='text-muted'>Job Description ID: {record?.TRAN_CODE || '—'} · {job?.SH_DESC || record?.TRAN_DESC || ''}</small></div>
          <button type='button' className='btn-close' onClick={onClose} disabled={submitting} aria-label='Close' />
        </div>
        <div className='modal-body overflow-auto'>
          {loading ? <div className='text-center py-5'><span className='spinner-border' role='status' /><div className='mt-2'>Loading Job Description...</div></div> : job ? <>
            <SDLTabsComponent tabs={tabs.map(([key, label]) => ({ key, label }))} selectedTab={activeTab} onTabChange={setActiveTab}>
              {renderContent()}
            </SDLTabsComponent>
            <div className='mt-4'>
              <label htmlFor='jd-auth-remark' className='form-label'>Authorization Remark</label>
              <textarea id='jd-auth-remark' className='form-control' rows={3} value={remark} onChange={event => setRemark(event.target.value)} placeholder='Enter remark' disabled={submitting} />
            </div>
          </> : <div className='text-center text-muted py-5'>Job Description details could not be loaded.</div>}
        </div>
        <div className='modal-footer'>
          <button type='button' className='btn btn-success' onClick={() => handleDecision('A')} disabled={loading || !job || submitting}>{submitting ? 'Processing...' : 'Accept'}</button>
          <button type='button' className='btn btn-danger' onClick={() => handleDecision('R')} disabled={loading || !job || submitting}>{submitting ? 'Processing...' : 'Reject'}</button>
        </div>
      </div>
    </div>
  </div>
}

export default JobDescriptionAuthorizationModal
