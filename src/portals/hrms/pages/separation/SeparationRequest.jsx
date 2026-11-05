import { useCallback, useEffect, useMemo, useState } from 'react'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import BreadcrumbNav from '../../../../shared/components/BreadcrumbNav'
import SDLDataTable from '../../../../shared/components/datatable/SDLDataTable'
import SDLSearch from '../../../../shared/components/datatable/SDLSearch'
import SDLReactSelect from '../../../../shared/components/form/SDLReactSelect'
import SaveButton from '../../../../shared/components/buttons/SaveButton'
import CancelButton from '../../../../shared/components/buttons/CancelButton'
import EditButton from '../../../../shared/components/buttons/EditButton'
import SDLCalendar from '../../../../shared/components/calendar/SDLCalendar'
import { parseDateValue, toDateInputValue } from '../../../../shared/utils/commonUtils'
import {
  confirmAction,
  notifyError,
  notifySuccess
} from '../../../../shared/services/alertService'
import {
  getSeparationRequests,
  getSeparationRequest,
  saveSeparationRequest
} from '../../services/exitService'
import {
  RESIGNATION_TYPES,
  RESIGNATION_MODES,
  SEPARATION_STATUSES
} from './exitOptions'
import '../../../../shared/assets/css/companyPolicies.css'
import '../../assets/css/tenureChange.css'

