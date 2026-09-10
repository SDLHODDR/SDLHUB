import React, { useMemo, useState, useEffect } from 'react'
import Select from 'react-select'
import {
  getEmployees,
  getEmployeeById,
  getEmployeeMasters
} from '../../services/employeeDataService'
import JDDataTable from '../../components/data-table/JDDataTable'

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
  AADHAAR_NO: '',
  PAN_NO: '',
  DRIVING_LICENSE_NO: '',
  PASSPORT_NO: '',
  ESI_NO: '',
  NATIONALITY: '',
  MARITAL_STATUS: '',
  DATE_OF_ANNIVERSARY: '',
  MOTHER_TONGUE: '',
  RELIGION: '',
  PF_NO: '',
  FPF_NO: '',
  PF_NOMINEE: '',
  MEMBER_ID: '',
  UAN_NO: '',
  RETIREMENT_AGE: '',
  GRATUITY_DATE: '',
  CITIZEN_NO: '',

  // Office Details
  DEPARTMENT: '',
  DESIGNATION: '',
  DIVISION: '',
  ORGANOGRAM: '',
  ORGANOGRAM_LOCATION: '',
  EFFECTIVE_FROM: '',
  EFFECTIVE_TO: '',
  LOCATION: '',
  REPORTING_MANAGER: '',
  EMPLOYMENT_TYPE: '',
  GRADE: '',
  LEVEL: '',

  // Tenure Details
  TENURE_EMPLOYEE_TYPE: '',
  TENURE_PERIOD: '',
  TENURE_EFFECTIVE_FROM: '',
  TENURE_EFFECTIVE_TO: '',
  TENURE_STATUS: '',
  TENURE_DETAILS: [],

  // Bank Details
  BANK_NAME: '',
  BANK_BRANCH: '',
  BANK_IFSC: '',
  BANK_ACNO: '',
  BANK_NOMINEE: '',
  BANK_STATUS: '',
  BANK_DETAILS: [],

  // Qualification Details
  QUALIFICATION_INSTITUTE: '',
  QUALIFICATION_COURSE: '',
  QUALIFICATION_GRADE: '',
  QUALIFICATION_START_DATE: '',
  QUALIFICATION_END_DATE: '',
  QUALIFICATION_REMARK: '',
  QUALIFICATION_DETAILS: [],

  // Experience Details
  PREVIOUS_COMPANY: '',
  PREVIOUS_DESIGNATION: '',
  PREVIOUS_FROM_DATE: '',
  PREVIOUS_TO_DATE: '',
  PREVIOUS_JOB_DESCRIPTION: '',
  PREVIOUS_GROSS_SALARY: '',
  PREVIOUS_LEAVE_REASON: '',
  EXPERIENCE_DETAILS: [],

  // Reference
  REFERENCE_DETAILS: [],

  // Family Details
  FAMILY_DETAILS: [],

  // Documents
  DOCUMENTS: [],

  // Application Access
  APPLICATION_ACCESS: [],

  // KRA
  KRA: []
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
  const [officeMasters, setOfficeMasters] = useState({
    departments: [],
    designations: [],
    divisions: [],
    organograms: [],
    organogramLocations: []
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

  const maritalStatusOptions = useMemo(
    () =>
      (masters.maritalStatuses || [])
        .map(item => ({
          value: String(item.VALUE ?? item.value ?? ''),
          label: item.LABEL ?? item.label ?? ''
        }))
        .filter(item => item.value && item.label),
    [masters.maritalStatuses]
  )

  const nationalityOptions = useMemo(
    () =>
      (masters.nationalities || [])
        .map(item => ({
          value: String(item.VALUE ?? item.value ?? ''),
          label: item.LABEL ?? item.label ?? ''
        }))
        .filter(item => item.value && item.label),
    [masters.nationalities]
  )

  const religionOptions = useMemo(
    () =>
      (masters.religions || [])
        .map(item => ({
          value: String(item.VALUE ?? item.value ?? ''),
          label: item.LABEL ?? item.label ?? ''
        }))
        .filter(item => item.value && item.label),
    [masters.religions]
  )

  const retirementAgeOptions = [
    { value: '55', label: '55' },
    { value: '58', label: '58' },
    { value: '60', label: '60' }
  ]

  const departmentOptions = useMemo(
    () =>
      (officeMasters.departments || [])
        .map(item => ({
          value: String(item.VALUE ?? item.value ?? ''),
          label: item.LABEL ?? item.label ?? ''
        }))
        .filter(item => item.value && item.label),
    [officeMasters.departments]
  )

  const designationOptions = useMemo(
    () =>
      (officeMasters.designations || [])
        .map(item => ({
          value: String(item.VALUE ?? item.value ?? ''),
          label: item.LABEL ?? item.label ?? ''
        }))
        .filter(item => item.value && item.label),
    [officeMasters.designations]
  )

  const divisionOptions = useMemo(
    () =>
      (officeMasters.divisions || [])
        .map(item => ({
          value: String(item.VALUE ?? item.value ?? ''),
          label: item.LABEL ?? item.label ?? ''
        }))
        .filter(item => item.value && item.label),
    [officeMasters.divisions]
  )

  const organogramOptions = useMemo(
    () =>
      (officeMasters.organograms || [])
        .map(item => ({
          value: String(item.VALUE ?? item.value ?? ''),
          label: item.LABEL ?? item.label ?? ''
        }))
        .filter(item => item.value && item.label),
    [officeMasters.organograms]
  )

  const organogramLocationOptions = useMemo(
    () =>
      (officeMasters.organogramLocations || [])
        .map(item => ({
          value: String(item.VALUE ?? item.value ?? ''),
          label: item.LABEL ?? item.label ?? ''
        }))
        .filter(item => item.value && item.label),
    [officeMasters.organogramLocations]
  )

  const employeeTypeOptions = useMemo(
    () =>
      (masters.employeeTypes || [])
        .map(item => ({
          value: String(item.VALUE ?? item.value ?? ''),
          label: item.LABEL ?? item.label ?? ''
        }))
        .filter(item => item.value && item.label),
    [masters.employeeTypes]
  )

  const tenureStatusOptions = [
    { value: 'A', label: 'Active' },
    { value: 'R', label: 'Resigned' }
  ]

  const bankStatusOptions = [
    { value: 'A', label: 'Active' },
    { value: 'I', label: 'In-Active' }
  ]

  // helper functions

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

  const formatDateForDisplay = value => {
    if (!value) return '-'

    const [year, month, day] = value.split('-')

    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec'
    ]

    return `${day}-${months[Number(month) - 1]}-${year}`
  }

  const getDocumentUrl = docPath => {
    if (!docPath) return '#'

    const baseUrl = import.meta.env.VITE_HRMS_DOC_BASE_URL || ''

    return `${baseUrl.replace(/\/$/, '')}/${docPath.replace(/^\//, '')}`
  }

  const getDocumentName = docPath => {
    if (!docPath) return '-'

    return docPath.split('/').pop() || '-'
  }

  const getDocumentIcon = docPath => {
    const extension = docPath?.split('.').pop()?.toLowerCase()

    if (extension === 'pdf') {
      return 'fas fa-file-pdf'
    }

    if (['png', 'jpg', 'jpeg', 'gif'].includes(extension)) {
      return 'fas fa-file-image'
    }

    if (['doc', 'docx'].includes(extension)) {
      return 'fas fa-file-word'
    }

    if (['xls', 'xlsx'].includes(extension)) {
      return 'fas fa-file-excel'
    }

    return 'fas fa-file'
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
        const officeDetails = response.data?.officeDetails || []
        const tenureDetails = response.data?.tenure || []
        const currentTenure = tenureDetails[0] || {}
        const reportsTo = response.data?.reportsTo?.[0] || {}
        const reportsToName = [reportsTo.FNAME, reportsTo.LNAME]
          .filter(value => value && value !== '.')
          .join(' ')
        const currentOffice = officeDetails[0] || {}
        const bankDetails = response.data?.banks || []
        const currentBank = bankDetails[0] || {}
        const qualificationDetails = response.data?.education || []
        const currentQualification = qualificationDetails[0] || {}
        const experienceDetails = response.data?.experience || []
        const currentExperience = experienceDetails[0] || {}
        const referenceDetails = response.data?.references || []
        const familyDetails = response.data?.family || []
        const documentDetails = response.data?.documents || []
        const applicationAccess = response.data?.userAccess || []
        const kraDetails = response.data?.kra || []

        console.log('Selected employee data:', employee)

        setShowAllTabs(true)
        setActiveTab('personal')

        setOfficeMasters({
          departments: response.data?.officeMasters?.departments || [],
          designations: response.data?.officeMasters?.designations || [],
          divisions: response.data?.officeMasters?.divisions || [],
          organograms: response.data?.officeMasters?.organograms || [],
          organogramLocations:
            response.data?.officeMasters?.organogramLocations || []
        })

        setEmployeeData({
          //Personal details
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
          STATUS: employee.STATUS || '',

          // Basic Details
          EMPLOYEE_CODE: employee.EMP_CODE || '',
          AADHAAR_NO: employee.ADHAR_NO || '',
          PAN_NO: employee.PAN_NO || '',
          DRIVING_LICENSE_NO: employee.DRIV_LICE_NO || '',
          PASSPORT_NO: employee.PASSPORT_NO || '',
          ESI_NO: employee.ESI_NO || '',
          NATIONALITY: employee.NATIONALITY || '',
          MARITAL_STATUS: employee.M_STATUS || '',
          DATE_OF_ANNIVERSARY: employee.DATE_OF_ANNIVERSARY || '',
          MOTHER_TONGUE: employee.MOTHER_LANG || '',
          RELIGION: employee.RELIGION || '',
          PF_NO: employee.PF_NO || '',
          FPF_NO: employee.FPF_NO || '',
          PF_NOMINEE: employee.PF_NOMINEE || '',
          MEMBER_ID: employee.MEMBER_ID || '',
          UAN_NO: employee.UAN_NO || '',
          RETIREMENT_AGE: employee.RETIRE_AGE || '',
          GRATUITY_DATE: formatDateForInput(employee.GRATUITY_DATE),
          CITIZEN_NO: employee.CITIZEN_NO || '',

          // Office Details
          DEPARTMENT: currentOffice.DEPT_ID || '',
          DESIGNATION: currentOffice.DESI_ID || '',
          DIVISION: currentOffice.DIVSN_ID || '',
          ORGANOGRAM: currentOffice.ORG_ID || '',
          ORGANOGRAM_LOCATION: currentOffice.ORG_LOC_ID || '',
          EFFECTIVE_FROM: formatDateForInput(currentOffice.EFFEC_FROM),
          EFFECTIVE_TO: formatDateForInput(currentOffice.EFFEC_TO),

          REPORTS_TO: reportsToName,
          OFFICE_DETAILS: officeDetails,

          // Tenure Details
          TENURE_EMPLOYEE_TYPE: currentTenure.ETYPE_ID || '',
          TENURE_PERIOD: currentTenure.ETYPE_PERIOD || '',
          TENURE_EFFECTIVE_FROM: formatDateForInput(currentTenure.EFF_FROM),
          TENURE_EFFECTIVE_TO: formatDateForInput(currentTenure.EFF_TO),
          TENURE_STATUS: currentTenure.EMP_STATUS || '',
          TENURE_DETAILS: tenureDetails,

          // Bank Details
          BANK_NAME: currentBank.BANK_NAME || '',
          BANK_BRANCH: currentBank.BANK_BRANCH || '',
          BANK_IFSC: currentBank.BANK_IFSC || '',
          BANK_ACNO: currentBank.BANK_ACNO || '',
          BANK_NOMINEE: currentBank.BANK_NOMINEE || '',
          BANK_STATUS: currentBank.STATUS || '',
          BANK_DETAILS: bankDetails,

          // Qualification Details
          QUALIFICATION_INSTITUTE: currentQualification.INST_NAME || '',
          QUALIFICATION_COURSE: currentQualification.COURSE || '',
          QUALIFICATION_GRADE: currentQualification.PERGRADE || '',
          QUALIFICATION_START_DATE: formatDateForInput(
            currentQualification.FROM_DATE
          ),
          QUALIFICATION_END_DATE: formatDateForInput(
            currentQualification.TO_DATE
          ),
          QUALIFICATION_REMARK: currentQualification.REMARKS || '',
          QUALIFICATION_DETAILS: qualificationDetails,

          // Experience Details
          PREVIOUS_COMPANY: currentExperience.ORG_NAME || '',
          PREVIOUS_DESIGNATION: currentExperience.DESIG || '',
          PREVIOUS_FROM_DATE: formatDateForInput(currentExperience.FROM_DATE),
          PREVIOUS_TO_DATE: formatDateForInput(currentExperience.TO_DATE),
          PREVIOUS_GROSS_SALARY: currentExperience.GROSS_SALARY || '',
          PREVIOUS_JOB_DESCRIPTION: currentExperience.DUTY_NATURE || '',
          PREVIOUS_LEAVE_REASON: currentExperience.LEAVE_REASON || '',
          EXPERIENCE_DETAILS: experienceDetails,

          // Reference Details
          REFERENCE_DETAILS: referenceDetails,

          // Family Details
          FAMILY_DETAILS: familyDetails,

          // Document Details
          DOCUMENTS: documentDetails,

          // Application Access
          APPLICATION_ACCESS: applicationAccess,

          // KRA Details
          KRA: kraDetails
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
      border: 'none',
      boxShadow: 'inset 0 3px 0 #126184'
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
    },

    tableWrapper: {
      width: '100%',
      marginTop: '10px',
      overflowX: 'auto'
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

      {/* EMPLOYEE CODE */}
      <div
        style={{
          fontSize: '12px',
          fontWeight: '600',
          marginBottom: '14px'
        }}
      >
        Employee Code: {employeeData.EMPLOYEE_CODE || '-'}
      </div>

      {/* ROW 1 */}
      <div className='row'>
        <div className='col-lg-2 col-md-4 col-sm-6'>
          {renderInput('AADHAAR_NO', 'AADHAAR No', {
            required: true
          })}
        </div>

        <div className='col-lg-2 col-md-4 col-sm-6'>
          {renderInput('PAN_NO', 'PAN No')}
        </div>

        <div className='col-lg-2 col-md-4 col-sm-6'>
          {renderInput('DRIVING_LICENSE_NO', 'Driving Licence No')}
        </div>

        <div className='col-lg-2 col-md-4 col-sm-6'>
          {renderInput('PASSPORT_NO', 'Passport No')}
        </div>

        <div className='col-lg-2 col-md-4 col-sm-6'>
          {renderInput('ESI_NO', 'ESI No')}
        </div>

        <div className='col-lg-2 col-md-4 col-sm-6'>
          {renderSelect('NATIONALITY', 'Nationality', nationalityOptions)}
        </div>
      </div>

      {/* ROW 2 */}
      <div className='row'>
        <div className='col-lg-2 col-md-4 col-sm-6'>
          {renderSelect(
            'MARITAL_STATUS',
            'Marital Status',
            maritalStatusOptions
          )}
        </div>

        <div className='col-lg-2 col-md-4 col-sm-6'>
          {renderInput('DATE_OF_ANNIVERSARY', 'Date Of Anniversary', {
            type: 'date'
          })}
        </div>

        <div className='col-lg-2 col-md-4 col-sm-6'>
          {renderInput('MOTHER_TONGUE', 'Mother Language')}
        </div>

        <div className='col-lg-2 col-md-4 col-sm-6'>
          {renderSelect('RELIGION', 'Religion', religionOptions)}
        </div>

        <div className='col-lg-2 col-md-4 col-sm-6'>
          {renderInput('PF_NO', 'PF No')}
        </div>

        <div className='col-lg-2 col-md-4 col-sm-6'>
          {renderInput('FPF_NO', 'FPF No')}
        </div>
      </div>

      {/* ROW 3 */}
      <div className='row'>
        <div className='col-lg-2 col-md-4 col-sm-6'>
          {renderInput('PF_NOMINEE', 'PF Nominee')}
        </div>

        <div className='col-lg-2 col-md-4 col-sm-6'>
          {renderInput('MEMBER_ID', 'Member ID')}
        </div>

        <div className='col-lg-2 col-md-4 col-sm-6'>
          {renderInput('UAN_NO', 'UAN No')}
        </div>

        <div className='col-lg-2 col-md-4 col-sm-6'>
          {renderSelect(
            'RETIREMENT_AGE',
            'Retirement Age',
            retirementAgeOptions
          )}
        </div>

        <div className='col-lg-2 col-md-4 col-sm-6'>
          {renderInput('GRATUITY_DATE', 'Gratuity Date', {
            type: 'date'
          })}
        </div>

        <div className='col-lg-2 col-md-4 col-sm-6'>
          {renderInput('CITIZEN_NO', 'Citizen No')}
        </div>
      </div>
    </div>
  )

  /*
   * -------------------------------------------------------------
   * OFFICE DETAILS
   * -------------------------------------------------------------
   */

  const getOptionLabel = (options, value) => {
    const option = options.find(item => String(item.value) === String(value))

    return option?.label || '-'
  }

  const renderOfficeDetailsTab = () => (
    <div>
      <div style={styles.sectionTitle}>Office Details</div>

      {/* Employee Code */}
      <div
        style={{ marginBottom: '15px', fontSize: '13px', fontWeight: '600' }}
      >
        Employee Code: {employeeData.EMP_CODE || '-'}
      </div>

      <div className='row'>
        {/* Division */}
        <div className='col-lg-4 col-md-6'>
          {renderSelect('DIVISION', 'Division', divisionOptions)}
        </div>

        {/* Department */}
        <div className='col-lg-4 col-md-6'>
          {renderSelect('DEPARTMENT', 'Department', departmentOptions)}
        </div>

        {/* Designation */}
        <div className='col-lg-4 col-md-6'>
          {renderSelect('DESIGNATION', 'Designation', designationOptions)}
        </div>

        {/* Organogram */}
        <div className='col-lg-6 col-md-6'>
          {renderSelect('ORGANOGRAM', 'Organogram', organogramOptions)}
        </div>

        {/* Organogram Location */}
        <div className='col-lg-6 col-md-6'>
          {renderSelect(
            'ORGANOGRAM_LOCATION',
            'Organogram Location',
            organogramLocationOptions
          )}
        </div>

        {/* Effective From */}
        <div className='col-lg-4 col-md-6'>
          {renderInput('EFFECTIVE_FROM', 'Effective From', { type: 'date' })}
        </div>

        {/* Effective To */}
        <div className='col-lg-4 col-md-6'>
          {renderInput('EFFECTIVE_TO', 'Effective To', { type: 'date' })}
        </div>
      </div>

      {/* Buttons */}
      {/* <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '2px',
        marginTop: '0px',
        marginBottom: '25px'
      }}
    >
      <button
        type='button'
        className='btn btn-primary btn-sm'
        style={{ backgroundColor: '#126184', borderColor: '#126184' }}
      >
        Save
      </button>

      <button
        type='button'
        className='btn btn-secondary btn-sm'
      >
        Cancel
      </button>
    </div> */}

      {/* Existing Office Details */}
      <div style={styles.tableWrapper}>
        <table className='table table-bordered table-sm mb-0'>
          <thead>
            <tr>
              <th>Organogram</th>
              <th>Organogram Location</th>
              <th>Effective From</th>
              <th>Effective To</th>
              <th>Reports To</th>
            </tr>
          </thead>

          <tbody>
            {(employeeData.OFFICE_DETAILS || []).length > 0 ? (
              employeeData.OFFICE_DETAILS.map((item, index) => (
                <tr key={item.ID || index}>
                  <td>{getOptionLabel(organogramOptions, item.ORG_ID)}</td>
                  <td>
                    {getOptionLabel(organogramLocationOptions, item.ORG_LOC_ID)}
                  </td>
                  <td>{formatDateForDisplay(item.EFFEC_FROM)}</td>
                  <td>{formatDateForDisplay(item.EFFEC_TO)}</td>
                  <td>{employeeData.REPORTS_TO || '-'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan='5' style={{ textAlign: 'center' }}>
                  No office details found
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
          {renderSelect('TENURE_STATUS', 'Status', tenureStatusOptions)}
        </div>

        <div className='col-lg-4 col-md-6'>
          {renderSelect(
            'TENURE_EMPLOYEE_TYPE',
            'Employee Type',
            employeeTypeOptions
          )}
        </div>

        <div className='col-lg-4 col-md-6'>
          {renderInput('TENURE_PERIOD', 'Period [In Months]')}
        </div>

        <div className='col-lg-4 col-md-6'>
          {renderInput('TENURE_EFFECTIVE_FROM', 'From Date', { type: 'date' })}
        </div>

        <div className='col-lg-4 col-md-6'>
          {renderInput('TENURE_EFFECTIVE_TO', 'To Date', { type: 'date' })}
        </div>
      </div>

      <JDDataTable
        data={employeeData.TENURE_DETAILS || []}
        columns={[
          {
            key: 'EMP_STATUS',
            label: 'Status',
            width: '15%',
            render: row =>
              tenureStatusOptions.find(
                option => option.value === String(row.EMP_STATUS)
              )?.label || '-'
          },
          {
            key: 'ETYPE_ID',
            label: 'Type',
            width: '20%',
            render: row =>
              employeeTypeOptions.find(
                option => option.value === String(row.ETYPE_ID)
              )?.label || '-'
          },
          {
            key: 'ETYPE_PERIOD',
            label: 'Period [In Months]',
            width: '20%',
            align: 'center',
            render: row => row.ETYPE_PERIOD || '-'
          },
          {
            key: 'EFF_FROM',
            label: 'From Date',
            width: '20%',
            align: 'center',
            render: row => formatDateForDisplay(row.EFF_FROM)
          },
          {
            key: 'EFF_TO',
            label: 'To Date',
            width: '20%',
            align: 'center',
            render: row => formatDateForDisplay(row.EFF_TO)
          }
        ]}
        showEdit={false}
        showDelete={false}
        emptyMessage='No tenure details found'
      />
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

      <div
        style={{ marginBottom: '15px', fontWeight: '600', fontSize: '14px' }}
      >
        Employee Code: {employeeData.EMP_CODE || '-'}
      </div>

      <div className='row'>
        <div className='col-lg-4 col-md-6'>
          {renderInput('BANK_NAME', 'Bank Name', { readOnly: true })}
        </div>

        <div className='col-lg-4 col-md-6'>
          {renderInput('BANK_BRANCH', 'Bank Branch', { readOnly: true })}
        </div>

        <div className='col-lg-4 col-md-6'>
          {renderInput('BANK_ACNO', 'Account Number', { readOnly: true })}
        </div>

        <div className='col-lg-4 col-md-6'>
          {renderInput('BANK_IFSC', 'IFSC', { readOnly: true })}
        </div>

        <div className='col-lg-4 col-md-6'>
          {renderInput('BANK_NOMINEE', 'Nominee Name', { readOnly: true })}
        </div>

        <div className='col-lg-4 col-md-6'>
          {renderSelect('BANK_STATUS', 'Status', bankStatusOptions)}
        </div>
      </div>

      <JDDataTable
        data={employeeData.BANK_DETAILS || []}
        columns={[
          {
            key: 'BANK_NAME',
            label: 'Bank Name',
            width: '20%'
          },
          {
            key: 'BANK_BRANCH',
            label: 'Branch',
            width: '17%'
          },
          {
            key: 'BANK_ACNO',
            label: 'Account Number',
            width: '17%'
          },
          {
            key: 'BANK_IFSC',
            label: 'IFSC',
            width: '17%'
          },
          {
            key: 'BANK_NOMINEE',
            label: 'Nominee',
            width: '17%'
          },
          {
            key: 'STATUS',
            label: 'Status',
            width: '12%',
            align: 'center',
            render: row =>
              bankStatusOptions.find(
                option => option.value === String(row.STATUS)
              )?.label || '-'
          }
        ]}
        showEdit={false}
        showDelete={false}
        emptyMessage='No bank details found'
      />
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

      <div
        style={{ marginBottom: '15px', fontWeight: '600', fontSize: '14px' }}
      >
        Employee Code: {employeeData.EMP_CODE || '-'}
      </div>

      <div className='row'>
        <div className='col-lg-4 col-md-6'>
          {renderInput('QUALIFICATION_INSTITUTE', 'Institute Name', {
            readOnly: true
          })}
        </div>

        <div className='col-lg-4 col-md-6'>
          {renderInput('QUALIFICATION_COURSE', 'Qualification', {
            readOnly: true
          })}
        </div>

        <div className='col-lg-4 col-md-6'>
          {renderInput('QUALIFICATION_GRADE', 'Grade/Percentage/CGPA', {
            readOnly: true
          })}
        </div>

        <div className='col-lg-4 col-md-6'>
          {renderInput('QUALIFICATION_START_DATE', 'Start Date', {
            type: 'date',
            readOnly: true
          })}
        </div>

        <div className='col-lg-4 col-md-6'>
          {renderInput('QUALIFICATION_END_DATE', 'End Date', {
            type: 'date',
            readOnly: true
          })}
        </div>

        <div className='col-lg-4 col-md-6'>
          {renderInput('QUALIFICATION_REMARK', 'Remark', { readOnly: true })}
        </div>
      </div>

      <JDDataTable
        data={employeeData.QUALIFICATION_DETAILS || []}
        columns={[
          {
            key: 'INST_NAME',
            label: 'Institute/College Name',
            width: '20%'
          },
          {
            key: 'COURSE',
            label: 'Course Name',
            width: '18%'
          },
          {
            key: 'PERGRADE',
            label: 'Grade/Percentage/CGPA',
            width: '18%',
            align: 'center'
          },
          {
            key: 'FROM_DATE',
            label: 'Start Date',
            width: '15%',
            align: 'center',
            render: row => formatDateForDisplay(row.FROM_DATE)
          },
          {
            key: 'TO_DATE',
            label: 'End Date',
            width: '15%',
            align: 'center',
            render: row => formatDateForDisplay(row.TO_DATE)
          },
          {
            key: 'REMARKS',
            label: 'Remarks',
            width: '14%'
          }
        ]}
        showEdit={false}
        showDelete={false}
        emptyMessage='No qualification details found'
      />
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

      <div
        style={{ marginBottom: '15px', fontWeight: '600', fontSize: '14px' }}
      >
        Employee Code: {employeeData.EMP_CODE || '-'}
      </div>

      <div className='row'>
        <div className='col-lg-4 col-md-6'>
          {renderInput('PREVIOUS_COMPANY', 'Organization Name', {
            readOnly: true
          })}
        </div>

        <div className='col-lg-4 col-md-6'>
          {renderInput('PREVIOUS_DESIGNATION', 'Designation', {
            readOnly: true
          })}
        </div>

        <div className='col-lg-2 col-md-6'>
          {renderInput('PREVIOUS_FROM_DATE', 'Start Date', {
            type: 'date',
            readOnly: true
          })}
        </div>

        <div className='col-lg-2 col-md-6'>
          {renderInput('PREVIOUS_TO_DATE', 'End Date', {
            type: 'date',
            readOnly: true
          })}
        </div>

        <div className='col-lg-4 col-md-6'>
          {renderInput('PREVIOUS_GROSS_SALARY', 'Gross Salary', {
            readOnly: true
          })}
        </div>

        <div className='col-lg-4 col-md-6'>
          {renderInput('PREVIOUS_JOB_DESCRIPTION', 'Nature Of Duty', {
            readOnly: true
          })}
        </div>

        <div className='col-lg-4 col-md-6'>
          {renderInput('PREVIOUS_LEAVE_REASON', 'Leave Reason', {
            readOnly: true
          })}
        </div>
      </div>

      <JDDataTable
        data={employeeData.EXPERIENCE_DETAILS || []}
        columns={[
          {
            key: 'ORG_NAME',
            label: 'Organization Name',
            width: '16%'
          },
          {
            key: 'DESIG',
            label: 'Designation',
            width: '15%'
          },
          {
            key: 'FROM_DATE',
            label: 'Start Date',
            width: '11%',
            align: 'center',
            render: row => formatDateForDisplay(row.FROM_DATE)
          },
          {
            key: 'TO_DATE',
            label: 'End Date',
            width: '11%',
            align: 'center',
            render: row => formatDateForDisplay(row.TO_DATE)
          },
          {
            key: 'GROSS_SALARY',
            label: 'Gross Salary',
            width: '10%',
            align: 'center'
          },
          {
            key: 'DUTY_NATURE',
            label: 'Nature Of Duty',
            width: '19%'
          },
          {
            key: 'LEAVE_REASON',
            label: 'Leave Reason',
            width: '18%'
          }
        ]}
        showEdit={false}
        showDelete={false}
        emptyMessage='No experience details found'
      />
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

      <JDDataTable
        data={employeeData.REFERENCE_DETAILS || []}
        columns={[
          {
            key: 'REF_NAME',
            label: 'Reference Name',
            width: '16%'
          },
          {
            key: 'ADDRESS',
            label: 'Address',
            width: '18%'
          },
          {
            key: 'POSITION',
            label: 'Position',
            width: '12%'
          },
          {
            key: 'TEL',
            label: 'Telephone',
            width: '13%'
          },
          {
            key: 'YEAR_KNOWN',
            label: 'Yr. Known',
            width: '8%',
            align: 'center'
          },
          {
            key: 'STATUS',
            label: 'Status',
            width: '8%',
            align: 'center',
            render: row => {
              if (row.STATUS === 'N') return 'New'
              if (row.STATUS === 'A') return 'Active'
              if (row.STATUS === 'I') return 'In-Active'
              return row.STATUS || '-'
            }
          },
          {
            key: 'FERIFIC_TYPE',
            label: 'Verify Type',
            width: '9%'
          },
          {
            key: 'VERIFIC_MODE',
            label: 'Verify Mode',
            width: '9%'
          },
          {
            key: 'VERIFIC_REMARKS',
            label: 'Verify Remark',
            width: '12%'
          }
        ]}
        showEdit={false}
        showDelete={false}
        emptyMessage='No reference details found'
      />
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

      <JDDataTable
        data={employeeData.FAMILY_DETAILS || []}
        columns={[
          {
            key: 'FM_NAME',
            label: 'Name',
            width: '18%'
          },
          {
            key: 'FM_RELATION',
            label: 'Relationship',
            width: '14%'
          },
          {
            key: 'DOB',
            label: 'DOB',
            width: '12%',
            align: 'center',
            render: row => formatDateForDisplay(row.DOB)
          },
          {
            key: 'AADHAAR',
            label: 'Aadhaar',
            width: '14%'
          },
          {
            key: 'FM_OCCUPATION',
            label: 'Occupation',
            width: '17%'
          },
          {
            key: 'FM_DEP',
            label: 'Dependent',
            width: '13%'
          },
          {
            key: 'FM_CONTACT',
            label: 'Contact Number',
            width: '12%'
          }
        ]}
        showEdit={false}
        showDelete={false}
        emptyMessage='No family details found'
      />
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

      <div
        style={{ marginBottom: '15px', fontWeight: '600', fontSize: '14px' }}
      >
        Employee Code: {employeeData.EMP_CODE || '-'}
      </div>

      <div className='row'>
        {(employeeData.DOCUMENTS || []).length > 0 ? (
          employeeData.DOCUMENTS.map(document => (
            <div
              key={document.ID}
              className='col-lg-6 col-md-6'
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '20px'
              }}
            >
              <i
                className={`${getDocumentIcon(document.DOC_PATH)} mr-3`}
                style={{
                  fontSize: '18px',
                  width: '25px'
                }}
              />

              <a
                href={getDocumentUrl(document.DOC_PATH)}
                target='_blank'
                rel='noopener noreferrer'
                style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#17365d',
                  textDecoration: 'none'
                }}
              >
                {getDocumentName(document.DOC_PATH)}
              </a>
            </div>
          ))
        ) : (
          <div className='col-12'>
            <div
              style={{
                textAlign: 'center',
                padding: '20px',
                color: '#6c757d'
              }}
            >
              No documents found
            </div>
          </div>
        )}
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

      <div
        style={{ marginBottom: '15px', fontWeight: '600', fontSize: '14px' }}
      >
        Employee Code: {employeeData.EMP_CODE || '-'}
      </div>

      <div className='row'>
        {(employeeData.APPLICATION_ACCESS || []).length > 0 ? (
          employeeData.APPLICATION_ACCESS.map(app => (
            <div
              key={app.ID}
              className='col-lg-3 col-md-6'
              style={{ marginBottom: '15px' }}
            >
              <div className='form-check'>
                <input
                  type='checkbox'
                  className='form-check-input'
                  checked={app.HAS_ACCESS === 'Y'}
                  readOnly
                  id={`app-${app.ID}`}
                />

                <label
                  className='form-check-label'
                  htmlFor={`app-${app.ID}`}
                  style={{
                    fontWeight: '600',
                    fontSize: '14px'
                  }}
                >
                  {app.APP}
                </label>
              </div>
            </div>
          ))
        ) : (
          <div className='col-12'>
            <div
              style={{
                textAlign: 'center',
                padding: '20px',
                color: '#6c757d'
              }}
            >
              No application access found
            </div>
          </div>
        )}
      </div>
    </div>
  )

  /*
   * -------------------------------------------------------------
   * KRA
   * -------------------------------------------------------------
   */

  const renderKRATab = () => {
    const kraData = employeeData.KRA || []

    const kraColumns = [
      {
        key: 'NO',
        label: 'No',
        width: '8%',
        align: 'center',
        render: (row, index) => index + 1
      },
      {
        key: 'KRA_DESC',
        label: 'KRA Details',
        width: '52%'
      },
      {
        key: 'RESP_PERC',
        label: 'Percentage',
        width: '20%',
        align: 'center',
        render: row =>
          row.RESP_PERC !== null &&
          row.RESP_PERC !== undefined &&
          row.RESP_PERC !== ''
            ? `${row.RESP_PERC}%`
            : '-'
      }
    ]

    const totalPercentage = kraData.reduce(
      (total, row) => total + (Number(row.RESP_PERC) || 0),
      0
    )

    return (
      <div>
        <div style={styles.sectionTitle}>KRA</div>

        <JDDataTable
          data={kraData}
          columns={kraColumns}
          emptyMessage='No KRA details found'
        />

        {kraData.length > 0 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginTop: '10px',
              fontWeight: '600',
              fontSize: '14px'
            }}
          >
            Total Percentage: {totalPercentage}%
          </div>
        )}
      </div>
    )
  }

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
