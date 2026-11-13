import { useCallback, useEffect, useState } from 'react'
import BreadcrumbNav from '../../../../shared/components/BreadcrumbNav'
import SDLDataTable from '../../../../shared/components/datatable/SDLDataTable'
import SDLReactSelect from '../../../../shared/components/form/SDLReactSelect'
import SDLCalendar from '../../../../shared/components/calendar/SDLCalendar'
import SaveButton from '../../../../shared/components/buttons/SaveButton'
import CancelButton from '../../../../shared/components/buttons/CancelButton'
import {
  confirmAction,
  notifyError,
  notifySuccess
} from '../../../../shared/services/alertService'
import { parseDateValue, toDateInputValue } from '../../../../shared/utils/commonUtils'
import {
  getNewEmployeeOfficeOptions,
  getRehireEmployee,
  getRehireOptions,
  saveRehireEmployee
} from '../../services/newEmployeeService'
import { toOptions } from './joiningFormUtils'
import '../../../../shared/assets/css/companyPolicies.css'
import '../../assets/css/tenureChange.css'

const EMPTY_FORM = {
  etypeId: '',
  etypePeriod: '',
  effFrom: '',
  effTo: '',
  divsnId: '',
  deptId: '',
  desiId: '',
  orgId: '',
  orgLocId: ''
}

const EMPTY_OFFICE_OPTIONS = {
  divisions: [],
  departments: [],
  designations: [],
  organograms: [],
  locations: []
}

// Changing an office field clears the fields that depend on it.
const OFFICE_DEPENDENTS = {
  divsnId: ['orgId', 'orgLocId'],
  deptId: ['desiId', 'orgId', 'orgLocId'],
  desiId: ['orgId', 'orgLocId'],
  orgId: ['orgLocId']
}

const REQUIRED_FIELDS = {
  etypeId: 'Employee type',
  effFrom: 'Effective from',
  divsnId: 'Division',
  deptId: 'Department',
  desiId: 'Designation',
  orgId: 'Organogram',
  orgLocId: 'Organogram location'
}

const RequiredMark = () => <span className='text-danger'>*</span>

// Organograms show how full they are, as a full position cannot be rehired into.
const organogramOptions = rows =>
  toOptions(
    rows.map(row => ({
      VALUE: row.VALUE,
      LABEL: `${row.LABEL} (filled ${row.FILL_COUNT ?? 0} of ${row.POSI_COUNT ?? 0})`
    }))
  )

const tenureColumns = [
  { field: 'type', header: 'Employee Type' },
  { field: 'period', header: 'Period' },
  { field: 'from', header: 'Effective From' },
  { field: 'to', header: 'Effective To' }
]

/*
 * Rehire Employee (legacy rehire_emp.php): pick a relieved employee and enter
 * their new tenure and office, which makes them active again.
 */
