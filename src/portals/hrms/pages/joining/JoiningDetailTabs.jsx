import { useCallback, useEffect, useState } from 'react'
import SDLDataTable from '../../../../shared/components/datatable/SDLDataTable'
import SDLReactSelect from '../../../../shared/components/form/SDLReactSelect'
import SDLInput from '../../../../shared/components/form/SDLInput'
import SDLCalendar from '../../../../shared/components/calendar/SDLCalendar'
import SaveButton from '../../../../shared/components/buttons/SaveButton'
import CancelButton from '../../../../shared/components/buttons/CancelButton'
import EditButton from '../../../../shared/components/buttons/EditButton'
import DeleteButton from '../../../../shared/components/buttons/DeleteButton'
import {
  confirmAction,
  notifyError,
  notifySuccess
} from '../../../../shared/services/alertService'
import { parseDateValue } from '../../../../shared/utils/commonUtils'
import {
  deleteJoiningDetail,
  getJoiningCtcBreakup,
  saveJoiningDetail,
  submitJoiningTask
} from '../../services/newEmployeeService'
import { formStyles as styles, toDateValue, toOptions } from './joiningFormUtils'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const formatDate = value => {
  const [year, month, day] = String(value || '').split('-')
  return day ? `${day}-${MONTHS[Number(month) - 1]}-${year}` : ''
}

const digits = max => value => value.replace(/\D/g, '').slice(0, max)
const alphanumericUpper = max => value =>
  value.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, max)
const limit = max => value => value.slice(0, max)
const upper = max => value => value.toUpperCase().slice(0, max)

const BANK_STATUS = [
  { value: 'A', label: 'Active' },
  { value: 'N', label: 'In-Active' }
]
const DEPENDENT_OPTIONS = ['Dependant', 'Non-Dependant', 'Deceased', 'Not-Applicable'].map(
  value => ({ value, label: value })
)
const RETIRE_AGES = ['55', '58', '60'].map(value => ({ value, label: value }))
const HEAD_KEY_LABELS = { F: 'Fixed', C: '% of CTC', B: '% of Basic' }

// Only children can repeat; a spouse and children need a married employee (legacy).
const relationOptions = (details, values, rows, editId) => {
  const married = String(details.basic?.M_STATUS || '') === '1'
  const spouse = String(details.gender) === '1' ? 'Wife' : 'Husband'
  const relations = married
    ? ['Mother', 'Father', spouse, 'Son', 'Daughter', 'Sister', 'Brother']
    : ['Mother', 'Father', 'Sister', 'Brother']
  const used = rows
    .filter(row => String(row.ID) !== String(editId))
    .map(row => row.FM_RELATION)
    .filter(relation => !['Son', 'Daughter'].includes(relation))
  return relations
    .filter(relation => !used.includes(relation))
    .map(value => ({ value, label: value }))
}