const EMPTY_FORM = {
  id: '',
  empCode: '',
  resignType: '',
  resignMode: '',
  recipientEmail: '',
  resignationDate: '',
  expectedRelievingDate: '',
  employeeComments: '',
  status: ''
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const RequiredMark = () => <span className='text-danger'>*</span>

/*
 * Separation Request (legacy separation_edit.php without a task): HR raises a
 * separation, saves it as a draft and submits it, which creates the
 * Separation Request task (18) for authorization.
 */
const SeparationRequest = () => {
  const [requests, setRequests] = useState([])
  const [employees, setEmployees] = useState([])
  const [listLoading, setListLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [form, setForm] = useState(EMPTY_FORM)
  const [selectedLabel, setSelectedLabel] = useState('')
  const [errors, setErrors] = useState({})
  const [busyAction, setBusyAction] = useState('')

  const loadRequests = useCallback(async () => {
    setListLoading(true)
    try {
      const response = await getSeparationRequests()
      if (!response?.status) throw new Error(response?.message)
      setRequests(response.data?.requests || [])
      setEmployees(response.data?.employees || [])
    } catch (error) {
      if (!error?.cancelled) notifyError(error?.message || 'Unable to load separation requests.')
    } finally {
      setListLoading(false)
    }
  }, [])

  useEffect(() => {
    // Async load; state is only set after the request resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadRequests()
  }, [loadRequests])

  const isEditable = !form.status || form.status === 'N'

  const employeeOptions = useMemo(() => {
    if (!form.empCode || employees.some(option => option.value === form.empCode)) {
      return employees
    }
    return [{ value: form.empCode, label: selectedLabel || form.empCode }, ...employees]
  }, [employees, form.empCode, selectedLabel])

  const update = (field, value) => {
    setForm(current => ({
      ...current,
      [field]: value,
      ...(field === 'resignMode' && value !== 'E' ? { recipientEmail: '' } : {})
    }))
    setErrors(current => ({ ...current, [field]: '' }))
  }

  const resetForm = () => {
    setForm(EMPTY_FORM)
    setSelectedLabel('')
    setErrors({})
  }

  const openRequest = async id => {
    try {
      const response = await getSeparationRequest(id)
      if (!response?.status) throw new Error(response?.message)
      const request = response.data.request
      setForm({ ...EMPTY_FORM, ...request })
      setSelectedLabel(request.empLabel)
      setErrors({})
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (error) {
      notifyError(error?.message || 'Unable to load the separation request.')
    }
  }

  const validate = () => {
    const next = {}
    if (!form.empCode) next.empCode = 'Employee is required.'
    if (!form.resignType) next.resignType = 'Resignation type is required.'
    if (!form.resignMode) next.resignMode = 'Resignation mode is required.'
    if (form.resignMode === 'E' && !EMAIL_PATTERN.test(form.recipientEmail.trim())) {
      next.recipientEmail = 'Please enter a valid email address.'
    }
    if (!form.resignationDate) next.resignationDate = 'Resignation date is required.'
    if (!form.expectedRelievingDate) {
      next.expectedRelievingDate = 'Expected relieving date is required.'
    } else if (form.resignationDate && form.expectedRelievingDate < form.resignationDate) {
      next.expectedRelievingDate = 'Cannot be before the resignation date.'
    }
    if (!form.employeeComments.trim()) next.employeeComments = 'Employee comments are required.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const submitRequest = async action => {
    if (!validate()) return
    if (action === 'submit') {
      const confirmed = await confirmAction(
        'Submit separation request?',
        'Once you submit this request, a task will be generated for the HOD to authorize.'
      )
      if (!confirmed) return
    }
    setBusyAction(action)
    try {
      const response = await saveSeparationRequest({
        id: form.id || undefined,
        action,
        emp_code: form.empCode,
        resign_type: form.resignType,
        resign_mode: form.resignMode,
        recipient_email: form.recipientEmail.trim(),
        resignation_date: form.resignationDate,
        expected_relieving_date: form.expectedRelievingDate,
        employee_comments: form.employeeComments.trim()
      })
      if (!response?.status) throw new Error(response?.message)
      notifySuccess(response.message)
      if (action === 'submit') {
        window.dispatchEvent(new Event('hrms-auth-tasks-changed'))
        resetForm()
      } else {
        setForm(current => ({ ...current, id: response.data?.id ?? current.id, status: 'N' }))
      }
      loadRequests()
    } catch (error) {
      notifyError(error?.message || 'Unable to save the separation request.')
    } finally {
      setBusyAction('')
    }
  }

  const filteredRequests = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return requests
    return requests.filter(request =>
      [
        request.empName,
        request.empCode,
        request.divisionDepartmentDesignation,
        SEPARATION_STATUSES[request.status]?.label
      ].some(value => String(value || '').toLowerCase().includes(query))
    )
  }, [requests, searchQuery])

  const columns = [
    {
      header: 'No',
      body: (_row, options) => options.rowIndex + 1,
      style: { width: '50px' }
    },
    {
      field: 'empName',
      header: 'Employee Name',
      sortable: true,
      body: row => `${row.empName} - ${row.empCode}`,
      style: { width: '200px' }
    },
    {
      field: 'dojIso',
      header: 'DOJ',
      sortable: true,
      body: row => <span className='text-nowrap'>{row.doj}</span>,
      style: { width: '110px' }
    },
    {
      field: 'divisionDepartmentDesignation',
      header: 'Division - Department - Designation',
      // No fixed width: takes the remaining space; long values are cut with "..."
      // and the full text shows on hover.
      body: row => (
        <OverlayTrigger
          placement='top'
          delay={{ show: 150, hide: 100 }}
          container={document.body}
          overlay={
            <Tooltip id={`separation-dept-${row.id}`} className='custom-tooltip-nocss'>
              {row.divisionDepartmentDesignation}
            </Tooltip>
          }
        >
          <span className='d-block text-truncate' style={{ cursor: 'default' }}>
            {row.divisionDepartmentDesignation}
          </span>
        </OverlayTrigger>
      )
    },
    {
      field: 'resignationDateIso',
      header: 'Resignation Date',
      sortable: true,
      body: row => <span className='text-nowrap'>{row.resignationDate}</span>,
      style: { width: '125px' }
    },
    {
      field: 'expectedRelievingDateIso',
      header: 'Exp. Relieving Date',
      sortable: true,
      body: row => <span className='text-nowrap'>{row.expectedRelievingDate}</span>,
      style: { width: '115px' }
    },
    {
      field: 'status',
      header: 'Status',
      sortable: true,
      body: row => {
        const status = SEPARATION_STATUSES[row.status]
        return (
          <span className={`badge ${status?.className || 'bg-secondary'}`}>
            {status?.label || row.status}
          </span>
        )
      },
      style: { width: '150px' }
    },
    {
      header: 'Actions',
      body: row => (
        <div className='d-flex justify-content-center'>
          <EditButton
            onClick={() => openRequest(row.id)}
            ariaLabel={row.status === 'N' ? 'Edit' : 'View'}
            iconClassName={row.status === 'N' ? 'ti ti-edit' : 'ti ti-eye'}
          />
        </div>
      ),
      style: { width: '80px', textAlign: 'center' }
    }
  ]

  const fieldError = field =>
    errors[field] && <small className='text-danger d-block mt-1'>{errors[field]}</small>

  const busy = Boolean(busyAction)

  return (
    <>
      <div className='page-header' style={{ marginBottom: '8px' }}>
        <div className='page-title'>
          <h4>Separation Request</h4>
        </div>
        <BreadcrumbNav
          items={[
            { text: 'Home', link: '/hrms/dashboard' },
            { text: 'Separation', link: '#' },
            { text: 'Separation Request' }
          ]}
        />
      </div>

      <div className='row'>
        <div className='col-12 px-0'>
          <div className='card'>
            <div className='card-body tenure-change-page'>
              {form.id && !isEditable && (
                <div className='alert alert-info py-2'>
                  This request is{' '}
                  <strong>{SEPARATION_STATUSES[form.status]?.label || form.status}</strong>{' '}
                  and can no longer be edited.
                </div>
              )}

              <div className='row g-3'>
                <div className='col-lg-6'>
                  <div className='row g-3'>
                    <div className='col-12'>
                      <label className='form-label'>
                        Employee Code <RequiredMark />
                      </label>
                      <SDLReactSelect
                        value={form.empCode}
                        options={employeeOptions}
                        onChange={(value, option) => {
                          update('empCode', value)
                          setSelectedLabel(option?.label || '')
                        }}
                        placeholder='Please Select'
                        isDisabled={!isEditable || Boolean(form.id)}
                      />
                      {fieldError('empCode')}
                    </div>
                    <div className='col-md-4'>
                      <label className='form-label'>
                        Resignation Type <RequiredMark />
                      </label>
                      <select
                        className={`form-select tenure-change-select${errors.resignType ? ' is-invalid' : ''}`}
                        value={form.resignType}
                        disabled={!isEditable}
                        onChange={event => update('resignType', event.target.value)}
                      >
                        <option value=''>Please Select</option>
                        {RESIGNATION_TYPES.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {fieldError('resignType')}
                    </div>
                    <div className='col-md-3'>
                      <label className='form-label'>
                        Resignation Mode <RequiredMark />
                      </label>
                      <select
                        className={`form-select tenure-change-select${errors.resignMode ? ' is-invalid' : ''}`}
                        value={form.resignMode}
                        disabled={!isEditable}
                        onChange={event => update('resignMode', event.target.value)}
                      >
                        <option value=''>Please Select</option>
                        {RESIGNATION_MODES.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {fieldError('resignMode')}
                    </div>
                    <div className='col-md-5'>
                      <label className='form-label'>
                        Recipient Email {form.resignMode === 'E' && <RequiredMark />}
                      </label>
                      <input
                        type='email'
                        className={`form-control${errors.recipientEmail ? ' is-invalid' : ''}`}
                        value={form.recipientEmail}
                        maxLength={50}
                        disabled={!isEditable || form.resignMode !== 'E'}
                        onChange={event => update('recipientEmail', event.target.value)}
                      />
                      {fieldError('recipientEmail')}
                    </div>
                    <div className='col-md-6'>
                      <label className='form-label'>
                        Resignation Date <RequiredMark />
                      </label>
                      <SDLCalendar
                        value={parseDateValue(form.resignationDate)}
                        allowAllDates
                        disabled={!isEditable}
                        inputClassName={errors.resignationDate ? 'is-invalid' : ''}
                        onChange={date => update('resignationDate', toDateInputValue(date))}
                      />
                      {fieldError('resignationDate')}
                    </div>
                    <div className='col-md-6'>
                      <label className='form-label'>
                        Expected Relieving Date <RequiredMark />
                      </label>
                      <SDLCalendar
                        value={parseDateValue(form.expectedRelievingDate)}
                        minDate={parseDateValue(form.resignationDate) || undefined}
                        allowAllDates
                        disabled={!isEditable}
                        inputClassName={errors.expectedRelievingDate ? 'is-invalid' : ''}
                        onChange={date => update('expectedRelievingDate', toDateInputValue(date))}
                      />
                      {fieldError('expectedRelievingDate')}
                    </div>
                  </div>
                </div>

                <div className='col-lg-6 d-flex flex-column'>
                  <label className='form-label'>
                    Employee Comments <RequiredMark />
                  </label>
                  <textarea
                    className={`form-control flex-grow-1${errors.employeeComments ? ' is-invalid' : ''}`}
                    style={{ minHeight: '206px' }}
                    value={form.employeeComments}
                    maxLength={2000}
                    disabled={!isEditable}
                    onChange={event => update('employeeComments', event.target.value)}
                  />
                  {fieldError('employeeComments')}
                </div>
              </div>

              <div className='d-flex justify-content-end mt-3'>
                {isEditable && (
                  <SaveButton
                    onClick={() => submitRequest('save')}
                    disabled={busy}
                    isSubmitting={busyAction === 'save'}
                    className='me-2'
                  >
                    Save
                  </SaveButton>
                )}
                {isEditable && form.id && (
                  <button
                    type='button'
                    className='btn btn-success me-2'
                    onClick={() => submitRequest('submit')}
                    disabled={busy}
                  >
                    {busyAction === 'submit' ? 'Processing...' : 'Submit'}
                  </button>
                )}
                <CancelButton onClick={resetForm} disabled={busy} />
              </div>
            </div>
          </div>

          <div className='card'>
            <div className='card-body'>
              <div className='d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3'>
                <div style={{ width: '330px', minWidth: '330px', maxWidth: '330px', flexShrink: 0 }}>
                  <SDLSearch
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder='Search Requests...'
                    style={{ width: '330px', minWidth: '330px', maxWidth: '330px' }}
                  />
                </div>
              </div>
              <SDLDataTable
                data={filteredRequests}
                columns={columns}
                loading={listLoading}
                emptyMessage='No Separation Requests Found'
                className='company-policies-grid fit-width-grid'
                removableSort
                sortField='enteredOnSort'
                sortOrder={-1}
                tableStyle={{ width: '100%' }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default SeparationRequest
