import { useRef, useState } from 'react'
import { confirmAction, notifyError, notifySuccess } from '../../../shared/services/alertService'
import { addProfileEntry, deleteProfileEntry, documentUrl, saveProfileSection, uploadDocument } from '../services/careersApi'

/*
 * Field config: { key, label, type: text|textarea|select|date|number|checkbox|email|tel,
 *   options (option list key or array), required, maxLength, col, help, readOnly, showIf(form) }
 */
const Field = ({ field, value, onChange, options, disabled, error, idPrefix }) => {
  const id = `${idPrefix}-${field.key}`
  const common = {
    id,
    className: `${field.type === 'select' ? 'form-select' : 'form-control'}${error ? ' is-invalid' : ''}`,
    value: value ?? '',
    disabled: disabled || field.readOnly,
    onChange: event => onChange(field.key, event.target.value),
    maxLength: field.maxLength
  }
  let control
  if (field.type === 'checkbox') {
    return (
      <div className={`col-md-${field.col || 6} d-flex align-items-end`}>
        <div className='form-check mb-2'>
          <input
            id={id}
            type='checkbox'
            className='form-check-input'
            checked={Boolean(value)}
            disabled={disabled}
            onChange={event => onChange(field.key, event.target.checked)}
          />
          <label className='form-check-label' htmlFor={id}>
            {field.label}
          </label>
        </div>
      </div>
    )
  }
  if (field.type === 'textarea') {
    control = <textarea rows={field.rows || 3} {...common} />
  } else if (field.type === 'select') {
    control = (
      <select {...common}>
        <option value=''>Please select</option>
        {(options || []).map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    )
  } else {
    control = <input type={field.type || 'text'} {...common} max={field.type === 'date' ? field.max : undefined} />
  }
  return (
    <div className={`col-md-${field.col || 6}`}>
      <label className='form-label fw-semibold' htmlFor={id}>
        {field.label}
        {field.required && <span className='text-danger'> *</span>}
      </label>
      {control}
      {field.help && !error && <div className='form-text'>{field.help}</div>}
      {error && <div className='invalid-feedback d-block'>{error}</div>}
    </div>
  )
}

const resolveOptions = (field, options) =>
  Array.isArray(field.options) ? field.options : field.options ? options?.[field.options] || [] : undefined

const validate = (fields, form) => {
  const errors = {}
  fields.forEach(field => {
    if (field.showIf && !field.showIf(form)) return
    const value = form[field.key]
    if (field.required && (value === undefined || value === null || String(value).trim() === '')) {
      errors[field.key] = `${field.label} is required.`
    } else if (field.pattern && value && !field.pattern.test(String(value).trim())) {
      errors[field.key] = field.patternMessage || `Please enter a valid ${field.label.toLowerCase()}.`
    }
  })
  return errors
}

const SectionCard = ({ title, subtitle, children }) => (
  <div className='careers-card'>
    <div className='careers-card-header'>
      <h2 className='h5 mb-0'>{title}</h2>
      {subtitle && <div className='small text-muted mt-1'>{subtitle}</div>}
    </div>
    <div className='careers-card-body'>{children}</div>
  </div>
)

/* A section saved as a whole (personal, location & CTC, why join us). */
export const FormSection = ({ section, title, subtitle, fields, initial, options, onSaved }) => {
  const [form, setForm] = useState(initial || {})
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const change = (key, value) => {
    setForm(current => ({ ...current, [key]: value }))
    setErrors(current => ({ ...current, [key]: '' }))
  }

  const handleSubmit = async event => {
    event.preventDefault()
    const next = validate(fields, form)
    setErrors(next)
    if (Object.keys(next).length) return
    setSaving(true)
    const result = await saveProfileSection(section, form)
    setSaving(false)
    if (result?.status) {
      notifySuccess(result.message)
      onSaved()
    } else {
      notifyError(result?.message || 'Unable to save.')
    }
  }

  return (
    <SectionCard title={title} subtitle={subtitle}>
      <form onSubmit={handleSubmit} noValidate>
        <div className='row g-3'>
          {fields
            .filter(field => !field.showIf || field.showIf(form))
            .map(field => (
              <Field
                key={field.key}
                idPrefix={section}
                field={field}
                value={form[field.key]}
                options={resolveOptions(field, options)}
                onChange={change}
                disabled={saving}
                error={errors[field.key]}
              />
            ))}
        </div>
        <div className='mt-4'>
          <button type='submit' className='btn btn-primary px-4' disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </SectionCard>
  )
}

/* A list section: existing rows with delete, and an add form. */
export const ListSection = ({ section, title, subtitle, fields, columns, rows, options, onSaved, emptyText, initialForm }) => {
  const [form, setForm] = useState(initialForm || {})
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)

  const change = (key, value) => {
    setForm(current => ({ ...current, [key]: value }))
    setErrors(current => ({ ...current, [key]: '' }))
  }

  const handleAdd = async event => {
    event.preventDefault()
    const next = validate(fields, form)
    setErrors(next)
    if (Object.keys(next).length) return
    setBusy(true)
    const result = await addProfileEntry(section, form)
    setBusy(false)
    if (result?.status) {
      notifySuccess(result.message)
      setForm(initialForm || {})
      onSaved()
    } else {
      notifyError(result?.message || 'Unable to add the entry.')
    }
  }

  const handleDelete = async row => {
    const confirmed = await confirmAction('Delete this entry?', 'This cannot be undone.')
    if (!confirmed) return
    setBusy(true)
    const result = await deleteProfileEntry(section, row.id)
    setBusy(false)
    if (result?.status) {
      notifySuccess(result.message)
      onSaved()
    } else {
      notifyError(result?.message || 'Unable to delete the entry.')
    }
  }

  return (
    <SectionCard title={title} subtitle={subtitle}>
      {rows.length === 0 ? (
        <p className='text-muted'>{emptyText || 'Nothing added yet.'}</p>
      ) : (
        <div className='table-responsive mb-4'>
          <table className='table table-sm table-bordered align-middle mb-0'>
            <thead className='table-light'>
              <tr>
                {columns.map(column => (
                  <th key={column.key}>{column.label}</th>
                ))}
                <th style={{ width: '60px' }} />
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.id}>
                  {columns.map(column => (
                    <td key={column.key}>{column.render ? column.render(row) : row[column.key] || '-'}</td>
                  ))}
                  <td className='text-center'>
                    <button
                      type='button'
                      className='btn btn-sm btn-outline-danger'
                      onClick={() => handleDelete(row)}
                      disabled={busy}
                      aria-label='Delete entry'
                      title='Delete'
                    >
                      <i className='ti ti-trash' />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <form onSubmit={handleAdd} noValidate className='border-top pt-3'>
        <h3 className='h6 mb-3'>Add</h3>
        <div className='row g-3'>
          {fields
            .filter(field => !field.showIf || field.showIf(form))
            .map(field => (
              <Field
                key={field.key}
                idPrefix={section}
                field={field}
                value={form[field.key]}
                options={resolveOptions(field, options)}
                onChange={change}
                disabled={busy}
                error={errors[field.key]}
              />
            ))}
        </div>
        <div className='mt-3'>
          <button type='submit' className='btn btn-primary px-4' disabled={busy}>
            {busy ? 'Saving...' : 'Add'}
          </button>
        </div>
      </form>
    </SectionCard>
  )
}

/* General information: one answer per question, with "if yes" details. */
export const GeneralSection = ({ questions, onSaved }) => {
  const [answers, setAnswers] = useState(() =>
    Object.fromEntries(
      questions.map(q => [q.id, { answer: q.answer || '', followUpAnswer: q.followUpAnswer || '' }])
    )
  )
  const [missing, setMissing] = useState([])
  const [saving, setSaving] = useState(false)

  const change = (id, key, value) => {
    setAnswers(current => ({ ...current, [id]: { ...current[id], [key]: value } }))
    setMissing(current => current.filter(item => item !== id))
  }

  const handleSubmit = async event => {
    event.preventDefault()
    const empty = questions.filter(q => !String(answers[q.id]?.answer || '').trim()).map(q => q.id)
    setMissing(empty)
    if (empty.length) {
      notifyError('Please answer every question.')
      return
    }
    setSaving(true)
    const result = await saveProfileSection('general', { answers })
    setSaving(false)
    if (result?.status) {
      notifySuccess(result.message)
      onSaved()
    } else {
      notifyError(result?.message || 'Unable to save.')
    }
  }

  return (
    <SectionCard title='General Information' subtitle='Please answer all questions.'>
      <form onSubmit={handleSubmit} noValidate>
        {questions.map((q, index) => {
          const value = answers[q.id] || {}
          const invalid = missing.includes(q.id)
          return (
            <div key={q.id} className='row g-2 align-items-center py-2 border-bottom'>
              <label className='col-md-6 mb-0' htmlFor={`general-${q.id}`}>
                {index + 1}. {q.question}
              </label>
              <div className='col-md-2'>
                {q.type === 'yesno' ? (
                  <select
                    id={`general-${q.id}`}
                    className={`form-select${invalid ? ' is-invalid' : ''}`}
                    value={value.answer}
                    onChange={event => change(q.id, 'answer', event.target.value)}
                    disabled={saving}
                  >
                    <option value=''>Select</option>
                    <option value='YES'>Yes</option>
                    <option value='NO'>No</option>
                  </select>
                ) : (
                  <input
                    id={`general-${q.id}`}
                    className={`form-control${invalid ? ' is-invalid' : ''}`}
                    value={value.answer}
                    maxLength={500}
                    onChange={event => change(q.id, 'answer', event.target.value)}
                    disabled={saving}
                  />
                )}
              </div>
              <div className='col-md-4'>
                {q.followUp && (
                  <input
                    className='form-control'
                    placeholder={`If yes, ${q.followUp}`}
                    aria-label={`If yes, ${q.followUp}`}
                    value={value.followUpAnswer}
                    maxLength={500}
                    onChange={event => change(q.id, 'followUpAnswer', event.target.value)}
                    disabled={saving || value.answer === 'NO'}
                  />
                )}
              </div>
            </div>
          )
        })}
        <div className='mt-4'>
          <button type='submit' className='btn btn-primary px-4' disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </SectionCard>
  )
}

/* CV and profile picture. */
export const DocumentsSection = ({ documents, onSaved }) => {
  const [busy, setBusy] = useState('')
  const inputs = { cv: useRef(null), photo: useRef(null) }

  const upload = async (type, file) => {
    if (!file) return
    setBusy(type)
    const result = await uploadDocument(type, file)
    setBusy('')
    if (inputs[type].current) inputs[type].current.value = ''
    if (result?.status) {
      notifySuccess(result.message)
      onSaved()
    } else {
      notifyError(result?.message || 'Unable to upload the file.')
    }
  }

  const item = (type, label, accept, help, has) => (
    <div className='col-md-6'>
      <div className='border rounded p-3 h-100'>
        <div className='d-flex justify-content-between align-items-start mb-2'>
          <h3 className='h6 mb-0'>{label}</h3>
          {has ? (
            <span className='badge careers-badge-done'>Uploaded</span>
          ) : (
            <span className='badge bg-secondary'>Not uploaded</span>
          )}
        </div>
        {has && (
          <a className='small d-inline-block mb-2' href={documentUrl(type)} target='_blank' rel='noreferrer'>
            <i className='ti ti-external-link me-1' />
            View current {type === 'cv' ? 'CV' : 'picture'}
          </a>
        )}
        <label className='form-label small text-muted d-block' htmlFor={`careers-upload-${type}`}>
          {has ? 'Replace' : 'Upload'} ({help})
        </label>
        <input
          id={`careers-upload-${type}`}
          ref={inputs[type]}
          type='file'
          className='form-control'
          accept={accept}
          disabled={Boolean(busy)}
          onChange={event => upload(type, event.target.files?.[0])}
        />
        {busy === type && <div className='small text-muted mt-2'>Uploading...</div>}
      </div>
    </div>
  )

  return (
    <SectionCard title='CV & Profile Picture'>
      <div className='row g-3'>
        {item(
          'cv',
          'CV / Resume',
          '.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'PDF or Word, up to 5 MB',
          documents.hasCv
        )}
        {item('photo', 'Profile Picture', 'image/jpeg,image/png', 'JPG or PNG, up to 2 MB', documents.hasPhoto)}
      </div>
    </SectionCard>
  )
}
