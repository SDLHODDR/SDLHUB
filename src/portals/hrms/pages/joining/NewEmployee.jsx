import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import BreadcrumbNav from '../../../../shared/components/BreadcrumbNav'
import SDLDataTable from '../../../../shared/components/datatable/SDLDataTable'
import SDLReactSelect from '../../../../shared/components/form/SDLReactSelect'
import SDLInput from '../../../../shared/components/form/SDLInput'
import SDLCalendar from '../../../../shared/components/calendar/SDLCalendar'
import SaveButton from '../../../../shared/components/buttons/SaveButton'
import CancelButton from '../../../../shared/components/buttons/CancelButton'
import EditButton from '../../../../shared/components/buttons/EditButton'
import {
  confirmAction,
  notifyError,
  notifySuccess
} from '../../../../shared/services/alertService'
import { parseDateValue } from '../../../../shared/utils/commonUtils'
import '../../../../shared/assets/css/companyPolicies.css'
import SDLTabsComponent from '../../components/tabs/SDLTabsComponent'
import { getEmployeeMasters } from '../../services/employeeDataService'
import {
  authorizeNewEmployee,
  getJoiningDetails,
  getNewEmployee,
  getNewEmployeeDrafts,
  getNewEmployeeOfficeOptions,
  saveNewEmployee,
  saveNewEmployeeOffice,
  sendNewEmployeeForAuth
} from '../../services/newEmployeeService'
import {
  formStyles as styles,
  joiningDetailTabs,
  toDateValue,
  toOptions
} from './joiningFormUtils'
import JoiningDetailTab from './JoiningDetailTabs'

const TABS = [
  { key: 'personal', label: 'Personal' },
  { key: 'office', label: 'Office Details' }
]

const STATUS_LABELS = {
  N: { label: 'Not Sent for Auth', className: 'bg-secondary' },
  T: { label: 'Waiting for Authorization', className: 'bg-warning text-dark' },
  A: { label: 'Active', className: 'bg-success' },
  R: { label: 'Resigned', className: 'bg-danger' }
}

const EMPTY_PERSONAL = {
  TITLE: '',
  FIRST_NAME: '',
  MIDDLE_NAME: '',
  LAST_NAME: '',
  DATE_OF_BIRTH: '',
  CURRENT_ADDRESS: '',
  CURRENT_CITY: '',
  CURRENT_STATE: '',
  CURRENT_COUNTRY: '',
  CURRENT_PINCODE: '',
  SAME_AS_CURRENT: false,
  PERMANENT_ADDRESS: '',
  PERMANENT_CITY: '',
  PERMANENT_STATE: '',
  PERMANENT_COUNTRY: '',
  PERMANENT_PINCODE: '',
  TELEPHONE: '',
  MOBILE_NUMBER: '',
  EMERGENCY_CONTACT: '',
  PERSONAL_EMAIL: '',
  COMPANY_EMAIL: '',
  COMPANY: '',
  DATE_OF_JOINING: '',
  DATE_OF_LEAVE: '',
  GENDER: '',
  BLOOD_GROUP: ''
}

const EMPTY_OFFICE = {
  DIVISION: '',
  DEPARTMENT: '',
  DESIGNATION: '',
  ORGANOGRAM: '',
  ORGANOGRAM_LOCATION: '',
  EFFECTIVE_FROM: ''
}

const EMPTY_OFFICE_OPTIONS = {
  divisions: [],
  departments: [],
  designations: [],
  organograms: [],
  locations: []
}

const REQUIRED_PERSONAL = {
  TITLE: 'Title',
  FIRST_NAME: 'First name',
  MIDDLE_NAME: 'Middle name',
  LAST_NAME: 'Last name',
  DATE_OF_BIRTH: 'Date of birth',
  CURRENT_ADDRESS: 'Current address',
  CURRENT_CITY: 'Current city',
  CURRENT_STATE: 'Current state',
  CURRENT_COUNTRY: 'Current country',
  CURRENT_PINCODE: 'Current pincode',
  PERMANENT_ADDRESS: 'Permanent address',
  PERMANENT_CITY: 'Permanent city',
  PERMANENT_STATE: 'Permanent state',
  PERMANENT_COUNTRY: 'Permanent country',
  PERMANENT_PINCODE: 'Permanent pincode',
  MOBILE_NUMBER: 'Mobile number',
  PERSONAL_EMAIL: 'Personal email',
  COMPANY: 'Company',
  DATE_OF_JOINING: 'Date of joining',
  GENDER: 'Gender'
}

const REQUIRED_OFFICE = {
  DIVISION: 'Division',
  DEPARTMENT: 'Department',
  DESIGNATION: 'Designation',
  ORGANOGRAM: 'Organogram',
  ORGANOGRAM_LOCATION: 'Organogram location',
  EFFECTIVE_FROM: 'Effective from'
}

