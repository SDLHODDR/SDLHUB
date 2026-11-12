import { useCallback, useEffect, useState } from 'react'
import { getProfile } from '../services/careersApi'
import { DocumentsSection, FormSection, GeneralSection, ListSection } from './ApplicationSections'

const today = () => new Date().toISOString().slice(0, 10)
const LAKHS = /^[0-9]+(\.[0-9]{1,2})?$/

// Sections in legacy order; "score" is the completeness key from the API.
const SECTIONS = [
  { key: 'personal', label: 'Personal Information', icon: 'ti-user', score: 'personal' },
  { key: 'education', label: 'Qualification Information', icon: 'ti-school', score: 'education' },
  { key: 'experience', label: 'Previous Experience & References', icon: 'ti-briefcase' },
  { key: 'general', label: 'General Information', icon: 'ti-list-check', score: 'general' },
  { key: 'ctc', label: 'Preferred Location & CTC', icon: 'ti-map-pin', score: ['location', 'ctc'] },
  { key: 'documents', label: 'CV & Profile Picture', icon: 'ti-id', score: 'cv' },
  { key: 'family', label: 'Family and Emergency Contact', icon: 'ti-users', score: 'family' },
  { key: 'social', label: 'Social Media Details', icon: 'ti-share', score: 'social' },
  { key: 'why', label: 'Why Should You Join Us?', icon: 'ti-bulb', score: 'why' },
  { key: 'language', label: 'Language Details', icon: 'ti-language', score: 'language' }
]

const PERSONAL_FIELDS = [
  { key: 'titleId', label: 'Title', type: 'select', options: 'titles', required: true, col: 2 },
  { key: 'name', label: 'Full Name', required: true, maxLength: 300, col: 6 },
  { key: 'dob', label: 'Date of Birth', type: 'date', required: true, col: 4, max: today() },
  { key: 'email', label: 'Email', readOnly: true, col: 6, help: 'Used to log in; cannot be changed here.' },
  { key: 'mobile', label: 'Mobile Number', readOnly: true, col: 6, help: 'Used to log in; cannot be changed here.' },
  { key: 'genderId', label: 'Gender', type: 'select', options: 'genders', required: true, col: 4 },
  { key: 'maritalStatus', label: 'Marital Status', type: 'select', options: 'maritalStatus', required: true, col: 4 },
  {
    key: 'aadhar', label: 'UID (Aadhaar) No.', maxLength: 12, col: 4,
    pattern: /^[0-9]{12}$/, patternMessage: 'UID (Aadhaar) number must be 12 digits.'
  },
  { key: 'addressLine1', label: 'Address Line 1 (Building / House)', required: true, maxLength: 100, col: 6 },
  { key: 'addressLine2', label: 'Address Line 2 (Road etc.)', maxLength: 300, col: 6 },
  { key: 'locality', label: 'Locality / Area (Landmark)', maxLength: 200, col: 6 },
  { key: 'city', label: 'City', required: true, maxLength: 200, col: 6 },
  { key: 'country', label: 'Country', type: 'select', options: 'countries', required: true, col: 4 },
  { key: 'state', label: 'State', type: 'select', options: 'states', col: 4, showIf: form => form.country === 'India' },
  { key: 'pincode', label: 'Pin Code', required: true, maxLength: 10, col: 4 }
]

const EDUCATION_FIELDS = [
  { key: 'course', label: 'Qualification', type: 'select', options: 'qualifications', required: true, col: 4 },
  { key: 'institute', label: 'Institute / University', required: true, maxLength: 200, col: 8 },
  { key: 'passingDate', label: 'Passing Date', type: 'date', required: true, col: 4, max: today() },
  { key: 'remarks', label: 'Percentage / Grade', required: true, maxLength: 100, col: 4 }
]

const EXPERIENCE_FIELDS = [
  { key: 'organisation', label: 'Organisation', required: true, maxLength: 100, col: 6 },
  { key: 'designation', label: 'Designation', required: true, maxLength: 100, col: 6 },
  { key: 'from', label: 'From', type: 'date', required: true, col: 4, max: today() },
  { key: 'current', label: 'I currently work here', type: 'checkbox', col: 4 },
  { key: 'to', label: 'To', type: 'date', required: true, col: 4, max: today(), showIf: form => !form.current },
  {
    key: 'grossSalary', label: 'Gross Salary (Lakhs p.a.)', required: true, maxLength: 6, col: 4,
    pattern: LAKHS, patternMessage: 'Enter the salary in lakhs, for example 3.5.'
  },
  { key: 'dutyNature', label: 'Nature of Duties', type: 'textarea', required: true, maxLength: 700, col: 12, rows: 2 },
  {
    key: 'leavingReason', label: 'Reason for Leaving', type: 'textarea', required: true, maxLength: 1000, col: 12, rows: 2,
    showIf: form => !form.current
  },
  { key: 'referenceName', label: 'Reference: Reported To', maxLength: 100, col: 6 },
  { key: 'referenceDesignation', label: 'Reference: Designation', maxLength: 100, col: 6 },
  {
    key: 'referencePhone', label: 'Reference: Phone', type: 'tel', maxLength: 15, col: 4,
    pattern: /^\+?[0-9]{10,14}$/, patternMessage: 'Enter a valid phone number.'
  },
  { key: 'referenceEmail', label: 'Reference: Email', type: 'email', maxLength: 50, col: 4 },
  { key: 'referenceYears', label: 'Reference: Years Known', maxLength: 20, col: 4 }
]