const LIST_SECTIONS = {
  tenure: {
    title: 'Tenure Details',
    canDelete: true,
    needsRow: true,
    fields: ({ masters }) => [
      { name: 'ETYPE_ID', label: 'Employee Type', type: 'select', required: true, options: toOptions(masters.employeeTypes) },
      { name: 'ETYPE_PERIOD', label: 'Period (In Months)', clean: digits(4) },
      { name: 'EFF_FROM', label: 'Effective From', type: 'date', required: true },
      { name: 'EFF_TO', label: 'Effective To', type: 'date' }
    ],
    columns: [
      { header: 'Employee Type', field: 'ETYPE_NAME' },
      { header: 'Period', field: 'ETYPE_PERIOD' },
      { header: 'Effective From', date: 'EFF_FROM' },
      { header: 'Effective To', date: 'EFF_TO' }
    ]
  },
  bank: {
    title: 'Bank Details',
    needsRow: true,
    fields: ({ details }) => [
      { name: 'BANK_NAME', label: 'Bank Name', required: true, clean: upper(100) },
      { name: 'BANK_BRANCH', label: 'Bank Branch', required: true, clean: upper(100) },
      { name: 'BANK_ACNO', label: 'Account Number', required: true, clean: alphanumericUpper(30) },
      { name: 'BANK_IFSC', label: 'IFSC', required: true, clean: alphanumericUpper(details.ifscLength || 11) },
      { name: 'BANK_NOMINEE', label: 'Nominee Name', required: true, clean: upper(20) },
      { name: 'STATUS', label: 'Status', type: 'select', required: true, options: BANK_STATUS }
    ],
    columns: [
      { header: 'Bank Name', field: 'BANK_NAME' },
      { header: 'Branch', field: 'BANK_BRANCH' },
      { header: 'Account Number', field: 'BANK_ACNO' },
      { header: 'IFSC', field: 'BANK_IFSC' },
      { header: 'Nominee', field: 'BANK_NOMINEE' },
      { header: 'Status', body: row => (row.STATUS === 'A' ? 'Active' : 'In-Active') }
    ]
  },
  qualification: {
    title: 'Qualification Details',
    fields: () => [
      { name: 'INST_NAME', label: 'Institute Name', required: true, clean: limit(200) },
      { name: 'COURSE', label: 'Qualification', required: true, clean: limit(100) },
      { name: 'PERGRADE', label: 'Grade/Percentage/CGPA', required: true, clean: limit(20) },
      { name: 'FROM_DATE', label: 'Start Date', type: 'date', required: true },
      { name: 'TO_DATE', label: 'End Date', type: 'date', required: true },
      { name: 'REMARKS', label: 'Remark', clean: limit(100) }
    ],
    columns: [
      { header: 'Institute', field: 'INST_NAME' },
      { header: 'Qualification', field: 'COURSE' },
      { header: 'Grade', field: 'PERGRADE' },
      { header: 'Start Date', date: 'FROM_DATE' },
      { header: 'End Date', date: 'TO_DATE' },
      { header: 'Remark', field: 'REMARKS' }
    ]
  },
  experience: {
    title: 'Experience Details',
    fields: () => [
      { name: 'ORG_NAME', label: 'Organization Name', required: true, clean: limit(100) },
      { name: 'DESIG', label: 'Designation', required: true, clean: limit(100) },
      { name: 'FROM_DATE', label: 'Start Date', type: 'date', required: true },
      { name: 'TO_DATE', label: 'End Date', type: 'date', required: true },
      { name: 'GROSS_SALARY', label: 'Gross Salary', required: true, clean: digits(8) },
      { name: 'DUTY_NATURE', label: 'Nature Of Duty', required: true, clean: limit(700) },
      { name: 'LEAVE_REASON', label: 'Leave Reason', required: true, clean: limit(1000) }
    ],
    columns: [
      { header: 'Organization', field: 'ORG_NAME' },
      { header: 'Designation', field: 'DESIG' },
      { header: 'Start Date', date: 'FROM_DATE' },
      { header: 'End Date', date: 'TO_DATE' },
      { header: 'Gross Salary', field: 'GROSS_SALARY' },
      { header: 'Nature Of Duty', field: 'DUTY_NATURE' },
      { header: 'Leave Reason', field: 'LEAVE_REASON' }
    ]
  },
  family: {
    title: 'Family Details',
    canDelete: true,
    fields: ({ details, values, rows, editId }) => {
      const deceased = values.FM_DEP === 'Deceased'
      return [
        { name: 'FM_NAME', label: 'Family Member Name', required: true, clean: limit(100) },
        { name: 'FM_RELATION', label: 'Relationship', type: 'select', required: true, options: relationOptions(details, values, rows, editId) },
        { name: 'FM_DEP', label: 'Dependent', type: 'select', required: true, options: DEPENDENT_OPTIONS },
        { name: 'FM_DOB', label: 'Date Of Birth', type: 'date', required: !deceased, disabled: deceased },
        { name: 'AADHAAR', label: 'Aadhaar Number', required: !deceased, clean: digits(12) },
        { name: 'FM_OCCUPATION', label: 'Occupation', required: !deceased, clean: limit(100) },
        { name: 'FM_CONTACT', label: 'Contact Number', clean: digits(10) }
      ]
    },
    columns: [
      { header: 'Name', field: 'FM_NAME' },
      { header: 'Relationship', field: 'FM_RELATION' },
      { header: 'Dependent', field: 'FM_DEP' },
      { header: 'Date Of Birth', date: 'FM_DOB' },
      { header: 'Aadhaar', field: 'AADHAAR' },
      { header: 'Occupation', field: 'FM_OCCUPATION' },
      { header: 'Contact', field: 'FM_CONTACT' }
    ]
  },
  kra: {
    title: 'KRA',
    fields: ({ details }) => [
      { name: 'KRA_ID', label: 'KRA', type: 'select', required: true, options: toOptions(details.kraOptions) },
      { name: 'RESP_PERC', label: 'KRA %', required: true, clean: digits(3) },
      { name: 'EFFEC_FROM', label: 'Effective From', type: 'date', required: true },
      { name: 'EFFEC_TO', label: 'Effective To', type: 'date' }
    ],
    columns: [
      { header: 'KRA', field: 'KRA_DESC' },
      { header: '%', field: 'RESP_PERC' },
      { header: 'Effective From', date: 'EFFEC_FROM' },
      { header: 'Effective To', date: 'EFFEC_TO' }
    ]
  }
}

