/* Shared pieces of the appraisal follow-up task modals (47-52). */

/** Employee details in the task modal header grid, plus task-specific [label, value] pairs. */
export const AppraisalEmployeeSummary = ({ employee, extra = [] }) => {
  const fields = [
    ['Employee', `${employee.code} - ${employee.name || '-'}`],
    ['Date Of Joining', employee.doj],
    ['Designation', employee.designation],
    ['Department', employee.department],
    ['Division', employee.division],
    ['Location', employee.location],
    ...extra
  ]
  return (
    <div className='row g-2 tenure-legacy-grid pb-3 mb-3 border-bottom'>
      {fields.map(([label, value]) => (
        <div className='col-md-4' key={label}>
          <strong className='grid-label'>{label} : </strong>
          <span className='grid-val'>{value || '-'}</span>
        </div>
      ))}
    </div>
  )
}
