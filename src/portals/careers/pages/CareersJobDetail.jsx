import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { applyForJob, getJob } from '../services/careersApi'
import { confirmAction, notifyError, notifySuccess } from '../../../shared/services/alertService'
import { JobCard } from './CareersJobs'

const Section = ({ title, children }) => (
  <section className='mb-4'>
    <h2 className='h5 text-primary mb-3'>{title}</h2>
    {children}
  </section>
)

/* Job description and Apply (legacy careers/view_jd.php). */
const CareersJobDetail = () => {
  const { recId } = useParams()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [applying, setApplying] = useState(false)

  const load = useCallback(async () => {
    const result = await getJob(recId)
    if (result?.status) {
      setData(result.data)
      setError('')
    } else {
      setError(result?.message || 'Unable to load the job.')
    }
  }, [recId])

  useEffect(() => {
    // Async load; state is only set after the request resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [load])

  if (error) {
    return (
      <div className='careers-card careers-card-body text-center'>
        <p className='mb-3'>{error}</p>
        <Link to='/careers/jobs' className='btn btn-primary'>
          Back to jobs
        </Link>
      </div>
    )
  }
  if (!data) {
    return (
      <div className='text-center py-5 text-secondary'>
        <div className='spinner-border' role='status' />
      </div>
    )
  }

  const { job, related, applicant } = data
  const completeness = applicant?.completeness
  const complete = completeness && completeness.score >= completeness.required

  const handleApply = async () => {
    const confirmed = await confirmAction('Apply for this job?', `${job.title}, ${job.location}`)
    if (!confirmed) return
    setApplying(true)
    const result = await applyForJob(job.id)
    setApplying(false)
    if (result?.status) {
      notifySuccess(result.message)
      load()
    } else {
      notifyError(result?.message || 'Unable to apply for this job.')
    }
  }

  return (
    <>
      <div className='careers-hero mb-4'>
        <Link to='/careers/jobs' className='text-muted small text-decoration-none'>
          <i className='ti ti-arrow-left me-1' />
          All jobs
        </Link>
        <h1 className='display-6 fw-bold mt-2 mb-1'>{job.heading}</h1>
        <p className='mb-3'>
          {job.division} · {job.location} · {job.department}
        </p>
        {applicant?.appliedOn ? (
          <div className='alert alert-warning d-inline-block mb-0'>You applied for this job on {applicant.appliedOn}.</div>
        ) : applicant?.blocked ? (
          <div className='alert alert-secondary d-inline-block mb-0'>You cannot apply for jobs at the moment. Please contact HR.</div>
        ) : complete ? (
          <button type='button' className='btn careers-btn btn-lg px-5' onClick={handleApply} disabled={applying}>
            {applying ? 'Applying...' : 'Apply Now'}
          </button>
        ) : (
          <div>
            <Link to='/careers/application-form' className='btn btn-danger btn-lg px-4'>
              Complete Your Profile to Apply
            </Link>
            {completeness && (
              <div className='small mt-2'>
                Your application form is {completeness.score}% complete; {completeness.required}% is needed to apply.
              </div>
            )}
          </div>
        )}
      </div>

      <div className='row g-4'>
        <div className='col-lg-8'>
          <div className='careers-card careers-card-body'>
            {job.summary && (
              <Section title='About This Job'>
                <p className='mb-0'>{job.summary}</p>
              </Section>
            )}
            {job.responsibilitiesHtml && (
              <Section title='Responsibilities'>
                {/* Sanitized on the server: plain formatting tags only, no attributes. */}
                <div className='careers-description' dangerouslySetInnerHTML={{ __html: job.responsibilitiesHtml }} />
              </Section>
            )}
            {job.education.length > 0 && (
              <Section title='Education'>
                <ul className='mb-0'>
                  {job.education.map((item, index) => (
                    <li key={index}>
                      {item.qualification || '-'}
                      {item.comments && <span className='text-muted'> ({item.comments})</span>}
                    </li>
                  ))}
                </ul>
              </Section>
            )}
            {job.skills.length > 0 && (
              <Section title='Required Skillset'>
                <ul className='mb-0'>
                  {job.skills.map((skill, index) => (
                    <li key={index}>
                      {skill.description || skill.code}
                      {skill.level && <span className='text-muted'> ({skill.level})</span>}
                    </li>
                  ))}
                </ul>
              </Section>
            )}
            {(job.minExperience !== '' || job.maxExperience !== '') && (
              <Section title='Required Experience'>
                <p className='mb-0'>
                  {job.minExperience || 0} to {job.maxExperience || job.minExperience || 0} years
                </p>
              </Section>
            )}
          </div>
        </div>
        <div className='col-lg-4'>
          <div className='careers-card careers-card-body'>
            <h2 className='h6 fw-bold mb-3'>MORE JOBS LIKE THIS</h2>
            {related.length === 0 ? (
              <p className='text-muted small mb-0'>No similar openings right now.</p>
            ) : (
              <div className='d-flex flex-column gap-3'>
                {related.map(item => (
                  <JobCard key={item.id} job={item} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default CareersJobDetail
