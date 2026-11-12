import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getProfile } from '../services/careersApi'

/* Jobs the candidate applied for (legacy application_form.php?t=10). */
const CareersAppliedJobs = () => {
  const [applied, setApplied] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    getProfile().then(result => {
      if (!active) return
      if (result?.status) setApplied(result.data.applied || [])
      else setError(result?.message || 'Unable to load your applications.')
    })
    return () => {
      active = false
    }
  }, [])

  return (
    <div className='careers-card'>
      <div className='careers-card-header'>
        <h1 className='h4 mb-0'>Applied Jobs</h1>
      </div>
      <div className='careers-card-body'>
        {error ? (
          <div className='alert alert-danger mb-0'>{error}</div>
        ) : applied === null ? (
          <div className='text-center py-4'>
            <div className='spinner-border text-primary' role='status' />
          </div>
        ) : applied.length === 0 ? (
          <div className='text-center text-muted py-4'>
            You have not applied for any job yet.{' '}
            <Link to='/careers/jobs'>Browse open positions</Link>
          </div>
        ) : (
          <div className='table-responsive'>
            <table className='table table-hover align-middle mb-0'>
              <thead className='table-light'>
                <tr>
                  <th style={{ width: '60px' }}>#</th>
                  <th>Job Details</th>
                  <th style={{ width: '160px' }}>Applied On</th>
                </tr>
              </thead>
              <tbody>
                {applied.map((job, index) => (
                  <tr key={`${job.recId}-${index}`}>
                    <td>{index + 1}</td>
                    <td>
                      <div className='fw-semibold'>{job.designation || '-'}</div>
                      <div className='small text-muted'>
                        {[job.department, job.location].filter(Boolean).join(' · ')}
                      </div>
                    </td>
                    <td>{job.appliedOn}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default CareersAppliedJobs
