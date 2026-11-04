/*
 * Employee summary shown at the top of the Exit modals, in the same
 * three-column layout as the Tenure modals. `extra` adds task-specific
 * items (e.g. Email, Department Activity For) as { label, value }.
 */
const ExitEmployeeSummary = ({ employee = {}, relievingDate, extra = [] }) => {
  const items = [
    {
      label: 'Employee',
      value: `${employee.code || '-'} - ${employee.name || '-'}${relievingDate ? ` (${relievingDate})` : ''}`
    },
    { label: 'Designation', value: employee.designation },
    { label: 'Location', value: employee.location },
    { label: 'Department', value: employee.department },
    ...extra
  ]

  return (
    <div className='row g-0 mb-3 tenure-employee-summary'>
      {items.map(item => (
        <div key={item.label} className='col-lg-4'>
          <strong>{item.label}:</strong> {item.value || '-'}
        </div>
      ))}
    </div>
  )
}

export default ExitEmployeeSummary
