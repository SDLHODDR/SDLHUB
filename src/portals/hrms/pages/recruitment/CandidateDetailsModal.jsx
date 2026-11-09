import { useEffect, useState } from 'react'
import RecruitmentModal from './RecruitmentModal'
import SDLTabsComponent from '../../components/tabs/SDLTabsComponent'
import { careersFileUrl, TIMELINE_LABELS } from './recruitmentOptions'
import { getCandidateDetails } from '../../services/recruitmentService'

const SOCIAL_ICONS = {
  FaceBook: 'fab fa-facebook-square',
  WhatsApp: 'fab fa-whatsapp-square',
  Instagram: 'fab fa-instagram-square',
  Twitter: 'fab fa-twitter-square',
  LinkedIn: 'fab fa-linkedin'
}

const yesNo = value => (value ? 'Yes' : 'No')

const SimpleTable = ({ columns, rows }) =>
  rows.length === 0 ? (
    <p className='text-center text-muted my-4'>No Data Available</p>
  ) : (
    <div className='table-responsive'>
      <table className='table table-striped table-bordered mb-0 recruitment-detail-table'>
        <thead>
          <tr>
            {columns.map(column => (
              <th key={column.key}>{column.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              {columns.map(column => (
                <td key={column.key}>{column.render ? column.render(row) : row[column.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

const SummaryRow = ({ label, children }) => (
  <li className='list-group-item d-flex justify-content-between px-0 py-2'>
    <strong>{label}</strong>
    <span className='text-end ms-3'>{children}</span>
  </li>
)

const Rupees = ({ value }) => (value ? <>&#8377; {value}</> : '--')

const Photo = ({ path }) => {
  const [failed, setFailed] = useState(false)
  if (!path || failed) {
    return (
      <div
        className='rounded-circle border bg-light d-flex align-items-center justify-content-center'
        style={{ width: 90, height: 90 }}
      >
        <i className='fas fa-user fa-2x text-muted' aria-hidden='true' />
      </div>
    )
  }
  return (
    <img
      src={careersFileUrl(path)}
      alt='Candidate'
      className='rounded-circle border object-fit-cover'
      style={{ width: 90, height: 90 }}
      onError={() => setFailed(true)}
    />
  )
}

const TABS = [
  {
    key: 'education',
    label: 'Qualification Details',
    columns: [
      { key: 'course', header: 'Course Name' },
      { key: 'institute', header: 'Institute Name' },
      { key: 'passingDate', header: 'Passing Date' },
      { key: 'remarks', header: 'Remark/Date' }
    ]
  },
  {
    key: 'experience',
    label: 'Experience Details',
    columns: [
      { key: 'organization', header: 'Organization' },
      { key: 'from', header: 'From Date' },
      { key: 'to', header: 'To Date' },
      { key: 'designation', header: 'Designation' },
      { key: 'duty', header: 'Nature Of Duty' },
      { key: 'reason', header: 'Reason' },
      { key: 'salary', header: 'Salary' }
    ]
  },
  {
    key: 'references',
    label: 'Reference Details',
    columns: [
      { key: 'name', header: 'Name' },
      { key: 'position', header: 'Position' },
      { key: 'years', header: 'Known Since' },
      { key: 'phone', header: 'Phone' }
    ]
  },
  {
    key: 'languages',
    label: "Known Language's",
    columns: [
      { key: 'language', header: 'Language' },
      { key: 'read', header: 'Read', render: row => yesNo(row.read) },
      { key: 'write', header: 'Write', render: row => yesNo(row.write) },
      { key: 'speak', header: 'Speak', render: row => yesNo(row.speak) }
    ]
  },
  {
    key: 'family',
    label: 'Family Details',
    columns: [
      { key: 'name', header: 'Name' },
      { key: 'relation', header: 'Relation' },
      { key: 'dependent', header: 'Dependent/Non Dependent' },
      { key: 'occupation', header: 'Occupation' },
      { key: 'age', header: 'Age' }
    ]
  },
  {
    key: 'social',
    label: 'Social Media Details',
    columns: [
      {
        key: 'media',
        header: 'Social Media',
        render: row => (
          <>
            {SOCIAL_ICONS[row.media] && <i className={`${SOCIAL_ICONS[row.media]} me-1`} aria-hidden='true' />}
            {row.media}
          </>
        )
      },
      { key: 'detail', header: 'Username' }
    ]
  },
  { key: 'timeline', label: 'Candidate Timeline' }
]

const Timeline = ({ applications }) =>
  applications.length === 0 ? (
    <p className='text-center text-muted my-4'>No Data Available</p>
  ) : (
    applications.map(application => (
      <div key={application.reqId} className='mb-3'>
        <span className='badge bg-danger mb-2'>
          #{application.reqId} ({application.department} - {application.designation})
        </span>
        {application.events.length === 0 && <p className='text-muted mb-0'>No activity recorded.</p>}
        <ul className='list-group'>
          {application.events.map((event, index) => (
            <li key={index} className='list-group-item d-flex flex-wrap justify-content-between gap-1'>
              <span>
                {TIMELINE_LABELS[event.status] || event.status}
                {event.by && ` by ${event.by}`}
              </span>
              <small className='text-muted text-nowrap'>{event.on}</small>
            </li>
          ))}
        </ul>
      </div>
    ))
  )

/* Candidate Details (legacy candidate_info_sv.php?CanData). */
const CandidateDetailsModal = ({ candidateId, onClose }) => {
  const [details, setDetails] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [activeTab, setActiveTab] = useState('education')

  useEffect(() => {
    let active = true
    getCandidateDetails(candidateId)
      .then(response => {
        if (!response?.status) throw new Error(response?.message)
        if (active) setDetails(response.data)
      })
      .catch(error => {
        if (active) setLoadError(error?.message || 'Unable to load the candidate.')
      })
    return () => {
      active = false
    }
  }, [candidateId])

  const candidate = details?.candidate
  const tab = TABS.find(item => item.key === activeTab)

  return (
    <RecruitmentModal
      titleId='candidate-details-title'
      title='Candidate Details'
      size='xl'
      loading={!details && !loadError}
      loadError={loadError}
      onClose={onClose}
    >
      {candidate && (
        <>
          <div className='card mb-3'>
            <div className='card-body'>
              <div className='row g-3'>
                <div className='col-lg-5 d-flex flex-wrap gap-3'>
                  <Photo path={candidate.imagePath} />
                  <div className='recruitment-candidate-contact'>
                    <h5 className='mb-2'>
                      {candidate.title} {candidate.name}
                    </h5>
                    <div className='text-muted mb-1 text-break'>
                      <i className='fas fa-envelope me-2' aria-hidden='true' />
                      {candidate.email || '--'}
                    </div>
                    <div className='text-muted mb-1'>
                      <i className='fas fa-mobile-alt me-2' aria-hidden='true' />
                      {candidate.mobile || '--'}
                    </div>
                    <div className='text-muted'>
                      <i className='fas fa-map-marker-alt me-2' aria-hidden='true' />
                      {candidate.city || '--'}
                    </div>
                  </div>
                </div>
                <div className='col-lg-7'>
                  <ul className='list-group list-group-flush'>
                    <SummaryRow label='Years Of Experience:'>{candidate.experience}</SummaryRow>
                    <SummaryRow label='Requirement Reference:'>{candidate.reference || '--'}</SummaryRow>
                    <SummaryRow label='Notice Period:'>
                      {candidate.noticeDays ? `${candidate.noticeDays} Days` : '--'}
                    </SummaryRow>
                    <SummaryRow label='Last CTC(in Lakhs):'>
                      <Rupees value={candidate.lastCtc} />
                    </SummaryRow>
                    <SummaryRow label='Expected CTC(in Lakhs):'>
                      <Rupees value={candidate.expectedCtc} />
                    </SummaryRow>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <SDLTabsComponent
            tabs={TABS.map(item => ({
              key: item.key,
              label: item.label,
              disabled: details[item.key].length === 0
            }))}
            selectedTab={activeTab}
            onTabChange={setActiveTab}
          >
            {tab.key === 'timeline' ? (
              <Timeline applications={details.timeline} />
            ) : (
              <SimpleTable columns={tab.columns} rows={details[tab.key]} />
            )}
          </SDLTabsComponent>
        </>
      )}
    </RecruitmentModal>
  )
}

export default CandidateDetailsModal
