import EditButton from '../../../../shared/components/buttons/EditButton'
import { applicationFormUrl, careersFileUrl } from './recruitmentOptions'

const IconLink = ({ href, label, icon }) => (
  <a
    className='btn btn-sm btn-outline-primary d-flex align-items-center justify-content-center'
    style={{ width: 30, height: 30, padding: 0 }}
    href={href}
    target='_blank'
    rel='noopener noreferrer'
    aria-label={label}
    title={label}
  >
    <i className={icon} aria-hidden='true' />
  </a>
)

/* The row icons shared by the recruitment lists. Optional actions are left out when no handler is given. */
const CandidateIconActions = ({ candidate, onView, onFollowUp, onScreen }) => (
  <div className='d-flex justify-content-center gap-1'>
    <EditButton ariaLabel='Candidate Details' iconClassName='ti ti-eye' onClick={() => onView(candidate)} />
    {candidate.docPath ? (
      <IconLink href={careersFileUrl(candidate.docPath)} label='Download Resume' icon='ti ti-file-download' />
    ) : (
      <EditButton ariaLabel='No resume uploaded' iconClassName='ti ti-file-off' disabled />
    )}
    {onFollowUp && (
      <EditButton ariaLabel='Follow-Up' iconClassName='ti ti-bell' onClick={() => onFollowUp(candidate)} />
    )}
    {onScreen && (
      <EditButton ariaLabel='Screen Remark' iconClassName='ti ti-search' onClick={() => onScreen(candidate)} />
    )}
    <IconLink href={applicationFormUrl(candidate.id)} label='Employee Form' icon='ti ti-file-text' />
  </div>
)

export default CandidateIconActions
