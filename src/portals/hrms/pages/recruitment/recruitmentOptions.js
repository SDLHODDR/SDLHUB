// HR_CAN_APPLICATION_DETAILS.STATUS (legacy $status arrays). Follow-up is offered
// from the Pending Recruitment list while an interview is being arranged.
export const APPLICATION_STATUSES = {
  N: { label: 'New', className: 'bg-primary' },
  A: { label: 'Shortlisted', className: 'bg-success' },
  R: { label: 'Rejected', className: 'bg-danger' },
  I: { label: 'Interview Scheduled', className: 'bg-warning', followUp: 'Follow Up For Pre-Interview' },
  D: { label: 'Interview Confirmed', className: 'bg-success', followUp: 'Follow Up For Interview' },
  U: { label: 'Interview Rescheduled', className: 'bg-success', followUp: 'Follow Up For Re-Interview' },
  S: { label: 'Interviewer Assigned', className: 'bg-info' },
  P: { label: 'Pass', className: 'bg-info' },
  F: { label: 'Fail', className: 'bg-secondary' },
  O: { label: 'Offer Sent', className: 'bg-dark' },
  J: { label: 'Offer Accepted', className: 'bg-primary' },
  E: { label: 'Employed', className: 'bg-success' },
  C: { label: 'Offer Denied', className: 'bg-secondary' },
  G: { label: 'Offer Denied', className: 'bg-secondary' },
  B: { label: 'Blocked', className: 'bg-danger' }
}

// Candidate Timeline wording (legacy $statusD).
export const TIMELINE_LABELS = {
  N: 'Sent for suitability check',
  A: 'Shortlisted',
  U: 'Interview Rescheduled',
  I: 'Interview Scheduled',
  D: 'Interview Confirmed',
  P: 'Pass',
  F: 'Fail',
  R: 'Rejected',
  O: 'Offer Sent',
  J: 'Candidate Accepted The Offer Sent',
  E: 'Employed',
  S: 'Interviewer Assigned',
  C: 'Candidate Rejected The Offer Sent',
  B: 'Blocked'
}

// HR_RECRUITMENT.STATUS (legacy decode in recruitment_req.php).
export const REQUEST_STATUSES = {
  N: { label: 'Not Sent for Auth', className: 'bg-secondary' },
  T: { label: 'HOD Approval Pending', className: 'bg-warning' },
  A: { label: 'Approved By HOD', className: 'bg-success' },
  I: { label: 'In Process', className: 'bg-info' },
  C: { label: 'Closed', className: 'bg-dark' },
  R: { label: 'Rejected', className: 'bg-danger' },
  X: { label: 'Deleted', className: 'bg-secondary' }
}

export const BLOCK_AFTER_FOLLOW_UPS = 5
export const REMARK_MAX_LENGTH = 100

/**
 * Resumes and photos: files uploaded through the SDL Hub careers portal ("sdlhub/...")
 * are served by the backend to recruitment users; older ones stay in the legacy careers folder.
 */
export const careersFileUrl = path => {
  if (!path) return ''
  if (String(path).startsWith('sdlhub/')) {
    return `${import.meta.env.VITE_API_URL || ''}/hrms/recruitment/viewCandidateDocument.php?path=${encodeURIComponent(path)}`
  }
  const base = (import.meta.env.VITE_HRMS_DOC_BASE_URL || '').trim().replace(/\/$/, '')
  const file = String(path).replace(/^\//, '').split('/').map(encodeURIComponent).join('/')
  return `${base}/careers/${file}`
}

export const applicationFormUrl = id =>
  `${import.meta.env.BASE_URL.replace(/\/$/, '')}/hrms/recruitment/candidate-info-list/form/${id}`