const basicFields = masters => [
  { name: 'ADHAR_NO', label: 'Aadhaar No', required: true, clean: digits(12) },
  { name: 'PAN_NO', label: 'PAN No', clean: alphanumericUpper(10) },
  { name: 'DRIV_LICE_NO', label: 'Driving Licence No', clean: limit(50) },
  { name: 'PASSPORT_NO', label: 'Passport No', clean: limit(50) },
  { name: 'ESI_NO', label: 'ESI No', clean: limit(20) },
  { name: 'NATIONALITY', label: 'Nationality', type: 'select', required: true, options: toOptions(masters.nationalities) },
  { name: 'M_STATUS', label: 'Marital Status', type: 'select', options: toOptions(masters.maritalStatuses) },
  { name: 'DOA', label: 'Date Of Anniversary', type: 'date' },
  { name: 'MOTHER_LANG', label: 'Mother Language', clean: limit(50) },
  { name: 'RELIGION', label: 'Religion', type: 'select', options: toOptions(masters.religions) },
  { name: 'PF_NO', label: 'PF No', clean: limit(20) },
  { name: 'FPF_NO', label: 'FPF No', clean: limit(20) },
  { name: 'PF_NOMINEE', label: 'PF Nominee', clean: limit(100) },
  { name: 'MEMBER_ID', label: 'Member ID', clean: limit(50) },
  { name: 'UAN_NO', label: 'UAN No', clean: limit(50) },
  { name: 'RETIRE_AGE', label: 'Retirement Age', type: 'select', options: RETIRE_AGES },
  { name: 'CITIZEN_NO', label: 'Citizen No', clean: limit(25) }
]

const emptyValues = fields =>
  Object.fromEntries(fields.map(field => [field.name, '']))

const pickValues = (fields, row) =>
  Object.fromEntries(
    fields.map(field => [field.name, String(row?.[field.name] ?? '')])
  )

const findMissing = (fields, values) => {
  const missing = {}
  fields.forEach(field => {
    if (field.required && !String(values[field.name] || '').trim()) {
      missing[field.name] = `${field.label} is required.`
    }
  })
  return missing
}

/* -------------------- shared pieces -------------------- */

const Field = ({ field, value, error, disabled, onChange }) => {
  const isDisabled = disabled || field.disabled
  return (
    <div style={styles.field}>
      <label style={styles.label}>
        {field.label}
        {field.required && !disabled && <span style={styles.required}>*</span>}
      </label>
      {field.type === 'select' ? (
        <SDLReactSelect
          value={String(value || '')}
          options={field.options || []}
          onChange={next => onChange(field.name, next || '')}
          placeholder=''
          isClearable
          isSearchable
          isDisabled={isDisabled}
          width='100%'
        />
      ) : field.type === 'date' ? (
        <SDLCalendar
          value={parseDateValue(value)}
          allowAllDates
          disabled={isDisabled}
          inputClassName={error ? 'p-invalid' : ''}
          onChange={date => onChange(field.name, toDateValue(date))}
        />
      ) : (
        <SDLInput
          value={value || ''}
          disabled={isDisabled}
          onChange={event =>
            onChange(
              field.name,
              field.clean ? field.clean(event.target.value) : event.target.value
            )
          }
        />
      )}
      {error && <div className='invalid-feedback d-block'>{error}</div>}
    </div>
  )
}

