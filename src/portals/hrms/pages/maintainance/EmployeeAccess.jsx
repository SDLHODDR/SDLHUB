import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import SDLDataTable from '../../../../components/datatable/SDLDataTable'
import SDLSearch from '../../../../components/datatable/SDLSearch'
import BreadcrumbNav from '../../components/breadcrumb-nav/BreadcrumbNav'
import {
  notifySuccess,
  notifyError,
  notifyWarning,
  confirmAction
} from '../../../../services/alertService'
import {
  getEmployeeAccessEmployees,
  getEmployeeAccess,
  saveEmployeeAccess,
  disableEmployeeAccess
} from '../../services/employeeAccessService'
import { getPortalFromPath } from '../../../../config/portalConfig'
// import "../../assets/css/employeeAccess.css";
import SDLReactSelect from '../../../../components/SDLReactSelect'
import SDLReactMultiSelect from '../../../../components/SDLReactMultiSelect'
import SaveButton from '../../components/buttons/SaveButton'
import CancelButton from '../../components/buttons/CancelButton'

const EmployeeAccess = () => {
  /* ==========================================================
     PORTAL
  ========================================================== */

  const location = useLocation()

  const portal = getPortalFromPath(location.pathname)

  const portalHome = `/${portal.key}/dashboard`

  /* ==========================================================
     STATE
  ========================================================== */

  const [employees, setEmployees] = useState([])

  const [selectedEmployee, setSelectedEmployee] = useState(null)

  const [profileOptions, setProfileOptions] = useState([])

  const [selectedProfiles, setSelectedProfiles] = useState([])

  const [employeeProfiles, setEmployeeProfiles] = useState([])

  const [loadingEmployees, setLoadingEmployees] = useState(false)

  const [loadingAccess, setLoadingAccess] = useState(false)

  const [saving, setSaving] = useState(false)

  const [disablingId, setDisablingId] = useState(null)

  const [searchQuery, setSearchQuery] = useState('')

  /* ==========================================================
     LOAD EMPLOYEES
  ========================================================== */

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        setLoadingEmployees(true)

        const res = await getEmployeeAccessEmployees()

        if (res?.status) {
          setEmployees(Array.isArray(res.data) ? res.data : [])
        } else {
          notifyError(res?.message || 'Unable to load employees.')
        }
      } catch (error) {
        console.error('Load employees error:', error)

        notifyError(error?.message || 'Unable to load employees.')
      } finally {
        setLoadingEmployees(false)
      }
    }

    loadEmployees()
  }, [])

  /* ==========================================================
     LOAD EMPLOYEE ACCESS
  ========================================================== */

  const loadEmployeeAccess = async employee => {
    if (!employee) {
      setProfileOptions([])
      setSelectedProfiles([])
      setEmployeeProfiles([])
      return
    }

    try {
      setLoadingAccess(true)

      const res = await getEmployeeAccess(employee)

      if (res?.status) {
        const data = res.data || {}

        console.log('availableProfiles:', data.availableProfiles)
        console.log('ASSIGNED PROFILES:', data.assignedProfiles)

        const assignedProfiles = Array.isArray(data.assignedProfiles)
          ? data.assignedProfiles
          : []

        const assignedProfileIds = new Set(
          assignedProfiles.map(profile => String(profile.profileId))
        )

        const availableProfileOptions = Array.isArray(data.availableProfiles)
          ? data.availableProfiles
              .filter(profile => !assignedProfileIds.has(String(profile.id)))
              .map(profile => ({
                value: String(profile.id),
                label: profile.label ?? profile.profileDesc ?? ''
              }))
          : []

        setProfileOptions(availableProfileOptions)

        setEmployeeProfiles(assignedProfiles)

        /*
         * New profiles are selected by user,
         * therefore initially empty.
         */

        setSelectedProfiles([])
      } else {
        notifyError(res?.message || 'Unable to load employee access.')

        setProfileOptions([])
        setSelectedProfiles([])
        setEmployeeProfiles([])
      }
    } catch (error) {
      console.error('Load employee access error:', error)

      notifyError(error?.message || 'Unable to load employee access.')
    } finally {
      setLoadingAccess(false)
    }
  }

  /* ==========================================================
     EMPLOYEE CHANGE
  ========================================================== */

  const handleEmployeeChange = async employee => {
    setSelectedEmployee(employee || null)

    await loadEmployeeAccess(employee || null)
  }

  /* ==========================================================
     PROFILE CHANGE
  ========================================================== */

  const handleProfileChange = profiles => {
    setSelectedProfiles(profiles || [])
  }

  /* ==========================================================
     SAVE
  ========================================================== */

  const handleSave = async () => {
    if (!selectedEmployee) {
      notifyWarning('Please select an employee.')
      return
    }

    if (!selectedProfiles || selectedProfiles.length === 0) {
      notifyWarning('Please select at least one profile.')
      return
    }

    const confirmed = await confirmAction(
      'Save Employee Access?',
      'Are you sure you want to assign the selected profiles to this employee?'
    )

    if (!confirmed) {
      return
    }

    try {
      setSaving(true)

      const payload = {
        employee: String(selectedEmployee),

        profileIds: selectedProfiles.map(profile =>
          String(profile?.profileId ?? profile?.id ?? profile)
        )
      }

      console.log('Saving employee access:', payload)

      const res = await saveEmployeeAccess(payload)

      if (res?.status) {
        notifySuccess(res?.message || 'Employee access saved successfully.')

        /*
         * Reload employee data so:
         *
         * 1. newly assigned profiles disappear
         *    from MultiSelect
         *
         * 2. newly assigned profiles appear
         *    in DataTable
         */

        await loadEmployeeAccess(selectedEmployee)
      } else {
        notifyError(res?.message || 'Unable to save employee access.')
      }
    } catch (error) {
      console.error('Save employee access error:', error)

      notifyError(error?.message || 'Unable to save employee access.')
    } finally {
      setSaving(false)
    }
  }

  /* ==========================================================
     DISABLE
  ========================================================== */

  const handleDisable = async row => {
    const id = row?.id

    if (!id) {
      notifyError('Invalid access record.')
      return
    }

    const confirmed = await confirmAction(
      'Disable Profile Access?',
      `Are you sure you want to disable "${row.profile}" access?`
    )

    if (!confirmed) {
      return
    }

    try {
      setDisablingId(id)

      const res = await disableEmployeeAccess(id, String(selectedEmployee))

      if (res?.status) {
        notifySuccess(res?.message || 'Profile access disabled successfully.')

        setEmployeeProfiles(prevProfiles =>
          prevProfiles.map(profile =>
            profile.id === id
              ? {
                  ...profile,
                  active: false
                }
              : profile
          )
        )

        setSelectedProfiles([])
      } else {
        notifyError(res?.message || 'Unable to disable profile access.')
      }
    } catch (error) {
      console.error('Disable employee access error:', error)

      notifyError(error?.message || 'Unable to disable profile access.')
    } finally {
      setDisablingId(null)
    }
  }

  /* ==========================================================
     RESET
  ========================================================== */

  const handleReset = () => {
    setSelectedEmployee(null)
    setProfileOptions([])
    setSelectedProfiles([])
    setEmployeeProfiles([])
  }

  /* ==========================================================
     EMPLOYEE OPTIONS
  ========================================================== */

  const employeeOptions = useMemo(() => {
    return employees.map(employee => ({
      label: employee.label || `${employee.empCode} - ${employee.empName}`,

      value: String(employee.empCode || employee.id)
    }))
  }, [employees])

  /* ==========================================================
     PROFILE LABEL
  ========================================================== */

  const profileOptionTemplate = option => {
    return (
      <div className='employee-profile-option'>
        {option.label || option.profileDesc}
      </div>
    )
  }

  /* ==========================================================
   SEARCH FILTER
    ========================================================== */

  const filteredEmployeeProfiles = useMemo(() => {
    if (!searchQuery.trim()) {
      return employeeProfiles
    }

    const query = searchQuery.trim().toLowerCase()

    return employeeProfiles.filter(item => {
      return (
        String(item.employee ?? '')
          .toLowerCase()
          .includes(query) ||
        String(item.profile ?? '')
          .toLowerCase()
          .includes(query) ||
        String(item.effecFrom ?? '')
          .toLowerCase()
          .includes(query) ||
        String(item.effecTo ?? '')
          .toLowerCase()
          .includes(query)
      )
    })
  }, [searchQuery, employeeProfiles])

  /* ==========================================================
     TABLE COLUMNS
  ========================================================== */

  const profileColumns = useMemo(
    () => [
      {
        field: 'employee',
        header: 'Employee'
      },

      {
        field: 'profile',
        header: 'Profile'
      },

      {
        field: 'effecFrom',
        header: 'Effec From'
      },

      {
        field: 'effecTo',
        header: 'Effec To'
      },

      {
        field: 'action',
        header: 'Action',

        body: row => {
          if (!row.active) {
            return (
              <div className='d-flex align-items-center justify-content-center'
              style={{
                width: '32px',
                height: '32px',
                padding: 0
              }}>
                <span className='text-muted'>-</span>
              </div>
            )
          }

          return (
            <button
              type='button'
              className='btn btn-sm btn-outline-danger d-flex align-items-center justify-content-center'
              onClick={() => handleDisable(row)}
              disabled={disablingId === row.id}
              title='Disable Profile Access'
              aria-label='Disable Profile Access'
              style={{
                width: '32px',
                height: '32px',
                padding: 0
              }}
            >
              {disablingId === row.id ? (
                <span
                  className='spinner-border spinner-border-sm'
                  role='status'
                  aria-hidden='true'
                />
              ) : (
                <i className='ti ti-ban'></i>
              )}
            </button>
          )
        }
      }
    ],
    [disablingId]
  )

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <>
      {/* ======================================================
          PAGE HEADER
      ====================================================== */}

      <div className='page-header' style={{ marginBottom: '8px' }}>
        <div className='add-item d-flex'>
          <div className='page-title'>
            <h4>Employee Access</h4>
          </div>
        </div>

        <BreadcrumbNav
          items={[
            {
              text: 'Home',
              link: portalHome
            },

            {
              text: 'Employee Access'
            }
          ]}
        />
      </div>

      {/* ======================================================
          MAIN CARD
      ====================================================== */}
      <div className='row'>
        <div className='col-12 px-0'>
          <div className='card'>
            <div className='card-body'>
              {/* ==================================================
              FORM
          ================================================== */}

              <div className='row'>
                {/* ==================================================
                EMPLOYEE
            ================================================== */}

                <div className='col-md-4'>
                  <div className='form-group'>
                    <label className='form-label'>Employee</label>
                    <SDLReactSelect
                      value={selectedEmployee}
                      options={employeeOptions}
                      onChange={handleEmployeeChange}
                      placeholder='Select Employee'
                      isSearchable
                      isClearable
                      isDisabled={loadingEmployees || saving || loadingAccess}
                      isLoading={loadingEmployees}
                      width='100%'
                    />
                  </div>
                </div>

                {/* ==================================================
                PROFILE
            ================================================== */}

                <div className='col-md-8'>
                  <div className='form-group'>
                    <label className='form-label'>Profile</label>
                    <SDLReactMultiSelect
                      value={selectedProfiles}
                      options={profileOptions}
                      onChange={handleProfileChange}
                      placeholder={
                        selectedEmployee
                          ? 'Select Profile(s)'
                          : 'Select Employee First'
                      }
                      isClearable
                      isDisabled={!selectedEmployee || loadingAccess || saving}
                      width='100%'
                    />
                  </div>
                </div>
              </div>

              {/* ==================================================
              BUTTONS
          ================================================== */}

              <div className='d-flex justify-content-end gap-2 mt-3'>
                <SaveButton
                  onClick={handleSave}
                  disabled={
                    saving ||
                    loadingAccess ||
                    !selectedEmployee ||
                    selectedProfiles.length === 0
                  }
                  isSubmitting={saving}
                />

                <CancelButton
                  onClick={handleReset}
                  disabled={saving || loadingAccess}
                />
              </div>

              {/* ======================================================
                TABLE
            ====================================================== */}

              <div className='employee-access-table'>
                {/* ==================================================
                    TABLE SEARCH
                ================================================== */}

                <div className='d-flex align-items-center mb-4'>
                  <div style={{ width: '330px' }}>
                    <SDLSearch
                      value={searchQuery}
                      onChange={setSearchQuery}
                      placeholder='Search Profile Access...'
                    />
                  </div>
                </div>

                {/* ==================================================
                    DATA TABLE
                ================================================== */}

                <SDLDataTable
                  data={filteredEmployeeProfiles}
                  columns={profileColumns}
                  loading={loadingAccess}
                  emptyMessage={
                    selectedEmployee
                      ? 'No profile access found.'
                      : 'Select an employee to view profile access.'
                  }
                  paginator
                  rows={10}
                  className='employee-access-grid'
                  removableSort
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default EmployeeAccess
