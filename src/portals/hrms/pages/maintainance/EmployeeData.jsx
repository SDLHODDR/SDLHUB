import React, { useMemo, useState, useEffect } from 'react'
import Select from 'react-select'
import {
  getEmployees,
  getEmployeeById,
  getEmployeeMasters
} from '../../services/employeeDataService'

const INITIAL_EMPLOYEE_DATA = {
  // Employee selection
  EMPLOYEE_ID: '',

  // Personal
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
  BLOOD_GROUP: '',
  PROFILE_IMAGE: '',

  // Basic Details
  EMPLOYEE_CODE: '',
  EMPLOYEE_STATUS: '',
  MARITAL_STATUS: '',
  NATIONALITY: '',
  RELIGION: '',
  AADHAAR_NO: '',
  PAN_NO: '',

  // Office Details
  DEPARTMENT: '',
  DESIGNATION: '',
  DIVISION: '',
  LOCATION: '',
  REPORTING_MANAGER: '',
  EMPLOYMENT_TYPE: '',
  GRADE: '',
  LEVEL: '',

  // Tenure Details
  CONFIRMATION_DATE: '',
  PROBATION_PERIOD: '',
  RETIREMENT_DATE: '',
  TOTAL_EXPERIENCE: '',
  PREVIOUS_EXPERIENCE: '',

  // Bank Details
  BANK_NAME: '',
  ACCOUNT_NUMBER: '',
  IFSC_CODE: '',
  BRANCH_NAME: '',
  ACCOUNT_TYPE: '',

  // Qualification Details
  HIGHEST_QUALIFICATION: '',
  UNIVERSITY: '',
  SPECIALIZATION: '',
  PASSING_YEAR: '',
  QUALIFICATION_GRADE: '',

  // Experience Details
  PREVIOUS_COMPANY: '',
  PREVIOUS_DESIGNATION: '',
  PREVIOUS_FROM_DATE: '',
  PREVIOUS_TO_DATE: '',
  PREVIOUS_JOB_DESCRIPTION: '',

  // Reference
  REFERENCE_NAME: '',
  REFERENCE_RELATION: '',
  REFERENCE_CONTACT: '',
  REFERENCE_EMAIL: '',
  REFERENCE_ADDRESS: '',

  // Family Details
  FATHER_NAME: '',
  MOTHER_NAME: '',
  SPOUSE_NAME: '',
  SPOUSE_OCCUPATION: '',
  CHILDREN: '',
  FAMILY_CONTACT: '',

  // Documents
  PAN_DOCUMENT: '',
  AADHAAR_DOCUMENT: '',
  RESUME_DOCUMENT: '',
  PHOTO_DOCUMENT: '',
  OTHER_DOCUMENT: '',

  // Application Access
  USERNAME: '',
  ACCESS_ROLE: '',
  ACCESS_STATUS: '',

  // KRA
  KRA: ''
}

