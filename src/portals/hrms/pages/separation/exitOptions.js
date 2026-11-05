// HR_EMP_SEPARATION.RESIGN_TYPE / RESIGN_MODE / STATUS codes (legacy separation_edit.php).
export const RESIGNATION_TYPES = [
  { value: 'R', label: 'Resignation' },
  { value: 'T', label: 'Termination' },
  { value: 'A', label: 'Absconding' },
  { value: 'W', label: 'Retired' },
  { value: 'C', label: 'Contract Discontinued' }
]

export const RESIGNATION_MODES = [
  { value: 'E', label: 'Email' },
  { value: 'T', label: 'Telephonic' },
  { value: 'O', label: 'Other' }
]

export const SEPARATION_STATUSES = {
  N: { label: 'Not Sent for Auth', className: 'bg-secondary' },
  T: { label: 'In Progress', className: 'bg-warning text-dark' },
  A: { label: 'Approved', className: 'bg-info' },
  R: { label: 'Rejected', className: 'bg-danger' },
  C: { label: 'Closed', className: 'bg-success' }
}
