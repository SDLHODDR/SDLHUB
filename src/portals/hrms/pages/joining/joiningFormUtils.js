export const formStyles = {
  sectionTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#17324d',
    marginBottom: '15px',
    borderBottom: '1px solid #e5e5e5',
    paddingBottom: '8px'
  },
  label: {
    display: 'block',
    fontSize: '12px',
    lineHeight: '18px',
    fontWeight: '600',
    color: '#222',
    marginBottom: '5px'
  },
  required: { color: '#dc3545' },
  field: { marginBottom: '15px' },
  checkboxLabel: {
    fontSize: '12px',
    fontWeight: '600',
    marginLeft: '7px',
    verticalAlign: 'middle'
  }
}

export const toDateValue = date => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return ''
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export const toOptions = rows =>
  (Array.isArray(rows) ? rows : [])
    .map(row => ({
      value: String(row.VALUE ?? row.value ?? ''),
      label: String(row.LABEL ?? row.label ?? '').trim()
    }))
    .filter(option => option.value && option.label)

/** Tabs of a joining detail task, in the old page's order. CTC is limited to its own task. */
export const joiningDetailTabs = taskSection => [
  { key: 'basic', label: 'Basic Details' },
  { key: 'tenure', label: 'Tenure Details' },
  { key: 'bank', label: 'Bank Details' },
  { key: 'qualification', label: 'Qualification Details' },
  { key: 'experience', label: 'Experience Details' },
  { key: 'family', label: 'Family Details' },
  { key: 'access', label: 'Application Access' },
  { key: 'kra', label: 'KRA' },
  ...(taskSection === 'ctc' ? [{ key: 'ctc', label: 'CTC' }] : [])
]