const TaskActions = ({
  onSave,
  onSubmit,
  onCancel,
  busyAction,
  canSubmit,
  submitHint
}) => (
  <div className='d-flex justify-content-end mt-2 mb-3'>
    <SaveButton
      className='me-2'
      onClick={onSave}
      isSubmitting={busyAction === 'save'}
      disabled={Boolean(busyAction)}
    >
      Save
    </SaveButton>
    <button
      type='button'
      className='btn btn-success me-2'
      onClick={onSubmit}
      disabled={Boolean(busyAction) || !canSubmit}
      title={canSubmit ? undefined : submitHint}
    >
      {busyAction === 'submit' ? 'Processing...' : 'Submit'}
    </button>
    <CancelButton onClick={onCancel} disabled={Boolean(busyAction)} />
  </div>
)

/** Save and Submit behaviour shared by every tab. */
const useTaskActions = ({ userTaskId, onReload, onSubmitted }) => {
  const [busyAction, setBusyAction] = useState('')

  const save = async (values, id) => {
    setBusyAction('save')
    try {
      const response = await saveJoiningDetail({
        user_task_id: userTaskId,
        id: id || undefined,
        values
      })
      if (!response?.status) throw new Error(response?.message)
      notifySuccess(response.message)
      await onReload()
      return true
    } catch (error) {
      notifyError(error?.message || 'Unable to save the details.')
      return false
    } finally {
      setBusyAction('')
    }
  }

  const submit = async () => {
    const confirmed = await confirmAction(
      'Submit task?',
      'The task closes and no more changes can be made from it.'
    )
    if (!confirmed) return
    setBusyAction('submit')
    try {
      const response = await submitJoiningTask({ user_task_id: userTaskId })
      if (!response?.status) throw new Error(response?.message)
      notifySuccess(response.message)
      onSubmitted()
    } catch (error) {
      notifyError(error?.message || 'Unable to submit the task.')
      setBusyAction('')
    }
  }

  return { busyAction, setBusyAction, save, submit }
}

/* -------------------- tabs -------------------- */

const ListSection = ({ section, details, masters, isTask, userTaskId, onReload, onSubmitted, onCancel }) => {
  const config = LIST_SECTIONS[section]
  const rows = details[section] || []
  const [editId, setEditId] = useState('')
  const [errors, setErrors] = useState({})
  const [values, setValues] = useState(() =>
    emptyValues(config.fields({ details, masters, values: {}, rows, editId: '' }))
  )
  const fields = config.fields({ details, masters, values, rows, editId })
  const { busyAction, setBusyAction, save, submit } = useTaskActions({
    userTaskId,
    onReload,
    onSubmitted
  })
  const dirty = Boolean(editId) || Object.values(values).some(Boolean)

  const resetForm = () => {
    setEditId('')
    setErrors({})
    setValues(emptyValues(fields))
  }

  const handleSave = async () => {
    const missing = findMissing(fields, values)
    setErrors(missing)
    if (Object.keys(missing).length) return
    if (await save(values, editId)) resetForm()
  }

  const handleDelete = async row => {
    const confirmed = await confirmAction('Delete record?', 'This record will be removed.')
    if (!confirmed) return
    setBusyAction('delete')
    try {
      const response = await deleteJoiningDetail({
        user_task_id: userTaskId,
        id: row.ID
      })
      if (!response?.status) throw new Error(response?.message)
      notifySuccess(response.message)
      if (String(row.ID) === String(editId)) resetForm()
      await onReload()
    } catch (error) {
      notifyError(error?.message || 'Unable to delete the record.')
    } finally {
      setBusyAction('')
    }
  }

  const columns = config.columns.map(column =>
    column.date
      ? { header: column.header, body: row => formatDate(row[column.date]) }
      : column
  )
  if (isTask) {
    columns.push({
      header: 'Actions',
      style: { width: config.canDelete ? '100px' : '70px' },
      body: row => (
        <div className='d-flex justify-content-center gap-1'>
          <EditButton
            ariaLabel='Edit'
            onClick={() => {
              setErrors({})
              setEditId(String(row.ID))
              setValues(pickValues(fields, row))
            }}
          />
          {config.canDelete && (
            <DeleteButton
              ariaLabel='Delete'
              onClick={() => handleDelete(row)}
              disabled={Boolean(busyAction)}
            />
          )}
        </div>
      )
    })
  }

  return (
    <div>
      <div style={styles.sectionTitle}>{config.title}</div>
      {isTask && (
        <>
          <div className='row'>
            {fields.map(field => (
              <div className='col-lg-4 col-md-6' key={field.name}>
                <Field
                  field={field}
                  value={values[field.name]}
                  error={errors[field.name]}
                  onChange={(name, value) => {
                    setErrors(previous => ({ ...previous, [name]: '' }))
                    setValues(previous => ({ ...previous, [name]: value }))
                  }}
                />
              </div>
            ))}
          </div>
          <TaskActions
            onSave={handleSave}
            onSubmit={submit}
            onCancel={editId ? resetForm : onCancel}
            busyAction={busyAction}
            canSubmit={!dirty && (!config.needsRow || rows.length > 0)}
            submitHint={
              dirty
                ? 'Save or clear the details first'
                : 'Save at least one record first'
            }
          />
        </>
      )}
      <SDLDataTable
        data={rows}
        columns={columns}
        emptyMessage='No records saved'
        className='company-policies-grid fit-width-grid'
        tableStyle={{ width: '100%' }}
      />
    </div>
  )
}