const RehireEmployee = () => {
  const [employees, setEmployees] = useState([])
  const [employeeTypes, setEmployeeTypes] = useState([])
  const [empCode, setEmpCode] = useState('')
  const [employee, setEmployee] = useState(null)
  const [employeeLoading, setEmployeeLoading] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [officeOptions, setOfficeOptions] = useState(EMPTY_OFFICE_OPTIONS)
  const [saving, setSaving] = useState(false)

  const companyId = employee?.companyId
  const officeKey = [companyId, form.divsnId, form.deptId, form.desiId, form.orgId].join('|')

  const loadOptions = useCallback(async () => {
    try {
      const response = await getRehireOptions()
      if (!response?.status) throw new Error(response?.message)
      setEmployees(toOptions(response.data?.employees))
      setEmployeeTypes(toOptions(response.data?.employeeTypes))
    } catch (error) {
      if (!error?.cancelled) notifyError(error?.message || 'Unable to load the relieved employees.')
    }
  }, [])

  useEffect(() => {
    // Async load; state is only set after the request resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadOptions()
  }, [loadOptions])

  const reset = () => {
    setEmpCode('')
    setEmployee(null)
    setForm(EMPTY_FORM)
    setErrors({})
    setOfficeOptions(EMPTY_OFFICE_OPTIONS)
  }

  const selectEmployee = async code => {
    reset()
    if (!code) return
    setEmpCode(code)
    setEmployeeLoading(true)
    try {
      const response = await getRehireEmployee(code)
      if (!response?.status) throw new Error(response?.message)
      setEmployee(response.data)
    } catch (error) {
      if (!error?.cancelled) notifyError(error?.message || 'Unable to load the employee.')
      setEmpCode('')
    } finally {
      setEmployeeLoading(false)
    }
  }

  useEffect(() => {
    if (!companyId) return undefined
    let current = true
    getNewEmployeeOfficeOptions({
      company: companyId,
      emp_code: empCode,
      division: form.divsnId || undefined,
      department: form.deptId || undefined,
      designation: form.desiId || undefined,
      organogram: form.orgId || undefined
    })
      .then(response => {
        if (!current) return
        if (!response?.status) throw new Error(response?.message)
        setOfficeOptions({ ...EMPTY_OFFICE_OPTIONS, ...response.data, loadedFor: officeKey })
      })
      .catch(error => {
        if (current && !error?.cancelled) {
          notifyError(error?.message || 'Unable to load the office options.')
        }
      })
    return () => {
      current = false
    }
    // officeKey already holds every value this request depends on.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [officeKey])

  const update = (field, value) => {
    setForm(current => {
      const next = { ...current, [field]: value }
      ;(OFFICE_DEPENDENTS[field] || []).forEach(dependent => {
        next[dependent] = ''
      })
      return next
    })
    setErrors(current => ({ ...current, [field]: '' }))
  }

  const handleSave = async () => {
    const next = {}
    Object.entries(REQUIRED_FIELDS).forEach(([field, label]) => {
      if (!form[field]) next[field] = `${label} is required.`
    })
    if (form.etypePeriod && !/^\d+$/.test(form.etypePeriod)) {
      next.etypePeriod = 'Period must be a whole number of months.'
    }
    if (form.effFrom && employee.dolIso && form.effFrom <= employee.dolIso) {
      next.effFrom = `Effective from must be after the leaving date (${employee.dolDate}).`
    }
    if (form.effFrom && form.effTo && form.effTo < form.effFrom) {
      next.effTo = 'Effective to cannot be before effective from.'
    }
    setErrors(next)
    if (Object.keys(next).length > 0) return

    const confirmed = await confirmAction(
      'Rehire employee?',
      `${employee.name} will become active in HRMS, EPP and SFM, and will be able to log in.`
    )
    if (!confirmed) return

    setSaving(true)
    try {
      const response = await saveRehireEmployee({
        emp_code: employee.empCode,
        etype_id: form.etypeId,
        etype_period: form.etypePeriod,
        eff_from: form.effFrom,
        eff_to: form.effTo,
        divsn_id: form.divsnId,
        dept_id: form.deptId,
        desi_id: form.desiId,
        org_id: form.orgId,
        org_loc_id: form.orgLocId
      })
      if (!response?.status) throw new Error(response?.message)
      notifySuccess(response.message)
      reset()
      loadOptions()
    } catch (error) {
      notifyError(error?.message || 'Unable to rehire the employee.')
    } finally {
      setSaving(false)
    }
  }

  const fieldError = field =>
    errors[field] && <small className='text-danger d-block mt-1'>{errors[field]}</small>

  const optionsCurrent = officeOptions.loadedFor === officeKey

  const selectField = (field, label, options, config = {}) => {
    const { required = true, disabled = false, hint = '' } = config
    return (
      <div className='col-md-4'>
        <label className='form-label'>
          {label} {required && <RequiredMark />}
        </label>
        <SDLReactSelect
          value={form[field]}
          options={options}
          onChange={value => update(field, value || '')}
          placeholder='Select'
          isDisabled={disabled || saving}
        />
        {fieldError(field)}
        {!errors[field] && hint && <small className='text-muted d-block mt-1'>{hint}</small>}
      </div>
    )
  }

  return (
    <>
      <div className='page-header' style={{ marginBottom: '8px' }}>
        <div className='page-title'>
          <h4>Rehire Employee</h4>
        </div>
        <BreadcrumbNav
          items={[
            { text: 'Home', link: '/hrms/dashboard' },
            { text: 'Joining', link: '#' },
            { text: 'Rehire Employee' }
          ]}
        />
      </div>

      <div className='row'>
        <div className='col-12 px-0'>
          <div className='card'>
            <div className='card-body tenure-change-page'>
              <div className='row g-3 mb-3'>
                <div className='col-md-6'>
                  <label className='form-label'>
                    Relieved Employee <RequiredMark />
                  </label>
                  <SDLReactSelect
                    value={empCode}
                    options={employees}
                    onChange={value => selectEmployee(value || '')}
                    placeholder='Please Select'
                    isDisabled={saving}
                  />
                </div>
              </div>

              {employeeLoading && (
                <div className='text-center py-4'>
                  <span className='spinner-border' role='status' aria-label='Loading' />
                </div>
              )}

              {employee && (
                <>
                  <div className='row mb-3'>
                    <div className='col-md-4 mb-1'>
                      Employee: <strong>{employee.empCode} - {employee.name}</strong>
                    </div>
                    <div className='col-md-4 mb-1'>
                      Last Department: <strong>{employee.department || '-'}</strong>
                    </div>
                    <div className='col-md-4 mb-1'>
                      Last Designation: <strong>{employee.designation || '-'}</strong>
                    </div>
                    <div className='col-md-4 mb-1'>
                      Last Location: <strong>{employee.location || '-'}</strong>
                    </div>
                    <div className='col-md-4 mb-1'>
                      Email: <strong>{employee.email || '-'}</strong>
                    </div>
                    <div className='col-md-4 mb-1'>
                      Leaving Date: <strong>{employee.dolDate || '-'}</strong>
                    </div>
                  </div>

                  <h6 className='mb-3'>New Tenure</h6>
                  <div className='row g-3 mb-3'>
                    <div className='col-md-3'>
                      <label className='form-label'>
                        Employee Type <RequiredMark />
                      </label>
                      <SDLReactSelect
                        value={form.etypeId}
                        options={employeeTypes}
                        onChange={value => update('etypeId', value || '')}
                        placeholder='Select'
                        isDisabled={saving}
                      />
                      {fieldError('etypeId')}
                    </div>
                    <div className='col-md-3'>
                      <label className='form-label' htmlFor='rehire-period'>
                        Period (In Months)
                      </label>
                      <input
                        id='rehire-period'
                        type='number'
                        min='0'
                        className={`form-control${errors.etypePeriod ? ' is-invalid' : ''}`}
                        value={form.etypePeriod}
                        disabled={saving}
                        onChange={event => update('etypePeriod', event.target.value)}
                      />
                      {fieldError('etypePeriod')}
                    </div>
                    <div className='col-md-3'>
                      <label className='form-label'>
                        Effective From <RequiredMark />
                      </label>
                      <SDLCalendar
                        value={parseDateValue(form.effFrom)}
                        allowAllDates
                        disabled={saving}
                        inputClassName={errors.effFrom ? 'is-invalid' : ''}
                        onChange={date => update('effFrom', toDateInputValue(date))}
                      />
                      {fieldError('effFrom')}
                    </div>
                    <div className='col-md-3'>
                      <label className='form-label'>Effective To</label>
                      <SDLCalendar
                        value={parseDateValue(form.effTo)}
                        minDate={parseDateValue(form.effFrom) || undefined}
                        allowAllDates
                        disabled={saving}
                        inputClassName={errors.effTo ? 'is-invalid' : ''}
                        onChange={date => update('effTo', toDateInputValue(date))}
                      />
                      {fieldError('effTo')}
                    </div>
                  </div>

                  <h6 className='mb-3'>New Office</h6>
                  <div className='row g-3 mb-3'>
                    {selectField('divsnId', 'Division', toOptions(officeOptions.divisions))}
                    {selectField('deptId', 'Department', toOptions(officeOptions.departments))}
                    {selectField('desiId', 'Designation', toOptions(officeOptions.designations), {
                      disabled: !form.deptId
                    })}
                    {selectField('orgId', 'Organogram', organogramOptions(officeOptions.organograms), {
                      disabled: !form.desiId || !form.divsnId,
                      hint:
                        optionsCurrent && form.desiId && form.divsnId && officeOptions.organograms.length === 0
                          ? 'No organogram exists for this designation.'
                          : ''
                    })}
                    {selectField('orgLocId', 'Organogram Location', toOptions(officeOptions.locations), {
                      disabled: !form.orgId,
                      hint:
                        optionsCurrent && form.orgId && officeOptions.locations.length === 0
                          ? 'No free location in this organogram.'
                          : ''
                    })}
                  </div>

                  <div className='d-flex justify-content-end mb-4'>
                    <SaveButton onClick={handleSave} isSubmitting={saving} className='me-2'>
                      Save
                    </SaveButton>
                    <CancelButton onClick={reset} disabled={saving} />
                  </div>

                  <h6 className='mb-3'>Tenure History</h6>
                  <SDLDataTable
                    data={employee.tenures}
                    columns={tenureColumns}
                    emptyMessage='No Tenure History Found'
                    className='company-policies-grid fit-width-grid'
                    tableStyle={{ width: '100%' }}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default RehireEmployee
