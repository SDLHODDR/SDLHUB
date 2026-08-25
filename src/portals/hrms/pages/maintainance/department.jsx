import { useMemo, useState, useEffect, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
// NOTE: hrmsDepartmentSlice may not exist in all installs. Use dynamic import to avoid module-not-found errors.
// TODO: create/verify departmentService with these methods (or adjust import paths)
import {
  getDepartmentMasterData,
  saveDepartment,
  deleteDepartment,
  getAccountCodes,
  getCostCenters
} from '../../services/departmentService'
import {
  notifySuccess,
  notifyError,
  confirmAction
} from '../../../../services/alertService'
import BreadcrumbNav from '../../components/breadcrumb-nav/BreadcrumbNav'
import { getPortalFromPath } from '../../../../config/portalConfig'
import SDLSearch from '../../../../components/datatable/SDLSearch'
import SDLDataTable from '../../../../components/datatable/SDLDataTable'
import { Dropdown } from 'primereact/dropdown'

const normalizeRecords = payload => {
  if (Array.isArray(payload)) return payload

  if (payload && typeof payload === 'object') {
    for (const key of [
      'data',
      'records',
      'result',
      'items',
      'list',
      'rows',
      'departments',
      'department'
    ]) {
      if (Array.isArray(payload[key])) return payload[key]

      if (payload[key] && typeof payload[key] === 'object') {
        for (const subKey of [
          'data',
          'records',
          'result',
          'items',
          'list',
          'rows',
          'departments',
          'department'
        ]) {
          if (Array.isArray(payload[key][subKey])) return payload[key][subKey]
        }
      }
    }
  }

  return []
}

const getDisplayValue = (item, keys, fallback = '-') => {
  if (!item || typeof item !== 'object') return fallback

  for (const key of keys) {
    const value = item[key]
    if (value !== undefined && value !== null && value !== '') {
      return value
    }
  }

  return fallback
}

const Department = () => {
  const dispatch = useDispatch()

  const location = useLocation()
  const portal = getPortalFromPath(location.pathname)
  const portalHome = `/${portal.key}/dashboard`

  const [loading, setLoading] = useState(false)
  const [listDepartmentMasterData, setListDepartmentMasterData] = useState([])
  const [searchQuery, setSearchQuery] = useState('')

  // department data from redux (slice name may vary) - adjust selector if needed
  const departmentData = useSelector(state => state.hrmsDepartmentData?.data)

  const [showAll, setShowAll] = useState(false)
  const [selectedDept, setSelectedDept] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [accountOptions, setAccountOptions] = useState([])
  const [costCenterOptions, setCostCenterOptions] = useState([])

  const refreshDepartmentData = useCallback(async () => {
    try {
      const slicePath = '../../../../store/hrms/hrmsDepartmentSlice'
      const mod = await import(/* @vite-ignore */ slicePath)
      if (mod && mod.getDepartmentDataResponse) {
        dispatch(mod.getDepartmentDataResponse())
      }
    } catch {
      // slice not available - ignore
    }
  }, [dispatch])

  useEffect(() => {
    // attempt to refresh via redux slice if present; safe no-op otherwise
    refreshDepartmentData()
  }, [refreshDepartmentData])

  const fetchDepartmentMasterData = async () => {
    try {
      const response = await getDepartmentMasterData()
      const normalizedData = normalizeRecords(response)
      setListDepartmentMasterData(normalizedData)
    } catch (error) {
      console.error('REFRESH DEPARTMENT ERROR:', error)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDepartmentMasterData()
  }, [])

  useEffect(() => {
    const fetchAccountAndCostCenterData = async () => {
      try {
        const [accountsResponse, costCentersResponse] = await Promise.all([
          getAccountCodes(),
          getCostCenters()
        ])

        console.log('========== ACCOUNTS ==========')
        console.log(accountsResponse)

        console.log('========== COST CENTERS ==========')
        console.log(costCentersResponse)
        // setAccountOptions(normalizeRecords(accountsResponse))
        // setCostCenterOptions(normalizeRecords(costCentersResponse))

        const accounts =
          accountsResponse?.data?.accounts || accountsResponse?.accounts || []

        const costCenters =
          costCentersResponse?.data?.costCenters ||
          costCentersResponse?.costCenters ||
          []

        setAccountOptions(accounts)
        setCostCenterOptions(costCenters)
      } catch (error) {
        console.error('Error loading account/cost center data:', error)
      }
    }

    fetchAccountAndCostCenterData()
  }, [])

  // const accountDescriptionMap = useMemo(
  //   () =>
  //     Object.fromEntries(
  //       accountOptions.map(option => [option.ACCT_CODE, option.DESCR])
  //     ),
  //   [accountOptions]
  // )

  // const costCenterDescriptionMap = useMemo(
  //   () =>
  //     Object.fromEntries(
  //       costCenterOptions.map(option => [option.CCTR_CODE, option.DESCR])
  //     ),
  //   [costCenterOptions]
  // )

  const accountDescriptionMap = useMemo(() => {
  return Object.fromEntries(
    accountOptions.map(item => [
      String(item.ACCT_CODE),
      item.DESCR
    ])
  )
}, [accountOptions])

const costCenterDescriptionMap = useMemo(() => {
  return Object.fromEntries(
    costCenterOptions.map(item => [
      String(item.CCTR_CODE),
      item.DESCR
    ])
  )
}, [costCenterOptions])

  const listData = useMemo(() => {
    try {
      const records = normalizeRecords(listDepartmentMasterData)

      return records.map(item => {
        const acctCode = getDisplayValue(item, ['ACCT_CODE', 'acct_code'], '')

        const cctrCode = getDisplayValue(item, ['CCTR_CODE', 'cctr_code'], '')
        return {
          ID: item.ID ?? item.id ?? item.DEPT_CODE ?? item.dept_code,

          DEPT_ID: item.DEPT_ID ?? item.dept_id ?? '',

          DEPT_DESC: getDisplayValue(
            item,
            ['DEPT_DESC', 'dept_desc', 'description', 'name'],
            '-'
          ),

          DEPT_CODE: getDisplayValue(
            item,
            ['DEPT_CODE', 'dept_code', 'code'],
            '-'
          ),

          // ACCT_CODE: getDisplayValue(item, ['ACCT_CODE', 'acct_code'], '-'),

          // CCTR_CODE: getDisplayValue(item, ['CCTR_CODE', 'cctr_code'], '-'),

          ACCT_CODE: getDisplayValue(
  item,
  ['ACCT_CODE', 'acct_code'],
  '-'
),

ACCT_DESC:
  accountDescriptionMap[
    String(
      getDisplayValue(item, ['ACCT_CODE', 'acct_code'], '')
    )
  ] || '-',

CCTR_CODE: getDisplayValue(
  item,
  ['CCTR_CODE', 'cctr_code'],
  '-'
),

CCTR_DESC:
  costCenterDescriptionMap[
    String(
      getDisplayValue(item, ['CCTR_CODE', 'cctr_code'], '')
    )
  ] || '-',
          // ACCT_CODE: acctCode,

// ACCT_DESC: accountDescriptionMap[acctCode] || '-',

// CCTR_CODE: cctrCode,

// CCTR_DESC: costCenterDescriptionMap[cctrCode] || '-',

          SHORT_CODE: getDisplayValue(item, ['SHORT_CODE', 'short_code'], '-')
        }
      })
    } catch (error) {
      console.error(error)
      return []
    }
  }, [listDepartmentMasterData, 
    accountDescriptionMap,
  costCenterDescriptionMap
])

  /* ================= SEARCH FILTER ================= */
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return listData

    const query = searchQuery.trim().toLowerCase()

    return listData.filter(
      item =>
        item.DEPT_DESC.toLowerCase().includes(query) ||
        item.DEPT_CODE.toLowerCase().includes(query)
    )
  }, [searchQuery, listData])

  const [formData, setFormData] = useState({
    DEPT_ID: '',
    DEPT_DESC: '',
    DEPT_CODE: '',
    ACCT_CODE: '',
    CCTR_CODE: '',
    SHORT_CODE: ''
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const handleFieldChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    setErrors(prev => ({
      ...prev,
      [name]: ''
    }))
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.DEPT_CODE || String(formData.DEPT_CODE).trim() === '') {
      newErrors.DEPT_CODE = 'Department Code is required'
    } else if (String(formData.DEPT_CODE).trim().length > 5) {
      newErrors.DEPT_CODE = 'Department Code cannot exceed 5 characters'
    }

    if (String(formData.SHORT_CODE).trim().length > 5) {
      newErrors.SHORT_CODE = 'Short Code cannot exceed 5 characters'
    }

    if (!formData.DEPT_DESC || String(formData.DEPT_DESC).trim() === '') {
      newErrors.DEPT_DESC = 'Department Description is required'
    } else if (String(formData.DEPT_DESC).trim().length > 20) {
      newErrors.DEPT_DESC = 'Department Description cannot exceed 20 characters'
    }

    setErrors(newErrors)

    return Object.keys(newErrors).length === 0
  }

  const handleSave = async e => {
    e && e.preventDefault && e.preventDefault()

    const isValid = validateForm()
    if (!isValid) return

    setIsSubmitting(true)

    try {
      const payload = {
        ...formData
      }

      const response = await saveDepartment(payload)

      if (response?.status) {
        notifySuccess(response?.message || 'Department saved successfully.')
        resetForm()
        // refresh list
        await fetchDepartmentMasterData() // <-- refresh from API

        void refreshDepartmentData()
        setShowAll(true)
      } else {
        notifyError(response?.message || 'Unable to save Department')
      }
    } catch (err) {
      console.error('Save Error:', err)
      notifyError('Something went wrong while saving data.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setIsEditing(false)
    setSelectedDept('')
    setFormData({
      DEPT_ID: '',
      DEPT_DESC: '',
      DEPT_CODE: '',
      ACCT_CODE: '',
      CCTR_CODE: '',
      SHORT_CODE: ''
    })
  }

  const handleSelectDept = value => {
    setSelectedDept(value)

    if (!value) {
      resetForm()
      return
    }

    setShowAll(false)

    const dept = listData.find(item => String(item.ID) === String(value))

    if (dept) {
      setIsEditing(true)
      setFormData({
        DEPT_ID: dept.DEPT_ID || '',
        DEPT_DESC: dept.DEPT_DESC || '',
        DEPT_CODE: dept.DEPT_CODE || '',
        ACCT_CODE: dept.ACCT_CODE || '',
        CCTR_CODE: dept.CCTR_CODE || '',
        SHORT_CODE: dept.SHORT_CODE || ''
      })
    }
  }

  const handleEditDept = dept => {
    setSelectedDept(dept.ID)
    setIsEditing(true)
    setShowAll(false)
    setFormData({
      DEPT_ID: dept.DEPT_ID || '',
      DEPT_DESC: dept.DEPT_DESC || '',
      DEPT_CODE: dept.DEPT_CODE || '',
      ACCT_CODE: dept.ACCT_CODE || '',
      CCTR_CODE: dept.CCTR_CODE || '',
      SHORT_CODE: dept.SHORT_CODE || ''
    })
  }

  const handleDeleteDept = async row => {
    try {
      const result = await confirmAction('Are you sure you want to Delete?')
      if (!result?.isConfirmed) return
      setDeletingId(row.ID)

      const payload = {
        ID: row.ID
      }

      const response = await deleteDepartment(payload)

      if (response?.status) {
        notifySuccess(response?.message || 'Record deleted successfully.')
      } else {
        notifyError(response?.message || 'Unable to delete record.')
      }

      // refresh list
      await fetchDepartmentMasterData()
      void refreshDepartmentData()
    } catch (err) {
      console.error(err)
    } finally {
      setDeletingId(null)
    }
  }

  const serialBody = (rowData, options) =>
    options.rowIndex + 1 + (options.props.first || 0)

  // const titleBody = row => <>{row.DEPT_NAME}</>
  const titleBody = row => <>{row.DEPT_DESC}</>

  const columns = [
    {
      field: 'DEPT_CODE',
      header: 'Dept Code',
      sortable: true,
      style: {
        width: '180px'
      }
    },
    {
      field: 'SHORT_CODE',
      header: 'Short Code',
      sortable: true,
      style: {
        width: '180px'
      }
    },
    {
      field: 'DEPT_DESC',
      header: 'Name',
      body: titleBody,
      sortable: true,
      style: {
        width: '260px'
      }
    },
    {
      field: 'ACCT_DESC',
      // field: 'ACCT_CODE',
      header: 'Account Description',
      sortable: true,
      style: {
        width: '220px'
      }
    },
    {
      field: 'CCTR_DESC',
      // field: 'CCTR_CODE',
      header: 'Cost Center',
      sortable: true,
      style: {
        width: '180px'
      }
    },
    {
      header: 'Action',
      body: row => (
        <div className='d-flex align-items-center justify-content-center'>
          <button
            type='button'
            className='btn btn-sm btn-outline-primary d-flex align-items-center justify-content-center'
            onClick={() => handleEditDept(row)}
            aria-label='Edit Department'
          >
            <i className='ti ti-edit' />
          </button>
        </div>
      ),
      style: {
        width: '100px',
        textAlign: 'center'
      }
    }
  ]

  return (
    <>
      <div className='page-header'>
        <div className='add-item d-flex'>
          <div className='page-title'>
            <h4>Department</h4>
          </div>
        </div>

        <BreadcrumbNav
          items={[
            {
              text: 'Home',
              link: portalHome
            },
            {
              text: 'Department'
            }
          ]}
        />
      </div>

      <div className='row'>
        <div className='col-12'>
          <div className='card'>
            <div className='card-body'>
              <div className='d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3'>
                <div className='d-flex align-items-center gap-2 flex-wrap'>
                  {showAll && (
                    <div
                      className='d-flex align-items-center'
                      style={{ minWidth: '260px' }}
                    >
                      <SDLSearch
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder='Search Department...'
                        className='mb-0'
                        style={{ width: '100%' }}
                      />
                    </div>
                  )}
                </div>

                <div className='d-flex align-items-center gap-2'>
                  {/* <select
                    className='form-select'
                    value={selectedDept}
                    onChange={e => handleSelectDept(e.target.value)}
                    style={{ minWidth: '200px' }}
                    disabled={loading}
                  >
                    <option value=''>Select Department</option>
                    {listData.map(item => (
                      <option key={item.ID} value={item.ID}>
                        {item.DEPT_DESC}
                      </option>
                    ))}
                  </select> */}
                  <Dropdown
                    value={selectedDept}
                    options={listData.map(item => ({
                      value: item.ID,
                      label: `${item.DEPT_CODE} - ${item.DEPT_DESC}`
                    }))}
                    onChange={e => handleSelectDept(e.value)}
                    placeholder='Select Department'
                    className='w-100'
                    filter
                    filterBy='label'
                    showClear
                    disabled={loading}
                    emptyMessage='No departments found'
                    emptyFilterMessage='No departments found'
                  />
                  <button
                    type='button'
                    className='btn btn-outline-secondary d-flex align-items-center gap-2'
                    onClick={() => setShowAll(prev => !prev)}
                    // style={{ minWidth: '120px' }}
                  >
                    <i className={`fas ${showAll ? 'fa-edit' : 'fa-table'}`} />
                    {/* {showAll ? 'Form' : 'Table'} */}
                  </button>
                </div>
              </div>

              {!showAll ? (
                <>
                  <div className='row'>
                    {/* Department Code */}
                    <div className='col-lg-4 col-md-4'>
                      <div className='mb-3'>
                        <label className='form-label'>
                          Department Code
                          <span className='text-danger ms-1'>*</span>
                        </label>

                        <input
                          type='text'
                          className={`form-control ${
                            errors.DEPT_CODE ? 'is-invalid' : ''
                          }`}
                          value={formData.DEPT_CODE}
                          maxLength={5}
                          onChange={e =>
                            handleFieldChange('DEPT_CODE', e.target.value)
                          }
                        />

                        {errors.DEPT_CODE && (
                          <div className='invalid-feedback'>
                            {errors.DEPT_CODE}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Short Code */}
                    <div className='col-lg-4 col-md-4'>
                      <div className='mb-3'>
                        <label className='form-label'>Short Code</label>

                        <input
                          type='text'
                          className='form-control'
                          value={formData.SHORT_CODE}
                          onChange={e =>
                            handleFieldChange('SHORT_CODE', e.target.value)
                          }
                        />
                      </div>
                    </div>

                    {/* Department Name */}
                    <div className='col-lg-4 col-md-4'>
                      <div className='mb-3'>
                        <label className='form-label'>
                          Department Name
                          <span className='text-danger ms-1'>*</span>
                        </label>

                        <input
                          type='text'
                          className={`form-control ${
                            errors.DEPT_DESC ? 'is-invalid' : ''
                          }`}
                          value={formData.DEPT_DESC}
                          onChange={e =>
                            handleFieldChange('DEPT_DESC', e.target.value)
                          }
                        />

                        {errors.DEPT_DESC && (
                          <div className='invalid-feedback'>
                            {errors.DEPT_DESC}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Account Name */}
                    <div className='col-lg-4 col-md-4'>
                      <div className='mb-3'>
                        <label className='form-label'>
                          Account Name
                        </label>

                        <select
                          className='form-select'
                          value={formData.ACCT_CODE}
                          onChange={e =>
                            handleFieldChange('ACCT_CODE', e.target.value)
                          }
                        >
                          <option value=''>Select Account</option>

                          {accountOptions.map(item => (
                            <option
                              key={item.ACCT_CODE || item.value}
                              value={item.ACCT_CODE || item.value}
                            >
                              {/* {item.DESCR || item.label || item.ACCT_CODE} */}
                              {item.ACCT_CODE} - {item.DESCR}
                            </option>
                          ))}
                        </select>
                        {/* <Dropdown
                          value={formData.ACCT_CODE}
                          options={accountOptions.map(item => ({
                            value: item.ACCT_CODE,
                            label: item.DESCR
                          }))}
                          onChange={e =>
                            handleFieldChange('ACCT_CODE', e.value)
                          }
                          placeholder='Select Account'
                          className='w-100'
                          filter
                          filterBy='label'
                          showClear
                          emptyMessage='No accounts found'
                          emptyFilterMessage='No accounts found'
                        /> */}
                      </div>
                    </div>

                    {/* Cost Center */}
                    <div className='col-lg-4 col-md-4'>
                      <div className='mb-3'>
                        <label className='form-label'>Cost Center</label>

                        <select
                          className='form-select'
                          value={formData.CCTR_CODE}
                          onChange={e =>
                            handleFieldChange('CCTR_CODE', e.target.value)
                          }
                        >
                          <option value=''>Select Cost Center</option>

                          {costCenterOptions.map(item => (
                            <option
                              key={item.CCTR_CODE || item.value}
                              value={item.CCTR_CODE || item.value}
                            >
                              {/* {item.DESCR || item.label || item.CCTR_CODE} */}
                              {item.CCTR_CODE} - {item.DESCR}
                            </option>
                          ))}
                        </select>
                        {/* <Dropdown
                          value={formData.CCTR_CODE}
                          options={costCenterOptions.map(item => ({
                            value: item.CCTR_CODE,
                            label: item.DESCR
                          }))}
                          onChange={e =>
                            handleFieldChange('CCTR_CODE', e.value)
                          }
                          placeholder='Select Cost Center'
                          className='w-100'
                          filter
                          filterBy='label'
                          showClear
                          emptyMessage='No cost centers found'
                          emptyFilterMessage='No cost centers found'
                        /> */}
                      </div>
                    </div>
                  </div>

                  <div className='text-end mb-3'>
                    <button
                      type='button'
                      className='btn btn-primary me-2'
                      onClick={handleSave}
                      disabled={isSubmitting}
                    >
                      {isSubmitting
                        ? 'Processing...'
                        : isEditing
                        ? 'Update'
                        : 'Save'}
                    </button>
                    <button
                      type='button'
                      className='btn btn-secondary'
                      onClick={resetForm}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {listData.length === 0 ? (
                    <div className='p-4 text-center text-muted'>
                      No data found
                    </div>
                  ) : (
                    <div className='table-responsive'>
                      <SDLDataTable
                        data={filteredData}
                        columns={columns}
                        loading={false}
                        emptyMessage='No data found'
                        className='department-grid'
                        removableSort
                        tableStyle={{ minWidth: '650px' }}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Department