const CTC_FIELDS = [
  {
    key: 'currentCtc', label: 'Current CTC (Lakhs p.a.)', required: true, maxLength: 7, col: 4,
    pattern: LAKHS, patternMessage: 'Enter the CTC in lakhs, for example 3.5.'
  },
  {
    key: 'expectedCtc', label: 'Expected CTC (Lakhs p.a.)', required: true, maxLength: 7, col: 4,
    pattern: LAKHS, patternMessage: 'Enter the CTC in lakhs, for example 4.'
  },
  {
    key: 'noticePeriod', label: 'Notice Period (Days)', required: true, maxLength: 3, col: 4,
    pattern: /^[0-9]+$/, patternMessage: 'Enter the notice period in days.'
  },
  { key: 'currentLocation', label: 'Current Location', required: true, maxLength: 100, col: 4 },
  { key: 'preferredLocation', label: 'Preferred Location', required: true, maxLength: 100, col: 4 },
  { key: 'referenceId', label: 'How did you hear about us?', type: 'select', options: 'references', required: true, col: 4 }
]

const FAMILY_FIELDS = [
  { key: 'name', label: 'Name', required: true, maxLength: 100, col: 6 },
  { key: 'relation', label: 'Relation', type: 'select', options: 'relations', required: true, col: 3 },
  { key: 'dependent', label: 'Dependency', type: 'select', options: 'dependent', required: true, col: 3 },
  { key: 'occupation', label: 'Occupation', maxLength: 100, col: 4 },
  { key: 'age', label: 'Age', maxLength: 3, col: 2, pattern: /^[0-9]{1,3}$/, patternMessage: 'Enter a valid age.' },
  { key: 'contact', label: 'Emergency Contact', maxLength: 100, col: 6 }
]

const SOCIAL_FIELDS = [
  { key: 'medium', label: 'Social Media', type: 'select', options: 'socialMedia', required: true, col: 4 },
  { key: 'detail', label: 'Profile Link / Number', required: true, maxLength: 200, col: 8 }
]

const LANGUAGE_FIELDS = [
  { key: 'language', label: 'Language', type: 'select', options: 'languages', required: true, col: 6 },
  { key: 'read', label: 'Read', type: 'checkbox', col: 2 },
  { key: 'write', label: 'Write', type: 'checkbox', col: 2 },
  { key: 'speak', label: 'Speak', type: 'checkbox', col: 2 }
]

const WHY_FIELDS = [
  { key: 'whyJoin', label: 'Why do you want to join us?', type: 'textarea', required: true, maxLength: 3000, col: 12, rows: 4 },
  { key: 'whySelect', label: 'Why should we select you?', type: 'textarea', maxLength: 3000, col: 12, rows: 4 }
]

const yesNo = value => (value ? 'Yes' : 'No')

const sectionDone = (section, completeness) => {
  if (!section.score) return null
  const keys = Array.isArray(section.score) ? section.score : [section.score]
  return keys.every(key => completeness.sections[key])
}