const BasicSection = ({ details, masters, isTask, userTaskId, onReload, onSubmitted, onCancel }) => {
  const fields = basicFields(masters)
  const [values, setValues] = useState(() => pickValues(fields, details.basic))
  const [errors, setErrors] = useState({})
  const [dirty, setDirty] = useState(false)
  const { busyAction, save, submit } = useTaskActions({
    userTaskId,
    onReload,
    onSubmitted
  })

  const handleSave = async () => {
    const missing = findMissing(fields, values)
    setErrors(missing)
    if (Object.keys(missing).length) return
    if (await save(values)) setDirty(false)
  }

  return (
    <div>
      <div style={styles.sectionTitle}>Basic Details</div>
      <div className='row'>
        {fields.map(field => (
          <div className='col-lg-2 col-md-4 col-sm-6' key={field.name}>
            <Field
              field={field}
              value={values[field.name]}
              error={errors[field.name]}
              disabled={!isTask}
              onChange={(name, value) => {
                setDirty(true)
                setErrors(previous => ({ ...previous, [name]: '' }))
                setValues(previous => ({ ...previous, [name]: value }))
              }}
            />
          </div>
        ))}
        <div className='col-lg-2 col-md-4 col-sm-6'>
          <Field
            field={{ name: 'GRATUITY_DATE', label: 'Gratuity Date' }}
            value={details.gratuityDate}
            disabled
            onChange={() => {}}
          />
        </div>
      </div>
      {isTask && (
        <TaskActions
          onSave={handleSave}
          onSubmit={submit}
          onCancel={onCancel}
          busyAction={busyAction}
          canSubmit={!dirty && Boolean(details.basic?.ADHAR_NO)}
          submitHint='Save the basic details first'
        />
      )}
    </div>
  )
}

const AccessSection = ({ details, isTask, userTaskId, onReload, onSubmitted, onCancel }) => {
  const [selected, setSelected] = useState(() =>
    (details.appAccess || []).map(String)
  )
  const [dirty, setDirty] = useState(false)
  const { busyAction, save, submit } = useTaskActions({
    userTaskId,
    onReload,
    onSubmitted
  })

  const handleSave = async () => {
    if (!selected.length) {
      const confirmed = await confirmAction(
        'Are you sure?',
        'This employee will have no application access.'
      )
      if (!confirmed) return
    }
    if (await save({ apps: selected })) setDirty(false)
  }

  return (
    <div>
      <div style={styles.sectionTitle}>Application Access</div>
      {toOptions(details.apps).map(app => (
        <div key={app.value} className='mb-2'>
          <input
            id={`joining-app-${app.value}`}
            type='checkbox'
            checked={selected.includes(app.value)}
            disabled={!isTask}
            onChange={event => {
              setDirty(true)
              setSelected(previous =>
                event.target.checked
                  ? [...previous, app.value]
                  : previous.filter(value => value !== app.value)
              )
            }}
          />
          <label htmlFor={`joining-app-${app.value}`} style={styles.checkboxLabel}>
            {app.label}
          </label>
        </div>
      ))}
      {isTask && (
        <TaskActions
          onSave={handleSave}
          onSubmit={submit}
          onCancel={onCancel}
          busyAction={busyAction}
          canSubmit={!dirty}
          submitHint='Save the application access first'
        />
      )}
    </div>
  )
}