const EmployeeData = () => {
  /*
   * -------------------------------------------------------------
   * STATE
   * -------------------------------------------------------------
   */

  const [loading, setLoading] = useState(false)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('')
  const [showAllTabs, setShowAllTabs] = useState(false)
  const [activeTab, setActiveTab] = useState('personal')
  const [employeeData, setEmployeeData] = useState(INITIAL_EMPLOYEE_DATA)
  const [fieldErrors, setFieldErrors] = useState({})
  const [employees, setEmployees] = useState([])
  const [masters, setMasters] = useState({
    titles: [],
    states: [],
    countries: [],
    companies: [],
    genders: [],
    bloodGroups: [],
    maritalStatuses: [],
    religions: [],
    nationalities: [],
    employeeTypes: [],
    levels: [],
    bands: [],
    documentTypes: [],
    assets: []
  })

  const employeeOptions = useMemo(() => {
    if (!Array.isArray(employees)) {
      return []
    }

    return employees
      .map(item => ({
        value: String(item.ID || ''),
        label: item.EMP_NAME || ''
      }))
      .filter(item => item.value && item.label)
  }, [employees])

  /*
   -----------TABS----------
   */

  const tabs = [
    ['personal', 'Personal'],
    ['basic', 'Basic Details'],
    ['office', 'Office Details'],
    ['tenure', 'Tenure Details'],
    ['bank', 'Bank Details'],
    ['qualification', 'Qualification Details'],
    ['experience', 'Experience Details'],
    ['reference', 'Reference'],
    ['family', 'Family Details'],
    ['documents', 'Documents'],
    ['access', 'Application Access'],
    ['kra', 'KRA']
  ]

  const visibleTabs = showAllTabs
    ? tabs
    : tabs.filter(([key]) => key === 'personal')

  /*----------------HELPERS----------------
   */

  const nameAndCityFields = [
    'FIRST_NAME',
    'MIDDLE_NAME',
    'LAST_NAME',
    'CURRENT_CITY',
    'PERMANENT_CITY'
  ]

  const numericFields = [
    'CURRENT_PINCODE',
    'PERMANENT_PINCODE',
    'TELEPHONE',
    'MOBILE_NUMBER',
    'EMERGENCY_CONTACT'
  ]

  const emailFields = ['PERSONAL_EMAIL', 'COMPANY_EMAIL']

  const handleFieldChange = (name, value) => {
    let updatedValue = value

    if (nameAndCityFields.includes(name)) {
      updatedValue = value.replace(/[^A-Za-z\s]/g, '').slice(0, 15)
    }

    if (numericFields.includes(name)) {
      updatedValue = value.replace(/\D/g, '')
    }

    if (name === 'MOBILE_NUMBER') {
      updatedValue = value.replace(/\D/g, '').slice(0, 10)
    }

    if (emailFields.includes(name)) {
      if (updatedValue && !updatedValue.includes('@')) {
        setFieldErrors(prev => ({
          ...prev,
          [name]: 'Email must contain @'
        }))
      } else {
        setFieldErrors(prev => ({
          ...prev,
          [name]: ''
        }))
      }
    }

    setEmployeeData(prev => ({
      ...prev,
      [name]: updatedValue
    }))
  }

  const inputClass = 'form-control'

  const selectStyles = {
    control: provided => ({
      ...provided,
      minHeight: '38px',
      height: '38px',
      borderColor: '#ced4da',
      borderRadius: '4px',
      boxShadow: 'none',
      fontSize: '14px'
    }),

    valueContainer: provided => ({
      ...provided,
      height: '38px',
      padding: '0 12px'
    }),

    indicatorsContainer: provided => ({
      ...provided,
      height: '38px'
    }),

    placeholder: provided => ({
      ...provided,
      color: '#6c757d',
      fontSize: '14px'
    }),

    singleValue: provided => ({
      ...provided,
      fontSize: '14px'
    }),

    input: provided => ({
      ...provided,
      fontSize: '14px'
    }),

    option: provided => ({
      ...provided,
      fontSize: '14px'
    })
  }

  const titleOptions = useMemo(
  () =>
    (masters.titles || [])
      .map(item => ({
        value: String(item.VALUE ?? item.value ?? ''),
        label: item.LABEL ?? item.label ?? ''
      }))
      .filter(item => item.value && item.label),
  [masters.titles]
)

  const genderOptions = useMemo(
    () =>
      (masters.genders || [])
        .map(item => ({
          value: String(item.VALUE ?? item.value ?? ''),
          label: item.LABEL ?? item.label ?? ''
        }))
        .filter(item => item.value && item.label),
    [masters.genders]
  )

  const bloodGroupOptions = useMemo(
    () =>
      (masters.bloodGroups || [])
        .map(item => ({
          value: String(item.VALUE ?? item.value ?? ''),
          label: item.LABEL ?? item.label ?? ''
        }))
        .filter(item => item.value && item.label),
    [masters.bloodGroups]
  )

  const countryOptions = useMemo(
    () =>
      (masters.countries || [])
        .map(item => ({
          value: String(item.VALUE ?? item.value ?? ''),
          label: (item.LABEL ?? item.label ?? '').trim()
        }))
        .filter(item => item.value && item.label),
    [masters.countries]
  )

  const stateOptions = useMemo(
    () =>
      (masters.states || [])
        .map(item => ({
          value: String(item.VALUE ?? item.value ?? ''),
          label: (item.LABEL ?? item.label ?? '').trim()
        }))
        .filter(item => item.value && item.label),
    [masters.states]
  )

  const companyOptions = useMemo(
    () =>
      (masters.companies || [])
        .map(item => ({
          value: String(item.VALUE ?? item.value ?? ''),
          label: (item.LABEL ?? item.label ?? '').trim()
        }))
        .filter(item => item.value && item.label),
    [masters.companies]
  )

  const formatDateForInput = value => {
    if (!value) return ''

    // Already in YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return value
    }

    // Convert DD-MMM-YY to YYYY-MM-DD
    const months = {
      JAN: '01',
      FEB: '02',
      MAR: '03',
      APR: '04',
      MAY: '05',
      JUN: '06',
      JUL: '07',
      AUG: '08',
      SEP: '09',
      OCT: '10',
      NOV: '11',
      DEC: '12'
    }

    const match = String(value)
      .toUpperCase()
      .match(/^(\d{2})-([A-Z]{3})-(\d{2})$/)

    if (!match) return ''

    const [, day, month, year] = match

    // Assuming 50-99 = 1950-1999 and 00-49 = 2000-2049
    const fullYear = Number(year) >= 50 ? `19${year}` : `20${year}`

    return `${fullYear}-${months[month]}-${day}`
  }

  const handleEmployeeChange = async option => {
    if (!option) {
      setSelectedEmployeeId('')
      setEmployeeData({})
      return
    }

    const employeeId = option.value

    setSelectedEmployeeId(employeeId)

    try {
      setLoading(true)

      const response = await getEmployeeById(employeeId)

      if (response?.status) {
        const employee = response.data?.employee || {}

        console.log('Selected employee data:', employee)

        setShowAllTabs(true)
        setActiveTab('personal')

        setEmployeeData({
          ID: employee.ID || '',
          EMP_CODE: employee.EMP_CODE || '',

          TITLE: employee.TITLE || '',
          FIRST_NAME: employee.FNAME || '',
          MIDDLE_NAME: employee.MNAME || '',
          LAST_NAME: employee.LNAME || '',

          CURRENT_ADDRESS: employee.ADDRESS || '',
          CURRENT_CITY: employee.CITY || '',
          CURRENT_STATE: employee.STATE || '',
          CURRENT_PINCODE: employee.PINCODE || '',
          CURRENT_COUNTRY: employee.COUNTRY || '',

          PERMANENT_ADDRESS: employee.PERMNT_ADDRESS || '',
          PERMANENT_CITY: employee.PERMNT_CITY || '',
          PERMANENT_STATE: employee.PERMNT_STATE || '',
          PERMANENT_PINCODE: employee.PERMNT_PINCODE || '',
          PERMANENT_COUNTRY: employee.PERMNT_COUNTRY || '',

          TELEPHONE: employee.PHONE || '',
          MOBILE_NUMBER: employee.CELL || '',

          PERSONAL_EMAIL: employee.PER_EMAIL || '',
          COMPANY_EMAIL: employee.COM_EMAIL || '',

          DATE_OF_BIRTH: formatDateForInput(employee.DOB),
          DATE_OF_JOINING: formatDateForInput(employee.DOJ),

          EMERGENCY_CONTACT: employee.TEL_NO_EMERG || '',

          GENDER: employee.GENDER || '',
          BLOOD_GROUP: employee.BLOOD_GRP || '',

          PROFILE_PHOTO: employee.PICS || '',

          COMPANY: employee.COMP_ID || '',

          STATUS: employee.STATUS || ''
        })
                setShowAllTabs(true)
        setActiveTab('personal')
      } else {
        console.error(response?.message || 'Unable to load employee details.')
        setEmployeeData({})
      }
    } catch (error) {
      console.error('Error loading employee details:', error)
      setEmployeeData({})
    } finally {
      setLoading(false)
    }
  }

  /*
   * -------------------RESET-------------------
   */

  const resetEmployee = () => {
    setSelectedEmployeeId('')
    setShowAllTabs(false)
    setActiveTab('personal')
    setEmployeeData(INITIAL_EMPLOYEE_DATA)
  }

  const loadEmployees = async () => {
    try {
      const response = await getEmployees()

      if (response?.status) {
        setEmployees(Array.isArray(response.data) ? response.data : [])
      } else {
        console.error(response?.message || 'Unable to load employees.')
        setEmployees([])
      }
    } catch (error) {
      console.error('Error loading employees:', error)
      setEmployees([])
    }
  }

  const loadEmployeeMasters = async () => {
    try {
      const response = await getEmployeeMasters()

      console.log('Employee Masters API response:', response)

      if (response?.status) {
        setMasters(response.data || {})
      } else {
        console.error(response?.message || 'Unable to load employee masters.')
      }
    } catch (error) {
      console.error('Error loading employee masters:', error)
    }
  }

  useEffect(() => {
    loadEmployees()
    loadEmployeeMasters()
  }, [])

  useEffect(() => {
    const loadMasters = async () => {
      try {
        const response = await getEmployeeMasters()

        console.log('Employee Masters response:', response)
      } catch (error) {
        console.error('Error loading employee masters:', error)
      }
    }

    loadMasters()
  }, [])

  console.log('TITLE from employee:', employeeData.TITLE)