// Permanent address fields filled by "Same as Current Address".
const SAME_ADDRESS_FIELDS = {
  PERMANENT_ADDRESS: 'CURRENT_ADDRESS',
  PERMANENT_CITY: 'CURRENT_CITY',
  PERMANENT_STATE: 'CURRENT_STATE',
  PERMANENT_COUNTRY: 'CURRENT_COUNTRY',
  PERMANENT_PINCODE: 'CURRENT_PINCODE'
}
const ADDRESS_FIELDS = [
  ...Object.keys(SAME_ADDRESS_FIELDS),
  ...Object.values(SAME_ADDRESS_FIELDS)
]

const NAME_MAX = 25 // EPP employee name columns
const CITY_MAX = 50
const EMAIL_MAX = 50
const ADDRESS_MAX = 300
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const DIGIT_LIMITS = {
  CURRENT_PINCODE: 6,
  PERMANENT_PINCODE: 6,
  TELEPHONE: 11,
  MOBILE_NUMBER: 10,
  EMERGENCY_CONTACT: 11
}

// Keep what can be typed in line with the database columns.
const cleanFieldValue = (name, value) => {
  if (['FIRST_NAME', 'MIDDLE_NAME', 'LAST_NAME'].includes(name)) {
    return value.replace(/[^A-Za-z.'\s]/g, '').slice(0, NAME_MAX)
  }
  if (name === 'CURRENT_CITY' || name === 'PERMANENT_CITY') {
    return value.replace(/[^A-Za-z.\s]/g, '').slice(0, CITY_MAX)
  }
  if (DIGIT_LIMITS[name]) {
    return value.replace(/\D/g, '').slice(0, DIGIT_LIMITS[name])
  }
  if (name === 'PERSONAL_EMAIL' || name === 'COMPANY_EMAIL') {
    return value.replace(/\s/g, '').slice(0, EMAIL_MAX)
  }
  if (name === 'CURRENT_ADDRESS' || name === 'PERMANENT_ADDRESS') {
    return value.slice(0, ADDRESS_MAX)
  }
  return value
}

const NewEmployee = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const empCode = searchParams.get('emp_code') || ''
  const userTaskId = searchParams.get('user_task_id') || ''

  const [activeTab, setActiveTab] = useState('personal')
  const [form, setForm] = useState(EMPTY_PERSONAL)
  const [office, setOffice] = useState(EMPTY_OFFICE)
  const [errors, setErrors] = useState({})
  const [masters, setMasters] = useState({})
  const [officeOptions, setOfficeOptions] = useState(EMPTY_OFFICE_OPTIONS)
  const [drafts, setDrafts] = useState([])
  const [draftsLoading, setDraftsLoading] = useState(true)
  const [allowedCompanies, setAllowedCompanies] = useState([])
  const [record, setRecord] = useState(null)
  const [loadedCode, setLoadedCode] = useState('')
  const [busyAction, setBusyAction] = useState('')
  const [officeDirty, setOfficeDirty] = useState(false)
  const [details, setDetails] = useState(null)

  // The URL decides which employee is open; going back to no employee (Cancel,
  // Send for Authorization, or the menu link) always starts a blank form.
  const [openCode, setOpenCode] = useState(empCode)
  if (openCode !== empCode) {
    setOpenCode(empCode)
    if (!empCode) {
      setForm(EMPTY_PERSONAL)
      setOffice(EMPTY_OFFICE)
      setOfficeOptions(EMPTY_OFFICE_OPTIONS)
      setRecord(null)
      setLoadedCode('')
      setErrors({})
      setOfficeDirty(false)
      setActiveTab('personal')
      setDetails(null)
    }
  }

  const isExisting = Boolean(empCode)
  const loading = isExisting && loadedCode !== empCode
  const canEdit = !isExisting || Boolean(record?.canEdit)
  const authorizeTaskId = record?.authorizeTaskId || ''
  const detailTask = record?.detailTask || null
  const tabs = detailTask
    ? [...TABS, ...joiningDetailTabs(detailTask.section)]
    : TABS
  const hasOffice = Boolean(record?.office)
  const busy = Boolean(busyAction)
  const status = record?.employee?.STATUS || ''
  const statusInfo = STATUS_LABELS[status]

  const loadDrafts = useCallback(async () => {
    try {
      const response = await getNewEmployeeDrafts()
      if (!response?.status) throw new Error(response?.message)
      setDrafts(response.data?.drafts || [])
      setAllowedCompanies((response.data?.companies || []).map(String))
    } catch (error) {
      notifyError(error?.message || 'Unable to load the saved employees.')
    } finally {
      setDraftsLoading(false)
    }
  }, [])

  const loadRecord = useCallback(async (code, taskId) => {
    try {
      const response = await getNewEmployee(code, taskId)
      if (!response?.status) throw new Error(response?.message)
      const { employee, office: savedOffice } = response.data
      const permanentMatches = Object.entries(SAME_ADDRESS_FIELDS).every(
        ([permanent, current]) => {
          const values = {
            PERMANENT_ADDRESS: employee.PERMNT_ADDRESS,
            PERMANENT_CITY: employee.PERMNT_CITY,
            PERMANENT_STATE: employee.PERMNT_STATE,
            PERMANENT_COUNTRY: employee.PERMNT_COUNTRY,
            PERMANENT_PINCODE: employee.PERMNT_PINCODE,
            CURRENT_ADDRESS: employee.ADDRESS,
            CURRENT_CITY: employee.CITY,
            CURRENT_STATE: employee.STATE,
            CURRENT_COUNTRY: employee.COUNTRY,
            CURRENT_PINCODE: employee.PINCODE
          }
          return (values[permanent] || '') === (values[current] || '')
        }
      )
      setRecord(response.data)
      setForm({
        TITLE: employee.TITLE || '',
        FIRST_NAME: employee.FNAME || '',
        MIDDLE_NAME: employee.MNAME || '',
        LAST_NAME: employee.LNAME || '',
        DATE_OF_BIRTH: employee.DOB || '',
        CURRENT_ADDRESS: employee.ADDRESS || '',
        CURRENT_CITY: employee.CITY || '',
        CURRENT_STATE: employee.STATE || '',
        CURRENT_COUNTRY: employee.COUNTRY || '',
        CURRENT_PINCODE: employee.PINCODE || '',
        SAME_AS_CURRENT: Boolean(employee.ADDRESS) && permanentMatches,
        PERMANENT_ADDRESS: employee.PERMNT_ADDRESS || '',
        PERMANENT_CITY: employee.PERMNT_CITY || '',
        PERMANENT_STATE: employee.PERMNT_STATE || '',
        PERMANENT_COUNTRY: employee.PERMNT_COUNTRY || '',
        PERMANENT_PINCODE: employee.PERMNT_PINCODE || '',
        TELEPHONE: employee.PHONE || '',
        MOBILE_NUMBER: employee.CELL || '',
        EMERGENCY_CONTACT: employee.TEL_NO_EMERG || '',
        PERSONAL_EMAIL: employee.PER_EMAIL || '',
        COMPANY_EMAIL: employee.COM_EMAIL || '',
        COMPANY: employee.COMP_ID || '',
        DATE_OF_JOINING: employee.DOJ || '',
        DATE_OF_LEAVE: employee.DOL || '',
        GENDER: employee.GENDER || '',
        BLOOD_GROUP: employee.BLOOD_GRP || ''
      })
      setOffice({
        DIVISION: savedOffice?.DIVSN_ID || '',
        DEPARTMENT: savedOffice?.DEPT_ID || '',
        DESIGNATION: savedOffice?.DESI_ID || '',
        ORGANOGRAM: savedOffice?.ORG_ID || '',
        ORGANOGRAM_LOCATION: savedOffice?.ORG_LOC_ID || '',
        EFFECTIVE_FROM: savedOffice?.EFFEC_FROM_ISO || employee.DOJ || ''
      })
      setOfficeDirty(false)
      setErrors({})
      const task = response.data.detailTask
      if (task) {
        const detailResponse = await getJoiningDetails(task.id)
        if (!detailResponse?.status) throw new Error(detailResponse?.message)
        setDetails(detailResponse.data)
        setActiveTab(task.section)
      } else {
        setDetails(null)
      }
    } catch (error) {
      setRecord(null)
      notifyError(error?.message || 'Unable to load the employee.')
    } finally {
      setLoadedCode(code)
    }
  }, [])

  useEffect(() => {
    let active = true
    getEmployeeMasters()
      .then(response => {
        if (active && response?.status) setMasters(response.data || {})
      })
      .catch(error => {
        if (active) {
          notifyError(error?.message || 'Unable to load the master data.')
        }
      })
    // eslint-disable-next-line react-hooks/set-state-in-effect -- state is only set after the awaited request
    loadDrafts()
    return () => {
      active = false
    }
  }, [loadDrafts])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- state is only set after the awaited request
    if (empCode) loadRecord(empCode, userTaskId)
  }, [empCode, userTaskId, loadRecord])

  // Office dropdowns depend on each other (legacy populate_desi / populate_org / populate_org_loc).
  const officeOptionsKey = [
    office.DIVISION,
    office.DEPARTMENT,
    office.DESIGNATION,
    office.ORGANOGRAM
  ].join('|')
  useEffect(() => {
    if (!empCode) return undefined
    let active = true
    getNewEmployeeOfficeOptions({
      emp_code: empCode,
      company: form.COMPANY || undefined,
      division: office.DIVISION || undefined,
      department: office.DEPARTMENT || undefined,
      designation: office.DESIGNATION || undefined,
      organogram: office.ORGANOGRAM || undefined
    })
      .then(response => {
        if (active && response?.status) {
          setOfficeOptions({
            ...EMPTY_OFFICE_OPTIONS,
            ...response.data,
            loadedFor: officeOptionsKey
          })
        }
      })
      .catch(error => {
        if (active) {
          notifyError(error?.message || 'Unable to load the office options.')
        }
      })
    return () => {
      active = false
    }
  }, [
    empCode,
    officeOptionsKey,
    form.COMPANY,
    office.DIVISION,
    office.DEPARTMENT,
    office.DESIGNATION,
    office.ORGANOGRAM
  ])

  const companyOptions = useMemo(() => {
    const options = toOptions(masters.companies)
    // An opened employee keeps showing its company even if outside the user's list.
    return options.filter(
      option =>
        allowedCompanies.includes(option.value) ||
        option.value === String(form.COMPANY)
    )
  }, [masters.companies, allowedCompanies, form.COMPANY])

  const titleOptions = useMemo(() => toOptions(masters.titles), [masters.titles])
  const stateOptions = useMemo(() => toOptions(masters.states), [masters.states])
  const countryOptions = useMemo(
    () => toOptions(masters.countries),
    [masters.countries]
  )
  const genderOptions = useMemo(() => toOptions(masters.genders), [masters.genders])
  const bloodGroupOptions = useMemo(
    () => toOptions(masters.bloodGroups),
    [masters.bloodGroups]
  )

  const clearError = name =>
    setErrors(current => ({ ...current, [name]: '' }))

  const handlePersonalChange = (name, rawValue) => {
    const value = typeof rawValue === 'string' ? cleanFieldValue(name, rawValue) : rawValue
    setForm(current => ({
      ...current,
      [name]: value,
      // Editing an address means the two may no longer match.
      SAME_AS_CURRENT: ADDRESS_FIELDS.includes(name)
        ? false
        : current.SAME_AS_CURRENT
    }))
    clearError(name)
  }

  const handleSameAddress = checked => {
    setForm(current => {
      const next = { ...current, SAME_AS_CURRENT: checked }
      if (checked) {
        Object.entries(SAME_ADDRESS_FIELDS).forEach(([permanent, source]) => {
          next[permanent] = current[source]
        })
      }
      return next
    })
    if (checked) {
      setErrors(current => {
        const next = { ...current }
        Object.keys(SAME_ADDRESS_FIELDS).forEach(field => {
          next[field] = ''
        })
        return next
      })
    }
  }

  const handleOfficeChange = (name, value) => {
    setOffice(current => {
      const next = { ...current, [name]: value || '' }
      // A change here makes the dependent selections invalid.
      if (name === 'DEPARTMENT') next.DESIGNATION = ''
      if (['DIVISION', 'DEPARTMENT', 'DESIGNATION'].includes(name)) {
        next.ORGANOGRAM = ''
        next.ORGANOGRAM_LOCATION = ''
      }
      if (name === 'ORGANOGRAM') next.ORGANOGRAM_LOCATION = ''
      return next
    })
    setOfficeDirty(true)
    clearError(name)
  }

  const resetForm = () => {
    if (empCode) {
      setSearchParams({})
      return
    }
    setForm(EMPTY_PERSONAL)
    setErrors({})
  }

  const openDraft = code => {
    setActiveTab('personal')
    setSearchParams({ emp_code: code })
  }

  const validatePersonal = () => {
    const next = {}
    Object.entries(REQUIRED_PERSONAL).forEach(([field, label]) => {
      if (!String(form[field] || '').trim()) next[field] = `${label} is required.`
    })
    if (form.MOBILE_NUMBER && form.MOBILE_NUMBER.length !== 10) {
      next.MOBILE_NUMBER = 'Mobile number must be 10 digits.'
    }
    if (form.PERSONAL_EMAIL && !EMAIL_PATTERN.test(form.PERSONAL_EMAIL)) {
      next.PERSONAL_EMAIL = 'Please enter a valid email.'
    }
    if (form.COMPANY_EMAIL && !EMAIL_PATTERN.test(form.COMPANY_EMAIL)) {
      next.COMPANY_EMAIL = 'Please enter a valid email.'
    }
    if (form.DATE_OF_BIRTH && form.DATE_OF_BIRTH >= toDateValue(new Date())) {
      next.DATE_OF_BIRTH = 'Date of birth must be in the past.'
    }
    if (
      form.DATE_OF_BIRTH &&
      form.DATE_OF_JOINING &&
      form.DATE_OF_JOINING <= form.DATE_OF_BIRTH
    ) {
      next.DATE_OF_JOINING = 'Date of joining must be after the date of birth.'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSavePersonal = async () => {
    if (!validatePersonal()) return
    if (!isExisting) {
      const confirmed = await confirmAction(
        'Generate employee code?',
        'This creates the employee and generates the employee code for the selected company. The company cannot be changed afterwards.'
      )
      if (!confirmed) return
    }
    setBusyAction('personal')
    try {
      const response = await saveNewEmployee({
        emp_code: empCode,
        title: form.TITLE,
        fname: form.FIRST_NAME,
        mname: form.MIDDLE_NAME,
        lname: form.LAST_NAME,
        dob: form.DATE_OF_BIRTH,
        address: form.CURRENT_ADDRESS,
        city: form.CURRENT_CITY,
        state: form.CURRENT_STATE,
        country: form.CURRENT_COUNTRY,
        pincode: form.CURRENT_PINCODE,
        permnt_address: form.PERMANENT_ADDRESS,
        permnt_city: form.PERMANENT_CITY,
        permnt_state: form.PERMANENT_STATE,
        permnt_country: form.PERMANENT_COUNTRY,
        permnt_pincode: form.PERMANENT_PINCODE,
        phone: form.TELEPHONE,
        cell: form.MOBILE_NUMBER,
        tel_no_emerg: form.EMERGENCY_CONTACT,
        per_email: form.PERSONAL_EMAIL,
        com_email: form.COMPANY_EMAIL,
        comp_id: form.COMPANY,
        doj: form.DATE_OF_JOINING,
        gender: form.GENDER,
        blood_grp: form.BLOOD_GROUP
      })
      if (!response?.status) throw new Error(response?.message)
      notifySuccess(response.message)
      loadDrafts()
      if (isExisting) {
        await loadRecord(empCode, userTaskId)
      } else {
        // Next step: Office Details of the employee just created.
        setActiveTab('office')
        setSearchParams({ emp_code: response.data.emp_code })
      }
    } catch (error) {
      notifyError(error?.message || 'Unable to save the employee.')
    } finally {
      setBusyAction('')
    }
  }

  const handleSaveOffice = async () => {
    const next = {}
    Object.entries(REQUIRED_OFFICE).forEach(([field, label]) => {
      if (!office[field]) next[field] = `${label} is required.`
    })
    if (
      office.EFFECTIVE_FROM &&
      form.DATE_OF_JOINING &&
      office.EFFECTIVE_FROM < form.DATE_OF_JOINING
    ) {
      next.EFFECTIVE_FROM = 'Effective from cannot be before the date of joining.'
    }
    setErrors(next)
    if (Object.keys(next).length > 0) return

    setBusyAction('office')
    try {
      const response = await saveNewEmployeeOffice({
        emp_code: empCode,
        divsn_id: office.DIVISION,
        dept_id: office.DEPARTMENT,
        desi_id: office.DESIGNATION,
        org_id: office.ORGANOGRAM,
        org_loc_id: office.ORGANOGRAM_LOCATION,
        effec_from: office.EFFECTIVE_FROM
      })
      if (!response?.status) throw new Error(response?.message)
      notifySuccess(response.message)
      loadDrafts()
      await loadRecord(empCode, userTaskId)
    } catch (error) {
      notifyError(error?.message || 'Unable to save the office details.')
    } finally {
      setBusyAction('')
    }
  }

  const handleSendForAuth = async () => {
    const confirmed = await confirmAction(
      'Send for authorization?',
      `Employee ${empCode} can no longer be edited here once it is sent for authorization.`
    )
    if (!confirmed) return
    setBusyAction('send')
    try {
      const response = await sendNewEmployeeForAuth({ emp_code: empCode })
      if (!response?.status) throw new Error(response?.message)
      notifySuccess(response.message)
      window.dispatchEvent(new Event('hrms-auth-tasks-changed'))
      loadDrafts()
      resetForm()
    } catch (error) {
      notifyError(error?.message || 'Unable to send for authorization.')
    } finally {
      setBusyAction('')
    }
  }

  const reloadDetails = useCallback(async () => {
    const response = await getJoiningDetails(detailTask.id)
    if (response?.status) setDetails(response.data)
  }, [detailTask])

  const backToTaskList = () =>
    navigate(`/hrms/taskauthorization/J/${detailTask.taskId}`)

  const handleTaskSubmitted = () => {
    window.dispatchEvent(new Event('hrms-auth-tasks-changed'))
    backToTaskList()
  }

  const renderActiveTab = () => {
    if (activeTab === 'office') return renderOfficeTab()
    if (activeTab === 'personal') return renderPersonalTab()
    if (!details) return null
    return (
      <JoiningDetailTab
        key={activeTab}
        section={activeTab}
        taskSection={detailTask.section}
        details={details}
        masters={masters}
        userTaskId={detailTask.id}
        onReload={reloadDetails}
        onSubmitted={handleTaskSubmitted}
        onCancel={backToTaskList}
      />
    )
  }

  const handleAuthorize = async () => {
    const confirmed = await confirmAction(
      'Authorize employee?',
      `Employee ${empCode} becomes active and the joining detail tasks are generated.`
    )
    if (!confirmed) return
    setBusyAction('authorize')
    try {
      const response = await authorizeNewEmployee({
        user_task_id: authorizeTaskId
      })
      if (!response?.status) throw new Error(response?.message)
      notifySuccess(response.message)
      window.dispatchEvent(new Event('hrms-auth-tasks-changed'))
      navigate('/hrms/taskauthorization/J/45')
    } catch (error) {
      notifyError(error?.message || 'Unable to authorize the employee.')
    } finally {
      setBusyAction('')
    }
  }

  /* -------------------- field helpers -------------------- */

  const fieldLabel = (label, required) => (
    <label style={styles.label}>
      {label}
      {required && <span style={styles.required}>*</span>}
    </label>
  )

  const fieldError = name =>
    errors[name] && (
      <div className='invalid-feedback d-block'>{errors[name]}</div>
    )

  const renderInput = (name, label, config = {}) => {
    const { required = false, disabled = false } = config
    return (
      <div style={styles.field}>
        {fieldLabel(label, required)}
        <SDLInput
          value={form[name] || ''}
          disabled={disabled || !canEdit}
          error={errors[name] || ''}
          onChange={event => handlePersonalChange(name, event.target.value)}
        />
      </div>
    )
  }

  const renderDate = (name, label, values, onChange, config = {}) => {
    const { required = false, disabled = false } = config
    return (
      <div style={styles.field}>
        {fieldLabel(label, required)}
        <SDLCalendar
          value={parseDateValue(values[name])}
          allowAllDates
          disabled={disabled || !canEdit}
          inputClassName={errors[name] ? 'p-invalid' : ''}
          onChange={date => onChange(name, toDateValue(date))}
        />
        {fieldError(name)}
      </div>
    )
  }

  const renderSelect = (name, label, options, values, onChange, config = {}) => {
    const { required = false, disabled = false, hint = '' } = config
    return (
      <div style={styles.field}>
        {fieldLabel(label, required)}
        <SDLReactSelect
          value={String(values[name] || '')}
          options={options}
          onChange={value => onChange(name, value || '')}
          placeholder=''
          isClearable
          isSearchable
          isDisabled={disabled || !canEdit}
          width='100%'
        />
        {fieldError(name)}
        {hint && <div className='form-text'>{hint}</div>}
      </div>
    )
  }

  const renderTextarea = (name, label) => (
    <div style={styles.field}>
      {fieldLabel(label, true)}
      <textarea
        className={`form-control${errors[name] ? ' is-invalid' : ''}`}
        value={form[name] || ''}
        disabled={!canEdit}
        maxLength={ADDRESS_MAX}
        onChange={event => handlePersonalChange(name, event.target.value)}
        style={{ height: '134px', minHeight: '134px', resize: 'vertical' }}
      />
      {fieldError(name)}
    </div>
  )

  const personalSelect = (name, label, options, config) =>
    renderSelect(name, label, options, form, handlePersonalChange, config)
  const officeSelect = (name, label, options, config) =>
    renderSelect(name, label, toOptions(options), office, handleOfficeChange, config)

  /* -------------------- tabs -------------------- */

  const renderPersonalTab = () => (
    <div>
      <div style={styles.sectionTitle}>Personal Information</div>

      <div className='row mb-3'>
        <div className='col'>
          {personalSelect('TITLE', 'Title', titleOptions, { required: true })}
        </div>
        <div className='col'>
          {renderInput('FIRST_NAME', 'First Name', { required: true })}
        </div>
        <div className='col'>
          {renderInput('MIDDLE_NAME', 'Middle Name', { required: true })}
        </div>
        <div className='col'>
          {renderInput('LAST_NAME', 'Last Name', { required: true })}
        </div>
        <div className='col'>
          {renderDate('DATE_OF_BIRTH', 'Date Of Birth', form, handlePersonalChange, {
            required: true
          })}
        </div>
      </div>

      <div className='row'>
        <div className='col-lg-5 col-md-6'>
          {renderTextarea('CURRENT_ADDRESS', 'Current Address')}
        </div>
        <div className='col-lg-5 col-md-6'>
          {renderTextarea('PERMANENT_ADDRESS', 'Permanent Address')}
        </div>
        <div className='col-lg-2 col-md-6'>
          {renderInput('CURRENT_CITY', 'Current City', { required: true })}
          {personalSelect('CURRENT_STATE', 'Current State', stateOptions, {
            required: true
          })}
        </div>
      </div>

      <div style={{ marginBottom: '18px', marginTop: '-2px' }}>
        <input
          id='new-employee-same-address'
          type='checkbox'
          checked={Boolean(form.SAME_AS_CURRENT)}
          disabled={!canEdit}
          onChange={event => handleSameAddress(event.target.checked)}
        />
        <label htmlFor='new-employee-same-address' style={styles.checkboxLabel}>
          Same as Current Address
        </label>
      </div>

      <div className='row mb-3'>
        <div className='col-lg-2 col-md-6'>
          {personalSelect('CURRENT_COUNTRY', 'Current Country', countryOptions, {
            required: true
          })}
        </div>
        <div className='col-lg-2 col-md-6'>
          {renderInput('CURRENT_PINCODE', 'Current Pincode', { required: true })}
        </div>
        <div className='col-lg-2 col-md-6'>
          {renderInput('PERMANENT_CITY', 'Permanent City', { required: true })}
        </div>
        <div className='col-lg-2 col-md-6'>
          {personalSelect('PERMANENT_STATE', 'Permanent State', stateOptions, {
            required: true
          })}
        </div>
        <div className='col-lg-2 col-md-6'>
          {personalSelect('PERMANENT_COUNTRY', 'Permanent Country', countryOptions, {
            required: true
          })}
        </div>
        <div className='col-lg-2 col-md-6'>
          {renderInput('PERMANENT_PINCODE', 'Permanent Pincode', { required: true })}
        </div>
      </div>

      <div className='row'>
        <div className='col-lg-2 col-md-4'>
          {renderInput('TELEPHONE', 'Telephone')}
        </div>
        <div className='col-lg-2 col-md-4'>
          {renderInput('MOBILE_NUMBER', 'Mobile Number', { required: true })}
        </div>
        <div className='col-lg-2 col-md-4'>
          {renderInput('EMERGENCY_CONTACT', 'Emergency Contact')}
        </div>
        <div className='col-lg-3 col-md-6'>
          {renderInput('PERSONAL_EMAIL', 'Personal Email-ID', { required: true })}
        </div>
        <div className='col-lg-3 col-md-6'>
          {renderInput('COMPANY_EMAIL', 'Company Email-ID')}
        </div>
      </div>

      <div className='row mt-3'>
        <div className='col-lg-4 col-md-6'>
          {personalSelect('COMPANY', 'Company', companyOptions, {
            required: true,
            disabled: isExisting
          })}
        </div>
        <div className='col-lg-2 col-md-6'>
          {renderDate('DATE_OF_JOINING', 'Date Of Joining', form, handlePersonalChange, {
            required: true
          })}
        </div>
        <div className='col-lg-2 col-md-6'>
          {renderDate('DATE_OF_LEAVE', 'Date Of Leave', form, handlePersonalChange, {
            disabled: true
          })}
        </div>
        <div className='col-lg-2 col-md-6'>
          {personalSelect('GENDER', 'Gender', genderOptions, { required: true })}
        </div>
        <div className='col-lg-2 col-md-6'>
          {personalSelect('BLOOD_GROUP', 'Blood Group', bloodGroupOptions)}
        </div>
      </div>

      {canEdit && (
        <div className='d-flex justify-content-end mt-2'>
          <SaveButton
            className='me-2'
            onClick={handleSavePersonal}
            isSubmitting={busyAction === 'personal'}
            disabled={busy || loading}
          >
            {isExisting ? 'Save' : 'Save & Generate Employee Code'}
          </SaveButton>
          <CancelButton onClick={resetForm} disabled={busy} />
        </div>
      )}
    </div>
  )

  const renderOfficeTab = () => {
    // Explain an empty list only once it has loaded for the current selection.
    const optionsCurrent = canEdit && officeOptions.loadedFor === officeOptionsKey
    if (!isExisting) {
      return (
        <div className='alert alert-info mb-0' role='alert'>
          Fill in the Personal tab and generate the employee code first. Office
          Details can be entered after that.
        </div>
      )
    }
    return (
      <div>
        <div style={styles.sectionTitle}>Office Details</div>

        <div className='row'>
          <div className='col-lg-4 col-md-6'>
            {officeSelect('DIVISION', 'Division', officeOptions.divisions, {
              required: true
            })}
          </div>
          <div className='col-lg-4 col-md-6'>
            {officeSelect('DEPARTMENT', 'Department', officeOptions.departments, {
              required: true
            })}
          </div>
          <div className='col-lg-4 col-md-6'>
            {officeSelect('DESIGNATION', 'Designation', officeOptions.designations, {
              required: true
            })}
          </div>
          <div className='col-lg-6 col-md-6'>
            {officeSelect('ORGANOGRAM', 'Organogram', officeOptions.organograms, {
              required: true,
              hint:
                optionsCurrent &&
                office.DESIGNATION &&
                !officeOptions.organograms.length
                  ? 'No organogram exists for this designation.'
                  : ''
            })}
          </div>
          <div className='col-lg-6 col-md-6'>
            {officeSelect(
              'ORGANOGRAM_LOCATION',
              'Organogram Location',
              officeOptions.locations,
              {
                required: true,
                hint:
                  optionsCurrent &&
                  office.ORGANOGRAM &&
                  !officeOptions.locations.length
                    ? 'No free location in this organogram.'
                    : ''
              }
            )}
          </div>
          <div className='col-lg-4 col-md-6'>
            {renderDate('EFFECTIVE_FROM', 'Effective From', office, handleOfficeChange, {
              required: true
            })}
          </div>
        </div>

        {canEdit && (
          <div className='d-flex justify-content-end mt-2'>
            <SaveButton
              className='me-2'
              onClick={handleSaveOffice}
              isSubmitting={busyAction === 'office'}
              disabled={busy || loading}
            >
              Save
            </SaveButton>
            <button
              type='button'
              className='btn btn-success me-2'
              onClick={handleSendForAuth}
              disabled={busy || loading || !hasOffice || officeDirty}
              title={
                !hasOffice || officeDirty
                  ? 'Save the office details first'
                  : undefined
              }
            >
              {busyAction === 'send' ? 'Processing...' : 'Send for Authorization'}
            </button>
            <CancelButton onClick={resetForm} disabled={busy} />
          </div>
        )}
      </div>
    )
  }

  const draftColumns = [
    { field: 'empCode', header: 'Employee Code', sortable: true, style: { width: '130px' } },
    { field: 'empName', header: 'Employee Name', sortable: true },
    { field: 'company', header: 'Company', sortable: true, style: { width: '110px' } },
    { field: 'doj', header: 'Date Of Joining', style: { width: '130px' } },
    { field: 'savedOn', header: 'Last Saved', style: { width: '130px' } },
    {
      header: 'Office Details',
      body: row => (row.hasOffice ? 'Saved' : 'Pending'),
      style: { width: '120px' }
    },
    {
      header: 'Actions',
      body: row => (
        <div className='d-flex justify-content-center'>
          <EditButton onClick={() => openDraft(row.empCode)} ariaLabel='Edit' />
        </div>
      ),
      style: { width: '80px', textAlign: 'center' }
    }
  ]

  return (
    <>
      <div className='page-header' style={{ marginBottom: '8px' }}>
        <div className='add-item d-flex'>
          <div className='page-title'>
            <h4>Employee Information</h4>
          </div>
        </div>
        <BreadcrumbNav
          items={[
            { text: 'Home', link: '/hrms/dashboard' },
            { text: detailTask ? 'Joining Task' : 'New Employee (Manual)' }
          ]}
        />
      </div>

      <div className='row'>
        <div className='col-12 px-0'>
          <div className='card'>
            <div className='card-body'>
              {isExisting && (
                <div className='d-flex align-items-center gap-2 mb-3'>
                  <strong style={{ fontSize: '14px' }}>
                    Employee Code: {empCode}
                  </strong>
                  {statusInfo && (
                    <span className={`badge ${statusInfo.className}`}>
                      {statusInfo.label}
                    </span>
                  )}
                </div>
              )}

              <SDLTabsComponent
                tabs={tabs}
                selectedTab={activeTab}
                onTabChange={setActiveTab}
                tabContent={renderActiveTab()}
                loading={loading}
              />

              {authorizeTaskId && (
                <div className='d-flex justify-content-end mt-3'>
                  <button
                    type='button'
                    className='btn btn-success me-2'
                    onClick={handleAuthorize}
                    disabled={busy || loading}
                  >
                    {busyAction === 'authorize' ? 'Processing...' : 'Authorize'}
                  </button>
                  <CancelButton
                    onClick={() => navigate('/hrms/taskauthorization/J/45')}
                    disabled={busy}
                  />
                </div>
              )}
            </div>
          </div>

          {!userTaskId && (
            <div className='card'>
              <div className='card-body'>
                <div style={styles.sectionTitle}>
                  Saved Employees (Not Sent for Authorization)
                </div>
                <SDLDataTable
                  data={drafts}
                  columns={draftColumns}
                  loading={draftsLoading}
                  emptyMessage='No saved employees'
                  className='company-policies-grid fit-width-grid'
                  tableStyle={{ width: '100%' }}
                  removableSort
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default NewEmployee