/* Application form (legacy careers/application_form.php). */
const CareersApplicationForm = () => {
  const [profile, setProfile] = useState(null)
  const [error, setError] = useState('')
  const [active, setActive] = useState('personal')
  // Bumped after every save so section forms re-read the saved values.
  const [version, setVersion] = useState(0)

  const load = useCallback(async () => {
    const result = await getProfile()
    if (result?.status) {
      setProfile(result.data)
      setVersion(value => value + 1)
      setError('')
    } else {
      setError(result?.message || 'Unable to load your application form.')
    }
  }, [])

  useEffect(() => {
    // Async load; state is only set after the request resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [load])

  if (error) return <div className='alert alert-danger'>{error}</div>
  if (!profile) {
    return (
      <div className='text-center py-5 text-secondary'>
        <div className='spinner-border' role='status' />
      </div>
    )
  }

  const { completeness, options } = profile
  const percent = Math.min(100, Math.round((completeness.score / completeness.required) * 100))
  const common = { options, onSaved: load }

  const renderSection = () => {
    switch (active) {
      case 'personal':
        return (
          <FormSection key={`personal-${version}`} section='personal' title='Personal Details' fields={PERSONAL_FIELDS}
            initial={profile.personal} {...common} />
        )
      case 'education':
        return (
          <ListSection key={`education-${version}`} section='education' title='Qualification Details' fields={EDUCATION_FIELDS}
            rows={profile.education} {...common}
            columns={[
              { key: 'course', label: 'Qualification' }, { key: 'institute', label: 'Institute' },
              { key: 'passingDate', label: 'Passing Date' }, { key: 'remarks', label: '% / Grade' }
            ]} />
        )
      case 'experience':
        return (
          <ListSection key={`experience-${version}`} section='experience' title='Experience Details'
            subtitle='If this section is left empty, you will be considered a fresher.' fields={EXPERIENCE_FIELDS}
            rows={profile.experience} emptyText='No experience added (fresher).' initialForm={{ current: false }} {...common}
            columns={[
              { key: 'organisation', label: 'Organisation' }, { key: 'designation', label: 'Designation' },
              { key: 'period', label: 'Period', render: row => `${row.from} to ${row.current ? 'Present' : row.to || '-'}` },
              { key: 'grossSalary', label: 'Salary (L)' },
              { key: 'reference', label: 'Reference', render: row => [row.referenceName, row.referencePhone].filter(Boolean).join(', ') || '-' }
            ]} />
        )
      case 'general':
        return <GeneralSection key={`general-${version}`} questions={profile.general} onSaved={load} />
      case 'ctc':
        return (
          <FormSection key={`ctc-${version}`} section='ctc' title='Preferred Location & CTC' fields={CTC_FIELDS}
            initial={profile.ctc} {...common} />
        )
      case 'documents':
        return <DocumentsSection key={`documents-${version}`} documents={profile.documents} onSaved={load} />
      case 'family':
        return (
          <ListSection key={`family-${version}`} section='family' title='Family and Emergency Contact Details'
            fields={FAMILY_FIELDS} rows={profile.family} {...common}
            columns={[
              { key: 'name', label: 'Name' }, { key: 'relation', label: 'Relation' }, { key: 'dependent', label: 'Dependency' },
              { key: 'occupation', label: 'Occupation' }, { key: 'age', label: 'Age' }, { key: 'contact', label: 'Contact' }
            ]} />
        )
      case 'social':
        return (
          <ListSection key={`social-${version}`} section='social' title='Social Media Details' fields={SOCIAL_FIELDS}
            rows={profile.social} {...common}
            columns={[{ key: 'medium', label: 'Social Media' }, { key: 'detail', label: 'Details' }]} />
        )
      case 'why':
        return (
          <FormSection key={`why-${version}`} section='why' title='Why Should You Join Us?' fields={WHY_FIELDS}
            initial={profile.why} {...common} />
        )
      case 'language':
        return (
          <ListSection key={`language-${version}`} section='language' title='Language Details' fields={LANGUAGE_FIELDS}
            rows={profile.languages} initialForm={{ read: false, write: false, speak: false }} {...common}
            columns={[
              { key: 'language', label: 'Language' },
              { key: 'read', label: 'Read', render: row => yesNo(row.read) },
              { key: 'write', label: 'Write', render: row => yesNo(row.write) },
              { key: 'speak', label: 'Speak', render: row => yesNo(row.speak) }
            ]} />
        )
      default:
        return null
    }
  }

  return (
    <div className='row g-4'>
      <div className='col-lg-4 col-xl-3'>
        <div className='careers-card careers-card-body'>
          <div className='d-flex justify-content-between small mb-1'>
            <span className='fw-semibold'>Profile completeness</span>
            <span>{percent}%</span>
          </div>
          <div className='progress careers-progress mb-2' role='progressbar' aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}
            aria-label='Profile completeness'>
            <div className='progress-bar careers-progress-bar' style={{ width: `${percent}%` }} />
          </div>
          <p className='small text-muted mb-3'>
            {percent >= 100 ? 'Your profile is complete. You can apply for jobs.' : 'Complete your profile to apply for jobs.'}
          </p>
          <div className='list-group careers-sections'>
            {SECTIONS.map(section => {
              const done = sectionDone(section, completeness)
              return (
                <button
                  key={section.key}
                  type='button'
                  className={`list-group-item list-group-item-action${active === section.key ? ' active' : ''}`}
                  onClick={() => setActive(section.key)}
                  aria-current={active === section.key ? 'true' : undefined}
                >
                  <i className={`ti ${section.icon} text-muted`} aria-hidden='true' />
                  <span>{section.label}</span>
                  {done !== null && (
                    <i
                      className={`ti careers-section-status ${done ? 'ti-circle-check careers-done' : 'ti-circle-x text-danger'}`}
                      aria-label={done ? 'Completed' : 'Not completed'}
                    />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>
      <div className='col-lg-8 col-xl-9'>{renderSection()}</div>
    </div>
  )
}

export default CareersApplicationForm