const amountText = value => {
  const amount = Number(value)
  return Number.isFinite(amount) ? String(Math.round(amount * 100) / 100) : ''
}

const CtcSection = ({ details, userTaskId, onReload, onSubmitted, onCancel }) => {
  const { heads = [], saved = {}, ctc: savedCtc = '', hasSaved = false } = details.ctc || {}
  const variableHeads = heads.filter(head => head.HEAD_KEY === 'V')
  const amountHeads = heads.filter(head => head.HEAD_KEY !== 'V')

  const [ctc, setCtc] = useState(String(savedCtc || ''))
  const [variables, setVariables] = useState(() =>
    Object.fromEntries(
      variableHeads.map(head => [
        head.AD_CODE,
        String(saved[head.AD_CODE]?.AMOUNT_MNTH ?? '0')
      ])
    )
  )
  const [monthly, setMonthly] = useState(() =>
    Object.fromEntries(
      amountHeads.map(head => [
        head.AD_CODE,
        saved[head.AD_CODE] ? String(saved[head.AD_CODE].AMOUNT_MNTH ?? '') : ''
      ])
    )
  )
  const [structure, setStructure] = useState({})
  const [dirty, setDirty] = useState(false)
  const { busyAction, save, submit } = useTaskActions({
    userTaskId,
    onReload,
    onSubmitted
  })

  const loadBreakup = useCallback(
    async (nextCtc, nextVariables, fillEmpty) => {
      const response = await getJoiningCtcBreakup({
        user_task_id: userTaskId,
        ctc: nextCtc,
        pf_basis: nextVariables.XPFBS ?? 0
      })
      if (!response?.status) throw new Error(response?.message)
      const amounts = response.data?.amounts || {}
      setStructure(amounts)
      if (fillEmpty) {
        setMonthly(previous =>
          Object.fromEntries(
            Object.entries(previous).map(([code, value]) => [
              code,
              value === '' && amounts[code] !== undefined
                ? amountText(amounts[code])
                : value
            ])
          )
        )
      }
    },
    [userTaskId]
  )

  // Show the structure of an already known CTC when the tab opens.
  useEffect(() => {
    if (!savedCtc || !heads.length) return
    // eslint-disable-next-line react-hooks/set-state-in-effect -- state is only set after the awaited request
    loadBreakup(String(savedCtc), variables, false).catch(error =>
      notifyError(error?.message || 'Unable to calculate the CTC breakup.')
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only when the tab opens
  }, [])

  const getBreakup = async (nextVariables = variables) => {
    if (!(Number(ctc) > 0)) {
      notifyError('Please enter a valid CTC.')
      return
    }
    try {
      await loadBreakup(ctc, nextVariables, true)
      setDirty(true)
    } catch (error) {
      notifyError(error?.message || 'Unable to calculate the CTC breakup.')
    }
  }

  const handleSave = async () => {
    if (!(Number(ctc) > 0)) {
      notifyError('Please enter a valid CTC.')
      return
    }
    if (await save({ ctc, monthly, variables })) setDirty(false)
  }

  if (!heads.length) {
    return (
      <div className='alert alert-warning mb-0' role='alert'>
        No CTC structure is set up for this employee&apos;s job description. Add it
        on the Job Description page first.
      </div>
    )
  }

  const sum = values => values.reduce((total, value) => total + (Number(value) || 0), 0)
  const structureTotal = sum(amountHeads.map(head => structure[head.AD_CODE]))
  const monthlyTotal = sum(amountHeads.map(head => monthly[head.AD_CODE]))

  return (
    <div>
      <div style={styles.sectionTitle}>CTC Details</div>
      <div className='row align-items-end'>
        <div className='col-lg-3 col-md-6'>
          <div style={styles.field}>
            <label style={styles.label}>
              Enter CTC (In Lakhs)<span style={styles.required}>*</span>
            </label>
            <SDLInput
              value={ctc}
              onChange={event => {
                setDirty(true)
                setCtc(event.target.value.replace(/[^0-9.]/g, '').slice(0, 10))
              }}
            />
          </div>
        </div>
        <div className='col-lg-3 col-md-6'>
          <div style={styles.field}>
            <button
              type='button'
              className='btn btn-primary'
              onClick={() => getBreakup()}
              disabled={Boolean(busyAction)}
            >
              Get Breakup
            </button>
          </div>
        </div>
      </div>

      {variableHeads.map(head => (
        <div className='row' key={head.AD_CODE}>
          <div className='col-lg-6 col-md-8'>
            <div style={styles.field}>
              <label style={styles.label}>
                {head.DESCR} (1: 12% of 15000, 0: 12% of Basic)
              </label>
              <SDLReactSelect
                value={String(variables[head.AD_CODE] ?? '0')}
                options={[
                  { value: '0', label: '0' },
                  { value: '1', label: '1' }
                ]}
                onChange={value => {
                  const next = { ...variables, [head.AD_CODE]: value || '0' }
                  setVariables(next)
                  setDirty(true)
                  if (Number(ctc) > 0) getBreakup(next)
                }}
                placeholder=''
                width='100%'
              />
            </div>
          </div>
        </div>
      ))}

      <div className='table-responsive mb-3'>
        <table className='table table-bordered align-middle mb-0'>
          <thead>
            <tr>
              <th>CTC Head</th>
              <th className='text-end'>As per Structure Monthly</th>
              <th className='text-end'>As per Structure Annually</th>
              <th className='text-end' style={{ width: '170px' }}>Monthly</th>
              <th className='text-end'>Annual</th>
            </tr>
          </thead>
          <tbody>
            {amountHeads.map(head => {
              const code = head.AD_CODE
              const keyLabel = HEAD_KEY_LABELS[head.HEAD_KEY] || ''
              return (
                <tr key={code}>
                  <td>
                    {head.DESCR} (
                    {head.HEAD_KEY === 'F' ? keyLabel : `${head.VAL} ${keyLabel}`})
                  </td>
                  <td className='text-end'>{amountText(structure[code] ?? 0)}</td>
                  <td className='text-end'>{amountText((structure[code] ?? 0) * 12)}</td>
                  <td>
                    <input
                      className='form-control text-end'
                      value={monthly[code] ?? ''}
                      aria-label={`${head.DESCR} monthly`}
                      onChange={event => {
                        setDirty(true)
                        const value = event.target.value.replace(/[^0-9.]/g, '').slice(0, 12)
                        setMonthly(previous => ({ ...previous, [code]: value }))
                      }}
                    />
                  </td>
                  <td className='text-end'>
                    {amountText((Number(monthly[code]) || 0) * 12)}
                  </td>
                </tr>
              )
            })}
            <tr className='fw-semibold'>
              <td className='text-end'>Sum</td>
              <td className='text-end'>{amountText(structureTotal)}</td>
              <td className='text-end'>{amountText(structureTotal * 12)}</td>
              <td className='text-end'>{amountText(monthlyTotal)}</td>
              <td className='text-end'>{amountText(monthlyTotal * 12)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <TaskActions
        onSave={handleSave}
        onSubmit={submit}
        onCancel={onCancel}
        busyAction={busyAction}
        canSubmit={!dirty && hasSaved}
        submitHint='Save the CTC breakup first'
      />
    </div>
  )
}

const JoiningDetailTab = ({ section, taskSection, details, ...rest }) => {
  const props = { details, isTask: section === taskSection, ...rest }
  if (section === 'basic') return <BasicSection {...props} />
  if (section === 'access') return <AccessSection {...props} />
  if (section === 'ctc') return <CtcSection {...props} />
  return <ListSection section={section} {...props} />
}

export default JoiningDetailTab
