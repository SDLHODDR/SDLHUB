import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getCandidateForm } from '../../services/recruitmentService'
import { careersFileUrl } from './recruitmentOptions'
import '../../assets/css/recruitment.css'

const Field = ({ label, value, className = 'col-6 col-md-3' }) => (
  <div className={className}>
    <div className='recruitment-form-label'>{label}</div>
    <div className='recruitment-form-value'>{value || ' '}</div>
  </div>
)

const Section = ({ title, children }) => (
  <section className='recruitment-form-section'>
    <h5 className='recruitment-form-heading'>{title}</h5>
    {children}
  </section>
)

const FormTable = ({ headers, rows }) => (
  <div className='table-responsive'>
    <table className='table table-bordered mb-0 recruitment-detail-table'>
      <thead>
        <tr>
          {headers.map(header => (
            <th key={header}>{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr key={index}>
            {row.map((cell, cellIndex) => (
              <td key={cellIndex}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

/* Employment Application Form (legacy careers/emp_form.php). Opens in its own tab and prints on A4. */
const CandidateApplicationForm = () => {
  const { id } = useParams()
  const [form, setForm] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [photoFailed, setPhotoFailed] = useState(false)

  useEffect(() => {
    let active = true
    getCandidateForm(id)
      .then(response => {
        if (!response?.status) throw new Error(response?.message)
        if (active) setForm(response.data)
      })
      .catch(error => {
        if (active) setLoadError(error?.message || 'Unable to load the application form.')
      })
    return () => {
      active = false
    }
  }, [id])

  if (loadError) return <div className='alert alert-danger m-3'>{loadError}</div>
  if (!form) {
    return (
      <div className='text-center py-5'>
        <div className='spinner-border text-primary' role='status'>
          <span className='visually-hidden'>Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className='card recruitment-form'>
      <div className='card-body'>
        <div className='d-flex justify-content-end recruitment-form-no-print mb-2'>
          <button type='button' className='btn btn-primary btn-sm' onClick={() => window.print()}>
            <i className='ti ti-printer me-1' aria-hidden='true' />
            Print
          </button>
        </div>

        <div className='d-flex flex-wrap align-items-center justify-content-center gap-3 mb-3'>
          {form.imagePath && !photoFailed ? (
            <img
              src={careersFileUrl(form.imagePath)}
              alt='Candidate'
              className='recruitment-form-photo'
              onError={() => setPhotoFailed(true)}
            />
          ) : (
            <div className='recruitment-form-photo d-flex align-items-center justify-content-center bg-light'>
              <i className='fas fa-user fa-3x text-muted' aria-hidden='true' />
            </div>
          )}
          <div className='recruitment-form-title flex-grow-1 text-center'>
            {form.company && <h3 className='mb-1 text-uppercase'>{form.company}</h3>}
            <h5 className='mb-0'>Employment Application Form</h5>
          </div>
        </div>

        <Section title='Personal Particulars'>
          <div className='row g-3'>
            <Field label='Position Applied For' value={form.appliedFor} className='col-12' />
            <Field label='Full Name' value={form.name} className='col-md-6' />
            <Field label="Father's / Husband's Name" value={form.guardianName} className='col-md-6' />
            <Field label='Present Address' value={[form.address, form.state].filter(Boolean).join(', ')} className='col-12' />
            <Field label='Permanent Address' value={[form.address, form.state].filter(Boolean).join(', ')} className='col-12' />
            <Field label='Tel No. (Landline)' value='' className='col-md-4' />
            <Field label='Mobile' value={form.mobile} className='col-md-4' />
            <Field label='Email' value={form.email} className='col-md-4' />
            <Field label='Male/Female' value={form.gender} />
            <Field label='Married/Unmarried' value={form.maritalStatus} />
            <Field label='Children' value='' />
            <Field label='Place of Birth' value='' />
            <Field label='Date of Birth' value={form.dob} />
            <Field label='Age' value={form.age} />
            <Field label='Nationality' value={form.nationality} />
            <Field label='Religion' value='' />
            <Field label='Caste' value='' />
            <Field label='Height' value='' />
            <Field label='Weight' value='' />
            <Field label='Eye sight' value='' />
            <Field label="Father's occupation" value={form.fatherOccupation} className='col-md-6' />
            <Field label="Mother's occupation" value={form.motherOccupation} className='col-md-6' />
            <Field label='Languages you can speak' value={form.languagesSpeak} className='col-12' />
            <Field label='Languages you can read' value={form.languagesRead} className='col-12' />
            <Field label='Languages you can write' value={form.languagesWrite} className='col-12' />
            <Field label='Mother Tongue' value='' className='col-12' />
          </div>
        </Section>

        {form.questions.length > 0 && (
          <Section title='General Information'>
            {form.questions.map((row, index) => (
              <div className='row g-2 mb-2' key={index}>
                <div className='col-md-7'>{row.question}</div>
                <div className='col-md-5 recruitment-form-value'>{row.answer || ' '}</div>
              </div>
            ))}
          </Section>
        )}

        {form.education.length > 0 && (
          <Section title='Educational Qualifications'>
            <FormTable
              headers={['Sr. No.', 'Name of School / College and Address', 'Passing Month/Year', 'Degree / Diploma', '% Or Grade']}
              rows={form.education.map((row, index) => [index + 1, row.institute, row.passing, row.course, row.grade])}
            />
          </Section>
        )}

        {form.experience.length > 0 && (
          <Section title='Experience (Recent job first)'>
            <FormTable
              headers={['Sr. No.', 'Name & Address of the Company', 'Period From', 'Period To', 'Designation', 'Gross Salary & Perks', 'Nature of duties performed', 'Reason for leaving']}
              rows={form.experience.map((row, index) => [
                index + 1, row.organization, row.from, row.to, row.designation, row.salary, row.duty, row.reason
              ])}
            />
          </Section>
        )}

        {form.references.length > 0 && (
          <Section title='References'>
            <FormTable
              headers={['Name and Address', 'Position', 'Tel. No.', 'Email', 'Years Known']}
              rows={form.references.map(row => [row.name, row.position, row.phone, row.email, row.years])}
            />
          </Section>
        )}

        <Section title='Declaration'>
          <div className='row g-3'>
            <Field
              label='Please explain, why you consider yourself suitable for the position applied for'
              value={form.suitability}
              className='col-12'
            />
            <Field label='Any other information not included in this form' value={form.otherInformation} className='col-12' />
          </div>
          <div className='form-check mt-3'>
            <input className='form-check-input' type='checkbox' id='recruitment-form-confirm' checked readOnly disabled />
            <label className='form-check-label' htmlFor='recruitment-form-confirm'>
              I confirm that the details given by me as above are correct.
            </label>
          </div>
          <div className='d-flex justify-content-between mt-4'>
            <span>Date:</span>
            <span>Signature</span>
          </div>
        </Section>

        <Section title='For Office Use Only'>
          <div className='row g-3'>
            <Field label='Final Recommendation (Specify Grades)' value='' className='col-12' />
            <Field label='Date of Interview' value='' className='col-md-6' />
            <Field label='Signature of Interviewer' value='' className='col-md-6' />
          </div>
        </Section>
      </div>
    </div>
  )
}

export default CandidateApplicationForm
