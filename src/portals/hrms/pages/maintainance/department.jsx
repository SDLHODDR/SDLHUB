import { useMemo, useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
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
} from '../../../../shared/services/alertService'
import BreadcrumbNav from '../../../../shared/components/BreadcrumbNav'
import { getPortalFromPath } from '../../../../shared/config/portalConfig'
import SDLSearch from '../../../../shared/components/datatable/SDLSearch'
import SDLDataTable from '../../../../shared/components/datatable/SDLDataTable'
import SaveButton from '../../../../shared/components/buttons/SaveButton'
import EditButton from '../../../../shared/components/buttons/EditButton'
import CancelButton from '../../../../shared/components/buttons/CancelButton'
import SDLReactSelect from '../../../../shared/components/form/SDLReactSelect'
import SDLInput from '../../../../shared/components/form/SDLInput'
import ViewToggleButton from '../../../../shared/components/buttons/ViewToggleButton'
import { validateFields, validateText } from '../../../../shared/validation'
import { handleError } from '../../../../shared/services/errorHandler'
import SDLPageLoader from '../../../../shared/components/SDLPageLoader'

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

  const location = useLocation()
  const portal = getPortalFromPath(location.pathname)
  const portalHome = `/${portal.key}/dashboard`

  const [loading, setLoading] = useState(false)
  // true until the department list has loaded (so "No data found" is not shown before it)
  const [listLoading, setListLoading] = useState(true)
  const [listDepartmentMasterData, setListDepartmentMasterData] = useState([])
  const [searchQuery, setSearchQuery] = useState('')

  const [showAll, setShowAll] = useState(false)
  const [selectedDept, setSelectedDept] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [accountOptions, setAccountOptions] = useState([])
  const [costCenterOptions, setCostCenterOptions] = useState([])

  const TOP_CONTROL_WIDTH = '330px'

  const fetchDepartmentMasterData = async () => {
    try {
      const response = await getDepartmentMasterData()
      const normalizedData = normalizeRecords(response)
      setListDepartmentMasterData(normalizedData)
    } catch (error) {
      handleError(error, { context: 'Load departments', fallback: 'Unable to load departments.' })
    } finally {
      setListLoading(false)
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

        const accounts =
          accountsResponse?.data?.accounts || accountsResponse?.accounts || []

        const costCenters =
          costCentersResponse?.data?.costCenters ||
          costCentersResponse?.costCenters ||
          []

        setAccountOptions(accounts)
        setCostCenterOptions(costCenters)
      } catch (error) {
        handleError(error, {
          context: 'Load account codes / cost centers',
          fallback: 'Unable to load account codes and cost centers.'
        })
      }
    }

    fetchAccountAndCostCenterData()
  }, [])

  const accountDescriptionMap = useMemo(() => {
    return Object.fromEntries(
      accountOptions.map(item => [String(item.ACCT_CODE), item.DESCR])
    )
  }, [accountOptions])

  const costCenterDescriptionMap = useMemo(() => {
    return Object.fromEntries(
      costCenterOptions.map(item => [String(item.CCTR_CODE), item.DESCR])
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

          ACCT_CODE: getDisplayValue(item, ['ACCT_CODE', 'acct_code'], '-'),

          ACCT_DESC:
            accountDescriptionMap[
              String(getDisplayValue(item, ['ACCT_CODE', 'acct_code'], ''))
            ] || '-',

          CCTR_CODE: getDisplayValue(item, ['CCTR_CODE', 'cctr_code'], '-'),

          CCTR_DESC:
            costCenterDescriptionMap[
              String(getDisplayValue(item, ['CCTR_CODE', 'cctr_code'], ''))
            ] || '-',

          SHORT_CODE: getDisplayValue(item, ['SHORT_CODE', 'short_code'], '-')
        }
      })
    } catch (error) {
      // building table rows; log only (no popup from inside render)
      handleError(error, { context: 'Build department rows', notify: false })
      return []
    }
  }, [
    listDepartmentMasterData,
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

    const deptCode = String(formData.DEPT_CODE || '').trim()
    const shortCode = String(formData.SHORT_CODE || '').trim()
    const deptDesc = String(formData.DEPT_DESC || '').trim()

    // Department Code
    const errors = validateFields(
      { DEPT_CODE: deptCode, SHORT_CODE: shortCode, DEPT_DESC: deptDesc },
      {
        DEPT_CODE: [validateText, { label: 'Department Code', required: true, allow: 'digits', max: 5 }],
        SHORT_CODE: [validateText, { label: 'Short Code', allow: 'letters', max: 5 }],
        DEPT_DESC: [validateText, { label: 'Department Name', required: true, allow: 'alphanumeric', spaces: true, extra: '&/', max: 20 }]
      }
    )
    Object.assign(newErrors, errors)

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
        setShowAll(true)
      } else {
        notifyError(response?.message || 'Unable to save Department')
      }
    } catch (err) {
      handleError(err, { context: 'Save department', fallback: 'Something went wrong while saving data.' })
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
    } catch (err) {
      handleError(err, { context: 'Delete department', fallback: 'Unable to delete record.' })
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
        <EditButton
          onClick={() => handleEditDept(row)}
          ariaLabel='Edit Department'
        />
      )
    }
  ]

  return (
    <>
      <div className='page-header' style={{ marginBottom: '8px' }}>
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
        <div className='col-12 px-0'>
          <div className='card'>
            <div className='card-body'>
              <div className='d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3'>
                <div className='d-flex align-items-center gap-2 flex-wrap'>
                  {showAll && (
                    <div
                      style={{
                        width: '330px',
                        minWidth: '330px',
                        maxWidth: '330px',
                        flexShrink: 0
                      }}
                    >
                      <SDLSearch
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder='Search Department...'
                        className='mb-0'
                      />
                    </div>
                  )}
                </div>

                <div className='d-flex align-items-center gap-2'>
                  <SDLReactSelect
                    value={selectedDept}
                    options={listData.map(item => ({
                      value: item.ID,
                      label: `${item.DEPT_CODE} - ${item.DEPT_DESC}`
                    }))}
                    onChange={handleSelectDept}
                    placeholder='Select Department'
                    isDisabled={loading}
                    width='330px'
                  />

                  <ViewToggleButton
                    showAll={showAll}
                    onClick={() => setShowAll(prev => !prev)}
                    disabled={loading}
                  />
                </div>
              </div>

              {!showAll ? (
                <>
                  <div className='row g-3'>
                    {/* Department Code */}
                    <div className='col-lg-4 col-md-4'>
                      <SDLInput
                        label='Department Code'
                        required
                        value={formData.DEPT_CODE}
                        onChange={e =>
                          handleFieldChange('DEPT_CODE', e.target.value)
                        }
                        error={errors.DEPT_CODE}
                      />
                    </div>

                    {/* Short Code */}
                    <div className='col-lg-4 col-md-4'>
                      <SDLInput
                        label='Short Code'
                        value={formData.SHORT_CODE}
                        onChange={e =>
                          handleFieldChange('SHORT_CODE', e.target.value)
                        }
                          error={errors.SHORT_CODE}
                      />
                    </div>

                    {/* Department Name */}
                    <div className='col-lg-4 col-md-4'>
                      <SDLInput
                        label='Department Name'
                        required
                        value={formData.DEPT_DESC}
                        onChange={e =>
                          handleFieldChange('DEPT_DESC', e.target.value)
                        }
                        error={errors.DEPT_DESC}
                      />
                    </div>

                    {/* Account Name */}
                    <div className='col-lg-4 col-md-4'>
                      <div className='mb-3'>
                        <label className='form-label'>Account Name</label>

                        <SDLReactSelect
                          value={formData.ACCT_CODE}
                          options={accountOptions.map(item => ({
                            value: item.ACCT_CODE || item.value,
                            label: `${item.ACCT_CODE} - ${item.DESCR}`
                          }))}
                          onChange={value =>
                            handleFieldChange('ACCT_CODE', value)
                          }
                          placeholder='Select Account'
                        />
                      </div>
                    </div>

                    {/* Cost Center */}
                    <div className='col-lg-4 col-md-4'>
                      <div className='mb-3'>
                        <label className='form-label'>Cost Center</label>

                        <SDLReactSelect
                          value={formData.CCTR_CODE}
                          options={costCenterOptions.map(item => ({
                            value: item.CCTR_CODE || item.value,
                            label: `${item.CCTR_CODE} - ${item.DESCR}`
                          }))}
                          onChange={value =>
                            handleFieldChange('CCTR_CODE', value)
                          }
                          placeholder='Select Cost Center'
                        />
                      </div>
                    </div>
                  </div>

                  <div className='text-end mb-3'>
                    <SaveButton
                      onClick={handleSave}
                      isSubmitting={isSubmitting}
                      isEditing={isEditing}
                      className='me-2'
                    />

                    <CancelButton onClick={resetForm} />
                  </div>
                </>
              ) : (
                <>
                  {listLoading ? (
                    <SDLPageLoader />
                  ) : listData.length === 0 ? (
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
