import { useState } from 'react'
import SaveButton from '../../../../shared/components/buttons/SaveButton'
import SDLReactSelect from '../../../../shared/components/form/SDLReactSelect'
import { getAppraisalOrganogramEmployees } from '../../services/appraisalService'

/* Employees of the appraisal by organogram, with their appraisers. While New an employee can be removed. */
const EmployeeList = ({ organograms, editable, busy, onRemove }) => (
  <div className='table-responsive'>
    <table className='table table-bordered table-sm align-middle mb-0 appraisal-table'>
      <thead>
        <tr>
          <th style={{ width: '3rem' }}>#</th>
          <th>Name</th>
          <th style={{ width: '8rem' }}>DOJ</th>
          <th style={{ width: '8rem' }}>Confirmation Date</th>
          <th>Appraiser</th>
          <th style={{ width: '4rem' }} className='text-center'>
            Count
          </th>
        </tr>
      </thead>
      <tbody>
        {organograms.length === 0 && (
          <tr>
            <td colSpan={6} className='text-center text-muted'>
              No employees added yet.
            </td>
          </tr>
        )}
        {organograms.map((organogram, index) => [
          <tr key={`o-${organogram.id}`} className='appraisal-group-row'>
            <td className='text-center'>{index + 1}</td>
            <td colSpan={4} className='fw-semibold'>
              {organogram.name}
            </td>
            <td className='text-center'>#{organogram.employees.length}</td>
          </tr>,
          ...organogram.employees.map(employee => (
            <tr key={employee.code}>
              <td />
              <td>
                {employee.name} <span className='text-muted'>({employee.code})</span>
              </td>
              <td>{employee.doj}</td>
              <td>{employee.confirmationDate}</td>
              <td>
                {employee.appraisers.length ? employee.appraisers.map(line => <div key={line}>{line}</div>) : <span className='text-muted'>-</span>}
              </td>
              <td className='text-center'>
                {editable && (
                  <button
                    type='button'
                    className='btn btn-link text-danger p-0'
                    title='Remove'
                    aria-label={`Remove ${employee.name}`}
                    disabled={busy}
                    onClick={() => onRemove(employee)}
                  >
                    <i className='ti ti-trash' />
                  </button>
                )}
              </td>
            </tr>
          ))
        ])}
      </tbody>
    </table>
  </div>
)

/* Appraisal Organogram Employee tab (legacy appraisal_setup.php tab 3): add an organogram's employees. */
const AppraisalEmployeesTab = ({ detail, busy, run }) => {
  const { appraisal } = detail
  const editable = appraisal.status === 'N'
  const [orgId, setOrgId] = useState('')
  const [result, setResult] = useState(null)
  const [selected, setSelected] = useState(() => new Set())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadOrganogram = value => {
    setOrgId(value || '')
    setResult(null)
    setSelected(new Set())
    setError('')
    if (!value) return
    setLoading(true)
    getAppraisalOrganogramEmployees(appraisal.id, value)
      .then(response => {
        if (!response?.status) throw new Error(response?.message)
        setResult(response.data)
        // New employees start ticked; positions already in the appraisal are locked (legacy).
        setSelected(new Set(response.data.employees.filter(employee => !employee.added).map(employee => employee.code)))
      })
      .catch(loadError => setError(loadError?.message || 'Unable to load the employees.'))
      .finally(() => setLoading(false))
  }

  const available = (result?.employees || []).filter(employee => !employee.added)
  const allSelected = available.length > 0 && available.every(employee => selected.has(employee.code))
  const toggle = code =>
    setSelected(current => {
      const next = new Set(current)
      if (next.has(code)) next.delete(code)
      else next.add(code)
      return next
    })

  const add = async () => {
    const employees = available.filter(employee => selected.has(employee.code))
    if (employees.length === 0) {
      setError('Please select one or more employees!')
      return
    }
    const done = await run({
      action: 'add_employees',
      org_id: orgId,
      employees: employees.map(employee => ({ code: employee.code, location_id: employee.locationId }))
    })
    if (done) loadOrganogram(orgId)
  }

  const list = (
    <EmployeeList
      organograms={detail.organograms}
      editable={editable}
      busy={busy}
      onRemove={employee =>
        run({ action: 'delete_employee', emp_code: employee.code }, ['Remove this employee?', "You won't be able to revert this!"])
      }
    />
  )

  return (
    <>
      <label className='form-label fw-semibold'>
        Appraisal: {appraisal.description}({appraisal.id})
      </label>
      {!editable ? (
        list
      ) : (
        <div className='row g-3'>
          <div className='col-lg-4'>
            <label className='form-label'>Organogram</label>
            <SDLReactSelect
              value={orgId}
              options={detail.organogramOptions || []}
              placeholder='Please Select Organogram'
              onChange={loadOrganogram}
            />
            {loading && <div className='text-muted small mt-2'>Loading employees...</div>}
            {error && <small className='text-danger d-block mt-1'>{error}</small>}
            {result && !result.hasLevels && (
              <div className='alert alert-warning py-2 mt-3 mb-0'>Please set Appraisal Level for this organogram before adding its employees.</div>
            )}
            {result?.hasLevels && (
              <>
                <div className='table-responsive mt-3'>
                  <table className='table table-bordered table-sm align-middle mb-0 appraisal-table'>
                    <thead>
                      <tr>
                        <th style={{ width: '3rem' }} className='text-center'>
                          <input
                            type='checkbox'
                            className='form-check-input'
                            aria-label='Select all employees'
                            checked={allSelected}
                            disabled={available.length === 0 || busy}
                            onChange={() => setSelected(allSelected ? new Set() : new Set(available.map(employee => employee.code)))}
                          />
                        </th>
                        <th>Employee Name</th>
                        <th style={{ width: '7rem' }}>Date Of Join</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.employees.length === 0 && (
                        <tr>
                          <td colSpan={3} className='text-center text-muted'>
                            No permanent or contractual employees in this organogram.
                          </td>
                        </tr>
                      )}
                      {result.employees.map(employee => (
                        <tr key={`${employee.locationId}-${employee.code}`}>
                          <td className='text-center'>
                            <input
                              type='checkbox'
                              className='form-check-input'
                              aria-label={employee.name}
                              checked={employee.added || selected.has(employee.code)}
                              disabled={employee.added || busy}
                              onChange={() => toggle(employee.code)}
                            />
                          </td>
                          <td>
                            {employee.code} - {employee.name}
                            {employee.added && <span className='badge bg-secondary ms-2'>Added</span>}
                          </td>
                          <td>{employee.doj}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className='d-flex justify-content-center gap-2 mt-3'>
                  <SaveButton onClick={add} isSubmitting={busy} disabled={available.length === 0} />
                </div>
              </>
            )}
          </div>
          <div className='col-lg-8'>
            <label className='form-label'>List Of Organogram Employees</label>
            {list}
          </div>
        </div>
      )}
    </>
  )
}

export default AppraisalEmployeesTab
