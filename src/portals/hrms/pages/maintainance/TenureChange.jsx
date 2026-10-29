import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useDispatch } from 'react-redux'

import SDLDataTable from '../../../../components/datatable/SDLDataTable'
import SDLSearch from '../../../../components/datatable/SDLSearch'
import BreadcrumbNav from '../../components/breadcrumb-nav/BreadcrumbNav'
import { getPortalFromPath } from '../../../../config/portalConfig'
import {
  confirmAction,
  notifyError,
  notifySuccess,
  notifyWarning
} from '../../../../services/alertService'
import { getHRMSAuthroizationTaskCount } from '../../../../store/hrms/hrmsAuthorizationCountSlice'
//import { demoTenureEmployees } from "./tenureChangeDemoData";
import {
  getTenureChangeDetails,
  getTenureChangeList,
  sendTenureChangeForAuth
} from '../../services/tenureChangeService'
import '../../assets/css/tenureChange.css'

const TenureChange = () => {
  const dispatch = useDispatch()
  const location = useLocation()
  const portal = getPortalFromPath(location.pathname)

  const [search, setSearch] = useState('')
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [sendingEmployeeCode, setSendingEmployeeCode] = useState(null)

  useEffect(() => {
    let mounted = true

    const loadEmployees = async () => {
      setLoading(true)

      try {
        const response = await getTenureChangeList()

        if (!mounted) return

        if (response?.status) {
          setEmployees(Array.isArray(response.data) ? response.data : [])
        } else {
          setEmployees([])
          notifyError(
            response?.message || 'Unable to load upcoming tenure changes.'
          )
        }
      } catch (error) {
        if (!mounted) return

        setEmployees([])
        notifyError(
          error?.message || 'Unable to load upcoming tenure changes.'
        )
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadEmployees()

    return () => {
      mounted = false
    }
  }, [])

  const visibleEmployees = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) return employees

    return employees.filter(employee =>
      [
        employee.empCode,
        employee.empName,
        employee.designation,
        employee.location,
        employee.empType,
        employee.approvalText
      ].some(value =>
        String(value ?? '')
          .toLowerCase()
          .includes(query)
      )
    )
  }, [employees, search])

  const handleSend = async employee => {
    const employeeCode = String(employee?.empCode ?? '').trim()

    if (!employeeCode) {
      notifyError('Employee code is not available.')
      return
    }

    // Support either the nested manager object or the flat API fields.
    const managerCandidates = [
      employee?.manager?.manager_code,
      employee?.mgr_code,
      employee?.manager?.empCode
    ]
    const rawManagerCode = managerCandidates.find(value => {
      const code = String(value ?? '').trim().toLowerCase()
      return code !== '' && code !== 'vacant' && code !== '-'
    })
    const managerCode = String(rawManagerCode ?? '').trim()
    const managerName = String(
      employee?.manager?.empName ?? employee?.managerName ?? ''
    ).trim()

    if (!managerCode || ['vacant', '-'].includes(managerCode.toLowerCase())) {
      notifyError('Manager code is not available for this employee.')
      return
    }

    // Prevent duplicate submissions for the same employee.
    if (sendingEmployeeCode !== null) return

    let confirmation

    try {
      confirmation = await confirmAction(
        'Send tenure change for authorization?',
        `This will generate a task for ${
          managerName || 'the assigned manager'
        }.`,
        {
          confirmButtonClass: 'tenure-confirm-yes',
          cancelButtonClass: 'tenure-confirm-cancel'
        }
      )
    } catch (error) {
      notifyError(error?.message || 'Unable to open the confirmation dialog.')
      return
    }

    // This assumes confirmAction resolves to true when the user confirms.
    // If your alertService returns a SweetAlert result object, check
    // confirmation.isConfirmed instead.
    if (!confirmation) return

    setSendingEmployeeCode(employeeCode)

    try {
      const response = await sendTenureChangeForAuth(
        employeeCode,
        managerCode
      )

      if (response?.status) {
        setEmployees(currentEmployees =>
          currentEmployees.filter(
            currentEmployee =>
              String(currentEmployee?.empCode ?? '').trim() !== employeeCode
          )
        )

        dispatch(getHRMSAuthroizationTaskCount())

        notifySuccess(
          response.message || 'Tenure change sent for authorization.'
        )
      } else {
        notifyError(
          response?.message ||
            'Unable to send tenure change for authorization.'
        )
      }
    } catch (error) {
      console.error('Send tenure change error:', error)
      notifyError(
        error?.message || 'Unable to send tenure change for authorization.'
      )
    } finally {
      setSendingEmployeeCode(null)
    }
  }

  const approvalLevelBody = employee => {
    if (
      Array.isArray(employee?.approvalLevels) &&
      employee.approvalLevels.length > 0
    ) {
      return (
        <div>
          {employee.approvalLevels.map((level, index) => {
            const levelNumber = level?.level ?? index + 1
            const levelName =
              String(level?.empName ?? '').trim() ||
              String(level?.empCode ?? '').trim() ||
              '-'

            return (
              <div key={`${levelNumber}-${level?.empCode ?? index}`}>
                {levelNumber}. {levelName}
              </div>
            )
          })}
        </div>
      )
    }

    return employee?.approvalText || '-'
  }

  const columns = [
    { field: 'company', header: 'Comp', style: { width: '5%' } },
    { field: 'empCode', header: 'Code', style: { width: '7%' } },
    { field: 'empName', header: 'Name', style: { width: '15%' } },
    { field: 'designation', header: 'Desi', style: { width: '14%' } },
    { field: 'location', header: 'Location', style: { width: '13%' } },
    { field: 'empType', header: 'Emp Type', style: { width: '10%' } },
    {
      field: 'doj',
      header: 'DOJ',
      style: { width: '12%', textAlign: 'center' }
    },
    {
      field: 'tenureDue',
      header: 'Tenure Due',
      style: { width: '12%', textAlign: 'center' }
    },
    {
      field: 'approvalText',
      header: 'Appraiser',
      body: approvalLevelBody,
      style: { width: '12%' }
    },
    {
      field: 'action',
      header: 'Action',
      style: { width: '6%', textAlign: 'center' },
      body: employee => {
        const employeeCode = String(employee?.empCode ?? '').trim()
        const isSending =
          sendingEmployeeCode !== null &&
          sendingEmployeeCode === employeeCode

        return (
          <button
            type="button"
            className="btn btn-icon btn-sm btn-outline-primary"
            aria-label="Send tenure change for authorization"
            title="Send tenure change for authorization"
            onClick={() => handleSend(employee)}
            disabled={sendingEmployeeCode !== null}
          >
            {isSending ? (
              <span
                className="spinner-border spinner-border-sm"
                role="status"
                aria-label="Sending"
              />
            ) : (
              <i className="ti ti-send" aria-hidden="true" />
            )}
          </button>
        )
      }
    }
  ]

  return (
    <>
      <div className="page-header" style={{ marginBottom: '8px' }}>
        <div className="add-item d-flex">
          <div className="page-title">
            <h4>Upcoming Employee Tenure Change</h4>
          </div>
        </div>

        <BreadcrumbNav
          items={[
            { text: 'Home', link: `/${portal?.key || 'hrms'}/dashboard` },
            { text: 'Tenure Change' }
          ]}
        />
      </div>

      <div className="row">
        <div className="col-12 px-0">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
                <div
                  style={{
                    width: '330px',
                    minWidth: 'min(330px, 100%)',
                    maxWidth: '100%',
                    flexShrink: 0
                  }}
                >
                  <SDLSearch
                    value={search}
                    onChange={setSearch}
                    placeholder="Search employees..."
                    className="mb-0"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <SDLDataTable
                data={visibleEmployees}
                columns={columns}
                rows={10}
                loading={loading}
                emptyMessage={
                  loading
                    ? ' '
                    : search.trim()
                      ? 'No employees match your search.'
                      : 'No upcoming tenure changes found.'
                }
                className="tenure-change-table"
                tableStyle={{
                  width: '100%',
                  minWidth: '100%',
                  tableLayout: 'fixed'
                }}
                scrollable={false}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default TenureChange
