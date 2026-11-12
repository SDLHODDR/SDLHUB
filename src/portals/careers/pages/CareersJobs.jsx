import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getJobs } from '../services/careersApi'
import CancelButton from '../../../shared/components/buttons/CancelButton'

const FILTERS = [
  { value: 'location', label: 'Location' },
  { value: 'department', label: 'Department' },
  { value: 'designation', label: 'Designation' }
]

export const JobCard = ({ job }) => (
  <Link to={`/careers/jobs/${job.id}`} className='careers-job-card'>
    <div className='careers-job-meta d-flex align-items-center gap-2 mb-2'>
      <span>{job.division}</span>
      <span className='careers-dot' aria-hidden='true' />
      <span>{job.location}</span>
    </div>
    <div className='careers-job-title mb-2'>{job.title}</div>
    {job.about && (
      <p className='text-muted small mb-2'>
        <strong className='text-dark'>About this job:</strong> {job.about}
      </p>
    )}
    <p className='small mb-2 mt-auto'>
      <strong>Business Area:</strong> {job.department}
    </p>
    {job.posted && <p className='small fst-italic text-muted mb-0'>Posted {job.posted}</p>}
  </Link>
)

/* Job search (legacy careers/dashboard.php). */
const CareersJobs = () => {
  const [jobs, setJobs] = useState([])
  const [filters, setFilters] = useState({ location: [], department: [], designation: [] })
  const [filterType, setFilterType] = useState('location')
  const [filterValue, setFilterValue] = useState('')
  const [search, setSearch] = useState('')
  const [applied, setApplied] = useState({ filterType: '', filterValue: '', search: '' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async criteria => {
    setLoading(true)
    const result = await getJobs({
      filter: criteria.filterValue ? criteria.filterType : undefined,
      values: criteria.filterValue || undefined,
      q: criteria.search || undefined
    })
    if (result?.status) {
      setJobs(result.data.jobs || [])
      setFilters(result.data.filters || {})
      setError('')
    } else {
      setError(result?.message || 'Unable to load the jobs.')
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    // Async load; state is only set after the request resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load(applied)
  }, [load, applied])

  // The dropdowns filter as soon as a value is picked; the keyword applies on Search / Enter.
  const handleSearch = event => {
    event.preventDefault()
    setApplied({ filterType, filterValue, search: search.trim() })
  }

  const changeFilterType = value => {
    setFilterType(value)
    setFilterValue('')
    setApplied(current => (current.filterValue ? { ...current, filterType: value, filterValue: '' } : current))
  }

  const changeFilterValue = value => {
    setFilterValue(value)
    setApplied(current => ({ ...current, filterType, filterValue: value }))
  }

  const clear = () => {
    setFilterValue('')
    setSearch('')
    setApplied({ filterType: '', filterValue: '', search: '' })
  }

  const hasCriteria = Boolean(applied.filterValue || applied.search)

  return (
    <div className='careers-card'>
      <div className='careers-card-header'>
        <h1 className='h4 mb-0'>Search Jobs at Shree Dhootapapeshwar Ltd.</h1>
      </div>
      <div className='careers-card-body'>
        <form className='row g-2 align-items-end mb-4' onSubmit={handleSearch}>
          <div className='col-md-2'>
            <label className='form-label small text-muted mb-1' htmlFor='careers-filter-type'>
              Filter by
            </label>
            <select
              id='careers-filter-type'
              className='form-select'
              value={filterType}
              onChange={event => changeFilterType(event.target.value)}
            >
              {FILTERS.map(filter => (
                <option key={filter.value} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </select>
          </div>
          <div className='col-md-3'>
            <label className='form-label small text-muted mb-1' htmlFor='careers-filter-value'>
              {FILTERS.find(filter => filter.value === filterType)?.label}
            </label>
            <select
              id='careers-filter-value'
              className='form-select'
              value={filterValue}
              onChange={event => changeFilterValue(event.target.value)}
            >
              <option value=''>All</option>
              {(filters[filterType] || []).map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className='col-md-4'>
            <label className='form-label small text-muted mb-1' htmlFor='careers-search'>
              Keyword
            </label>
            <input
              id='careers-search'
              className='form-control'
              placeholder='Job title, location or department'
              value={search}
              maxLength={100}
              onChange={event => setSearch(event.target.value)}
            />
          </div>
          <div className='col-md-3 d-flex gap-2'>
            <button type='submit' className='btn careers-btn careers-search-btn flex-grow-1'>
              Search
            </button>
            {hasCriteria && (
              <CancelButton className='careers-search-btn px-3' onClick={clear} title='Clear search and filters' />
            )}
          </div>
        </form>

        {loading ? (
          <div className='text-center py-5'>
            <div className='spinner-border text-primary' role='status' />
          </div>
        ) : error ? (
          <div className='alert alert-danger'>{error}</div>
        ) : jobs.length === 0 ? (
          <div className='text-center text-muted py-5'>
            {hasCriteria ? 'No jobs match your search.' : 'There are no open positions right now. Please check back later.'}
          </div>
        ) : (
          <>
            <p className='text-muted small'>
              {jobs.length} open position{jobs.length === 1 ? '' : 's'}
            </p>
            <div className='row g-3'>
              {jobs.map(job => (
                <div key={job.id} className='col-md-6 col-lg-4'>
                  <JobCard job={job} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default CareersJobs
