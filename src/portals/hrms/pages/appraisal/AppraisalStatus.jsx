import { useEffect, useRef, useState } from 'react'
import BreadcrumbNav from '../../../../shared/components/BreadcrumbNav'
import SDLDataTable from '../../../../shared/components/datatable/SDLDataTable'
import EditButton from '../../../../shared/components/buttons/EditButton'
import Badge from '../../../../shared/components/Badge'
import { notifyError } from '../../../../shared/services/alertService'
import { getAppraisalStatus } from '../../services/appraisalService'
import '../../../../shared/assets/css/companyPolicies.css'
import '../../assets/css/appraisal.css'

// Progress of each appraisal level, shown with the shared status badges (as on Leaves Request).
const STATES = {
  done: { label: 'Approved', className: 'badge-success' },
  progress: { label: 'In Progress', className: 'badge-warning' },
  pending: { label: 'Not reached', className: 'badge-secondary' },
  vacant: { label: 'Vacant', className: 'badge-danger' }
}

/* Appraisal Status (legacy appraisal_status.php): published appraisals and, for one, who has appraised each employee. */
const AppraisalStatus = () => {
  const [appraisals, setAppraisals] = useState([])
  const [loading, setLoading] = useState(true)
  const [detail, setDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const detailRef = useRef(null)

  useEffect(() => {
    getAppraisalStatus()
      .then(response => {
        if (!response?.status) throw new Error(response?.message)
        setAppraisals(response.data.appraisals || [])
      })
      .catch(error => notifyError(error?.message || 'Unable to load the appraisals.'))
      .finally(() => setLoading(false))
  }, [])

  // Bring the appraisal's status into view once it has loaded below the list.
  useEffect(() => {
    if (detail && !detailLoading) detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [detail, detailLoading])

  const view = id => {
    setDetailLoading(true)
    getAppraisalStatus(id)
      .then(response => {
        if (!response?.status) throw new Error(response?.message)
        setDetail(response.data)
      })
      .catch(error => notifyError(error?.message || 'Unable to load the appraisal status.'))
      .finally(() => setDetailLoading(false))
  }

  const columns = [
    { field: 'company', header: 'Company' },
    { field: 'description', header: 'Appraisal Description' },
    { field: 'type', header: 'Appraisal Type' },
    { field: 'base', header: 'Appraisal Base' },
    { field: 'publishDate', header: 'Publish Date' },
    {
      field: 'actions',
      header: 'Action',
      body: row => <EditButton ariaLabel='View' iconClassName='ti ti-eye' onClick={() => view(row.id)} disabled={detailLoading} />
    }
  ]
  const levels = Array.from({ length: detail?.levelCount || 0 }, (_, index) => index + 1)

  return (
    <>
      <div className='page-header' style={{ marginBottom: '8px' }}>
        <div className='page-title'>
          <h4>Appraisal Status</h4>
        </div>
        <BreadcrumbNav items={[{ text: 'Home', link: '/hrms/dashboard' }, { text: 'Appraisal', link: '#' }, { text: 'Appraisal Status' }]} />
      </div>
      <div className='row'>
        <div className='col-12 px-0'>
          <div className='card'>
            <div className='card-body'>
              <SDLDataTable
                data={appraisals}
                columns={columns}
                // The table's own loading mask also covers loading an appraisal's status; the page stays visible.
                loading={loading || detailLoading}
                emptyMessage='No data found'
                className='company-policies-grid fit-width-grid appraisal-status-grid'
                dataKey='id'
                rows={25}
                tableStyle={{ width: '100%' }}
              />
              {detail && !detailLoading && (
                <div className='mt-4' ref={detailRef} style={{ scrollMarginTop: '80px' }}>
                  <div className='d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2'>
                    <label className='form-label fw-semibold mb-0'>
                      Appraisal: {detail.appraisal.description}({detail.appraisal.id})
                    </label>
                    <div className='d-flex flex-wrap gap-2 small'>
                      {Object.values(STATES).map(state => (
                        <Badge key={state.label} text={state.label} className={`appraisal-status-badge ${state.className}`} />
                      ))}
                    </div>
                  </div>
                  <div className='table-responsive'>
                    <table className='table table-bordered table-sm align-middle mb-0 appraisal-table'>
                      <thead>
                        <tr>
                          <th style={{ width: '3rem' }}>#</th>
                          <th>Name</th>
                          {levels.map(level => (
                            <th key={level} className='text-center'>
                              App. Level {level}
                            </th>
                          ))}
                          <th style={{ width: '4rem' }} className='text-center'>
                            Count
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {detail.organograms.length === 0 && (
                          <tr>
                            <td colSpan={levels.length + 3} className='text-center text-muted'>
                              No employees in this appraisal.
                            </td>
                          </tr>
                        )}
                        {detail.organograms.map((organogram, index) => [
                          <tr key={`o-${organogram.id}`} className='appraisal-group-row'>
                            <td className='text-center'>{index + 1}</td>
                            <td colSpan={levels.length + 1} className='fw-semibold'>
                              {organogram.name}
                            </td>
                            <td className='text-center'>#{organogram.employees.length}</td>
                          </tr>,
                          ...organogram.employees.map(employee => (
                            <tr key={employee.code}>
                              <td />
                              <td>{employee.name}</td>
                              {employee.levels.map((cell, levelIndex) => (
                                <td key={levelIndex} className='text-center'>
                                  <Badge
                                    text={cell.name}
                                    className={`appraisal-status-badge ${STATES[cell.state].className}`}
                                    style={{ cursor: 'default' }}
                                  />
                                  <span className='visually-hidden'> ({STATES[cell.state].label})</span>
                                </td>
                              ))}
                              <td />
                            </tr>
                          ))
                        ])}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default AppraisalStatus