console.log('Title options:', titleOptions)

  /*
   * ------------STYLES-------------
   */

  const styles = {
    page: {
      width: '100%',
      padding: '0 8px 20px'
    },

    header: {
      fontSize: '18px',
      fontWeight: '500',
      color: '#333',
      padding: '12px 24px',
      borderBottom: '1px solid #ddd',
      minHeight: '60px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },

    employeeSelect: {
      width: '380px'
    },

    card: {
      width: '100%',
      marginTop: '18px',
      border: '1px solid #ddd',
      background: '#fff'
    },

    tabsContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      background: '#126184',
      paddingLeft: '0'
    },

    tab: {
      padding: '10px 17px',
      color: '#fff',
      cursor: 'pointer',
      fontSize: '12px',
      border: 'none',
      background: 'transparent',
      whiteSpace: 'nowrap'
    },

    activeTab: {
      color: '#126184',
      background: '#fff',
      borderTop: '3px solid #126184'
    },

    content: {
      padding: '18px 18px 12px'
    },

    sectionTitle: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#126184',
      marginBottom: '15px',
      borderBottom: '1px solid #e5e5e5',
      paddingBottom: '8px'
    },

    label: {
      display: 'block',
      fontSize: '12px',
      fontWeight: '600',
      color: '#222',
      marginBottom: '6px'
    },

    required: {
      color: '#dc3545'
    },

    field: {
      marginBottom: '15px'
    },

    textarea: {
      minHeight: '80px',
      resize: 'vertical'
    },

    checkboxLabel: {
      fontSize: '12px',
      fontWeight: '600',
      marginLeft: '7px',
      verticalAlign: 'middle'
    }
  }

  /*
   * -------------------------------------------------------------
   * FIELD COMPONENTS
   * -------------------------------------------------------------
   */

  const renderInput = (name, label, options = {}) => {
    const {
      required = false,
      type = 'text',
      disabled = false,
      placeholder = ''
    } = options

    return (
      <div style={styles.field}>
        <label style={styles.label}>
          {label}
          {required && <span style={styles.required}>*</span>}
        </label>

        <input
          type={type}
          className={`${inputClass} ${fieldErrors[name] ? 'is-invalid' : ''}`}
          value={employeeData[name] || ''}
          disabled={disabled}
          placeholder={placeholder}
          maxLength={
            nameAndCityFields.includes(name)
              ? 15
              : name === 'MOBILE_NUMBER'
              ? 10
              : undefined
          }
          onChange={e => handleFieldChange(name, e.target.value)}
        />

        {fieldErrors[name] && (
          <div className='invalid-feedback' style={{ display: 'block' }}>
            {fieldErrors[name]}
          </div>
        )}
      </div>
    )
  }

  const renderSelect = (name, label, options, config = {}) => {
    const { required = false, placeholder = `Select ${label}` } = config

    return (
      <div style={styles.field}>
        <label style={styles.label}>
          {label}
          {required && <span style={styles.required}>*</span>}
        </label>

        <Select
          options={options}
          value={
            options.find(
              option =>
                String(option.value) === String(employeeData[name] || '')
            ) || null
          }
          onChange={option => handleFieldChange(name, option?.value || '')}
          placeholder={placeholder}
          isSearchable
          isClearable
          styles={selectStyles}
        />
      </div>
    )
  }

  const renderTextarea = (name, label, options = {}) => {
    const { required = false } = options

    return (
      <div style={styles.field}>
        <label style={styles.label}>
          {label}
          {required && <span style={styles.required}>*</span>}
        </label>

        <textarea
          className='form-control'
          value={employeeData[name] || ''}
          onChange={e => handleFieldChange(name, e.target.value)}
          style={styles.textarea}
        />
      </div>
    )
  }

  /*
   * -------------------------------------------------------------
   * PERSONAL TAB
   * -------------------------------------------------------------
   */

  const renderPersonalTab = () => (
    <div>
      <div style={styles.sectionTitle}>Personal Information</div>

      <div className='row'>
        {/* TITLE + FIRST NAME */}
        <div className='col-lg-4 col-md-6'>
          <div className='row'>
            <div className='col-3'>
              {renderSelect('TITLE', 'Title', titleOptions, { required: true })}
            </div>

            <div className='col-9'>
              {renderInput('FIRST_NAME', 'First Name', { required: true })}
            </div>
          </div>
        </div>

        {/* MIDDLE NAME */}
        <div className='col-lg-2 col-md-6'>
          {renderInput('MIDDLE_NAME', 'Middle Name', { required: true })}
        </div>

        {/* LAST NAME */}
        <div className='col-lg-2 col-md-6'>
          {renderInput('LAST_NAME', 'Last Name', { required: true })}
        </div>

        {/* DATE OF BIRTH */}
        <div className='col-lg-2 col-md-6'>
          {renderInput('DATE_OF_BIRTH', 'Date Of Birth', {
            required: true,
            type: 'date'
          })}
        </div>

        {/* PROFILE IMAGE */}
        <div className='col-lg-2 col-md-6'>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-start',
              paddingTop: '0'
            }}
          >
            <div
              style={{
                width: '105px',
                height: '105px',
                border: '2px solid #adb5bd',
                backgroundColor: '#f1f1f1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}
            >
              {employeeData.PROFILE_IMAGE ? (
                <img
                  src={employeeData.PROFILE_IMAGE}
                  alt='Employee'
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <span
                  style={{
                    fontSize: '12px',
                    color: '#888'
                  }}
                >
                  No Photo
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CURRENT ADDRESS ROW */}
      <div className='row'>
        {/* CURRENT ADDRESS */}
        <div className='col-lg-4 col-md-6'>
          {renderTextarea('CURRENT_ADDRESS', 'Current Address', {
            required: true
          })}
        </div>

        {/* CURRENT CITY */}
        <div className='col-lg-2 col-md-6'>
          {renderInput('CURRENT_CITY', 'Current City', { required: true })}
        </div>

        {/* CURRENT STATE */}
        <div className='col-lg-2 col-md-6'>
          {renderSelect('CURRENT_STATE', 'Current State', stateOptions, {
            required: true
          })}
        </div>

        {/* CURRENT COUNTRY */}
        <div className='col-lg-2 col-md-6'>
          {renderSelect('CURRENT_COUNTRY', 'Current Country', countryOptions, {
            required: true
          })}
        </div>

        {/* CURRENT PINCODE */}
        <div className='col-lg-2 col-md-6'>
          {renderInput('CURRENT_PINCODE', 'Current Pincode', {
            required: true
          })}
        </div>
      </div>

      <div
        style={{
          marginBottom: '18px',
          marginTop: '-2px'
        }}
      >
        <input
          type='checkbox'
          checked={Boolean(employeeData.SAME_AS_CURRENT)}
          onChange={e => handleFieldChange('SAME_AS_CURRENT', e.target.checked)}
        />

        <label style={styles.checkboxLabel}>Same as Current Address</label>
      </div>

      <div className='row'>
        <div className='col-lg-4 col-md-6'>
          {renderTextarea('PERMANENT_ADDRESS', 'Permanent Address', {
            required: true
          })}
        </div>

        <div className='col-lg-2 col-md-6'>
          {renderInput('PERMANENT_CITY', 'Permanent City', { required: true })}
        </div>

        <div className='col-lg-2 col-md-6'>
          {renderSelect('PERMANENT_STATE', 'Permanent State', stateOptions, {
            required: true
          })}
        </div>

        <div className='col-lg-2 col-md-6'>
          {renderSelect(
            'PERMANENT_COUNTRY',
            'Permanent Country',
            countryOptions,
            {
              required: true
            }
          )}
        </div>

        <div className='col-lg-2 col-md-6'>
          {renderInput('PERMANENT_PINCODE', 'Permanent Pincode', {
            required: true
          })}
        </div>
      </div>

      <div className='row'>
        <div className='col-lg-2 col-md-4'>
          {renderInput('TELEPHONE', 'Telephone')}
        </div>

        <div className='col-lg-2 col-md-4'>
          {renderInput('MOBILE_NUMBER', 'Mobile Number', {
            required: true,
            maxLength: 10
          })}
        </div>

        <div className='col-lg-2 col-md-4'>
          {renderInput('EMERGENCY_CONTACT', 'Emergency Contact')}
        </div>

        <div className='col-lg-3 col-md-6'>
          {renderInput('PERSONAL_EMAIL', 'Personal Email-ID', {
            required: true
          })}
        </div>

        <div className='col-lg-3 col-md-6'>
          {renderInput('COMPANY_EMAIL', 'Company Email-ID')}
        </div>
      </div>

      <div className='row'>
        <div className='col-lg-4 col-md-6'>
          {renderSelect('COMPANY', 'Company', companyOptions, {
            required: true
          })}
        </div>

        <div className='col-lg-2 col-md-6'>
          {renderInput('DATE_OF_JOINING', 'Date Of Joining', {
            required: true,
            type: 'date'
          })}
        </div>

        <div className='col-lg-2 col-md-6'>
          {renderInput('DATE_OF_LEAVE', 'Date Of Leave', {
            type: 'date'
          })}
        </div>

        <div className='col-lg-2 col-md-6'>
          {renderSelect('GENDER', 'Gender', genderOptions, { required: true })}
        </div>

        <div className='col-lg-2 col-md-6'>
          {renderSelect('BLOOD_GROUP', 'Blood Group', bloodGroupOptions)}
        </div>
      </div>
    </div>
  )

  /*
   * -------------------------------------------------------------
   * BASIC DETAILS
   * -------------------------------------------------------------
   */

  const renderBasicDetailsTab = () => (
    <div>
      <div style={styles.sectionTitle}>Basic Details</div>

      <div className='row'>
        <div className='col-lg-4 col-md-6'>
          {renderInput('EMPLOYEE_CODE', 'Employee Code')}
        </div>

        <div className='col-lg-4 col-md-6'>
          {renderInput('EMPLOYEE_STATUS', 'Employee Status')}
        </div>

        <div className='col-lg-4 col-md-6'>
          {renderInput('MARITAL_STATUS', 'Marital Status')}
        </div>

        <div className='col-lg-4 col-md-6'>
          {renderInput('NATIONALITY', 'Nationality')}
        </div>

        <div className='col-lg-4 col-md-6'>
          {renderInput('RELIGION', 'Religion')}
        </div>

        <div className='col-lg-4 col-md-6'>
          {renderInput('AADHAAR_NO', 'Aadhaar No.')}
        </div>

        <div className='col-lg-4 col-md-6'>
          {renderInput('PAN_NO', 'PAN No.')}
        </div>
      </div>
    </div>
  )

  /*
   * -------------------------------------------------------------
   * OFFICE DETAILS
   * -------------------------------------------------------------
   */

  const renderOfficeDetailsTab = () => (
    <div>
      <div style={styles.sectionTitle}>Office Details</div>

      <div className='row'>
        <div className='col-lg-4 col-md-6'>
          {renderInput('DEPARTMENT', 'Department')}
        </div>

        <div className='col-lg-4 col-md-6'>
          {renderInput('DESIGNATION', 'Designation')}
        </div>

        <div className='col-lg-4 col-md-6'>
          {renderInput('DIVISION', 'Division')}
        </div>

        <div className='col-lg-4 col-md-6'>
          {renderInput('LOCATION', 'Location')}
        </div>

        <div className='col-lg-4 col-md-6'>
          {renderInput('REPORTING_MANAGER', 'Reporting Manager')}
        </div>

        <div className='col-lg-4 col-md-6'>
          {renderInput('EMPLOYMENT_TYPE', 'Employment Type')}
        </div>

        <div className='col-lg-4 col-md-6'>{renderInput('GRADE', 'Grade')}</div>

        <div className='col-lg-4 col-md-6'>{renderInput('LEVEL', 'Level')}</div>
      </div>
    </div>
  )

  /*
   * -------------------------------------------------------------
   * TENURE DETAILS
   * -------------------------------------------------------------
   */

  const renderTenureDetailsTab = () => (
    <div>
      <div style={styles.sectionTitle}>Tenure Details</div>

      <div className='row'>
        <div className='col-lg-4 col-md-6'>
          {renderInput('CONFIRMATION_DATE', 'Confirmation Date', {
            type: 'date'
          })}
        </div>

        <div className='col-lg-4 col-md-6'>
          {renderInput('PROBATION_PERIOD', 'Probation Period')}
        </div>

        <div className='col-lg-4 col-md-6'>
          {renderInput('RETIREMENT_DATE', 'Retirement Date', { type: 'date' })}
        </div>

        <div className='col-lg-4 col-md-6'>
          {renderInput('TOTAL_EXPERIENCE', 'Total Experience')}
        </div>

        <div className='col-lg-4 col-md-6'>
          {renderInput('PREVIOUS_EXPERIENCE', 'Previous Experience')}
        </div>
      </div>
    </div>
  )

  /*
   * -------------------------------------------------------------
   * BANK DETAILS
   * -------------------------------------------------------------
   */

  const renderBankDetailsTab = () => (
    <div>
      <div style={styles.sectionTitle}>Bank Details</div>

      <div className='row'>
        <div className='col-lg-4 col-md-6'>
          {renderInput('BANK_NAME', 'Bank Name')}
        </div>

        <div className='col-lg-4 col-md-6'>
          {renderInput('ACCOUNT_NUMBER', 'Account Number')}
        </div>

        <div className='col-lg-4 col-md-6'>
          {renderInput('IFSC_CODE', 'IFSC Code')}
        </div>

        <div className='col-lg-4 col-md-6'>
          {renderInput('BRANCH_NAME', 'Branch Name')}
        </div>

        <div className='col-lg-4 col-md-6'>
          {renderInput('ACCOUNT_TYPE', 'Account Type')}
        </div>
      </div>
    </div>
  )

  /*
   * -------------------------------------------------------------
   * QUALIFICATION DETAILS
   * -------------------------------------------------------------
   */

  const renderQualificationDetailsTab = () => (
    <div>
      <div style={styles.sectionTitle}>Qualification Details</div>

      <div className='row'>
        <div className='col-lg-4 col-md-6'>
          {renderInput('HIGHEST_QUALIFICATION', 'Highest Qualification')}
        </div>

        <div className='col-lg-4 col-md-6'>
          {renderInput('UNIVERSITY', 'University / Institute')}
        </div>

        <div className='col-lg-4 col-md-6'>
          {renderInput('SPECIALIZATION', 'Specialization')}
        </div>

        <div className='col-lg-4 col-md-6'>
          {renderInput('PASSING_YEAR', 'Passing Year')}
        </div>

        <div className='col-lg-4 col-md-6'>
          {renderInput('QUALIFICATION_GRADE', 'Grade / Percentage')}
        </div>
      </div>
    </div>
  )

  /*
   * -------------------------------------------------------------
   * EXPERIENCE DETAILS
   * -------------------------------------------------------------
   */

  const renderExperienceDetailsTab = () => (
    <div>
      <div style={styles.sectionTitle}>Experience Details</div>

      <div className='row'>
        <div className='col-lg-4 col-md-6'>
          {renderInput('PREVIOUS_COMPANY', 'Previous Company')}
        </div>

        <div className='col-lg-4 col-md-6'>
          {renderInput('PREVIOUS_DESIGNATION', 'Previous Designation')}
        </div>

        <div className='col-lg-2 col-md-6'>
          {renderInput('PREVIOUS_FROM_DATE', 'From Date', { type: 'date' })}
        </div>

        <div className='col-lg-2 col-md-6'>
          {renderInput('PREVIOUS_TO_DATE', 'To Date', { type: 'date' })}
        </div>

        <div className='col-12'>
          {renderTextarea('PREVIOUS_JOB_DESCRIPTION', 'Job Description')}
        </div>
      </div>
    </div>
  )

  /*
   * -------------------------------------------------------------
   * REFERENCE
   * -------------------------------------------------------------
   */

  const renderReferenceTab = () => (
    <div>
      <div style={styles.sectionTitle}>Reference Details</div>

      <div className='row'>
        <div className='col-lg-4 col-md-6'>
          {renderInput('REFERENCE_NAME', 'Reference Name')}
        </div>

        <div className='col-lg-4 col-md-6'>
          {renderInput('REFERENCE_RELATION', 'Relationship')}
        </div>

        <div className='col-lg-4 col-md-6'>
          {renderInput('REFERENCE_CONTACT', 'Contact Number')}
        </div>

        <div className='col-lg-4 col-md-6'>
          {renderInput('REFERENCE_EMAIL', 'Email')}
        </div>

        <div className='col-lg-8 col-md-6'>
          {renderTextarea('REFERENCE_ADDRESS', 'Address')}
        </div>
      </div>
    </div>
  )

  /*
   * -------------------------------------------------------------
   * FAMILY DETAILS
   * -------------------------------------------------------------
   */

  const renderFamilyDetailsTab = () => (
    <div>
      <div style={styles.sectionTitle}>Family Details</div>

      <div className='row'>
        <div className='col-lg-4 col-md-6'>
          {renderInput('FATHER_NAME', 'Father Name')}
        </div>

        <div className='col-lg-4 col-md-6'>
          {renderInput('MOTHER_NAME', 'Mother Name')}
        </div>

        <div className='col-lg-4 col-md-6'>
          {renderInput('SPOUSE_NAME', 'Spouse Name')}
        </div>

        <div className='col-lg-4 col-md-6'>
          {renderInput('SPOUSE_OCCUPATION', 'Spouse Occupation')}
        </div>

        <div className='col-lg-4 col-md-6'>
          {renderInput('CHILDREN', 'Children')}
        </div>

        <div className='col-lg-4 col-md-6'>
          {renderInput('FAMILY_CONTACT', 'Family Contact')}
        </div>
      </div>
    </div>
  )

  /*
   * -------------------------------------------------------------
   * DOCUMENTS
   * -------------------------------------------------------------
   */

  const renderDocumentsTab = () => (
    <div>
      <div style={styles.sectionTitle}>Documents</div>

      <div className='row'>
        <div className='col-lg-6 col-md-6'>
          {renderInput('PAN_DOCUMENT', 'PAN Document')}
        </div>

        <div className='col-lg-6 col-md-6'>
          {renderInput('AADHAAR_DOCUMENT', 'Aadhaar Document')}
        </div>

        <div className='col-lg-6 col-md-6'>
          {renderInput('RESUME_DOCUMENT', 'Resume')}
        </div>

        <div className='col-lg-6 col-md-6'>
          {renderInput('PHOTO_DOCUMENT', 'Photo')}
        </div>

        <div className='col-lg-6 col-md-6'>
          {renderInput('OTHER_DOCUMENT', 'Other Document')}
        </div>
      </div>
    </div>
  )

  /*
   * -------------------------------------------------------------
   * APPLICATION ACCESS
   * -------------------------------------------------------------
   */

  const renderApplicationAccessTab = () => (
    <div>
      <div style={styles.sectionTitle}>Application Access</div>

      <div className='row'>
        <div className='col-lg-4 col-md-6'>
          {renderInput('USERNAME', 'Username')}
        </div>

        <div className='col-lg-4 col-md-6'>
          {renderInput('ACCESS_ROLE', 'Access Role')}
        </div>

        <div className='col-lg-4 col-md-6'>
          {renderInput('ACCESS_STATUS', 'Access Status')}
        </div>
      </div>
    </div>
  )

  /*
   * -------------------------------------------------------------
   * KRA
   * -------------------------------------------------------------
   */

  const renderKRATab = () => (
    <div>
      <div style={styles.sectionTitle}>KRA</div>

      <div className='row'>
        <div className='col-lg-12'>{renderTextarea('KRA', 'KRA')}</div>
      </div>
    </div>
  )

  /*
   * -------------------------------------------------------------
   * TAB CONTENT
   * -------------------------------------------------------------
   */

  const renderTabContent = () => {
    switch (activeTab) {
      case 'personal':
        return renderPersonalTab()

      case 'basic':
        return renderBasicDetailsTab()

      case 'office':
        return renderOfficeDetailsTab()

      case 'tenure':
        return renderTenureDetailsTab()

      case 'bank':
        return renderBankDetailsTab()

      case 'qualification':
        return renderQualificationDetailsTab()

      case 'experience':
        return renderExperienceDetailsTab()

      case 'reference':
        return renderReferenceTab()

      case 'family':
        return renderFamilyDetailsTab()

      case 'documents':
        return renderDocumentsTab()

      case 'access':
        return renderApplicationAccessTab()

      case 'kra':
        return renderKRATab()

      default:
        return null
    }
  }

  /*
   * -------------------------------------------------------------
   * RENDER
   * -------------------------------------------------------------
   */

  return (
    <div style={styles.page}>
      {/* PAGE HEADER */}
      <div style={styles.header}>
        <div>Employee Information</div>

        <div style={styles.employeeSelect}>
          <Select
            options={employeeOptions}
            value={
              employeeOptions.find(
                option => String(option.value) === String(selectedEmployeeId)
              ) || null
            }
            onChange={handleEmployeeChange}
            placeholder='Select Employee'
            isSearchable
            isClearable
            isLoading={loading}
            styles={selectStyles}
          />
        </div>
      </div>

      {/* EMPLOYEE FORM */}
      <div style={styles.card}>
        {/* TABS */}
        <div style={styles.tabsContainer}>
          {visibleTabs.map(([key, label]) => {
            const isActive = activeTab === key

            return (
              <button
                key={key}
                type='button'
                onClick={() => setActiveTab(key)}
                style={{
                  ...styles.tab,
                  ...(isActive ? styles.activeTab : {})
                }}
              >
                {label}
              </button>
            )
          })}
        </div>

        {/* TAB CONTENT */}
        <div style={styles.content}>{renderTabContent()}</div>
      </div>
    </div>
  )
}

export default EmployeeData
