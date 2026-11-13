import { useState } from 'react'
import SDLCalendar from '../../../../shared/components/calendar/SDLCalendar'
import SDLReactSelect from '../../../../shared/components/form/SDLReactSelect'
import { parseDateValue, toDateInputValue } from '../../../../shared/utils/commonUtils'
import { getReportOptions, openTenureChangeReport } from '../../services/reportService'
import ReportField from './ReportField'
import ReportFilterPage from './ReportFilterPage'
import { useReportOptions } from './useReportOptions'

const ALL = { value: 'ALL', label: 'ALL' }
const EMPTY = { company: '', employee: 'ALL', fromDate: '', toDate: '' }

/*
 * Tenure Change report (legacy rept_admin.php?reptnm=tenure). Employees are those of the company with a
 * tenure change. From / To (optional) filter the change's Effect From and apply only to ALL, as the
 * old screen disabled them once an employee was picked.
 */
const TenureChangeReport = () => {
  const { options, loadError, loading } = useReportOptions('tenure')
  const [form, setForm] = useState(EMPTY)
  const [employees, setEmployees] = useState([ALL])
  const [employeesLoading, setEmployeesLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const allEmployees = form.employee === 'ALL'
  const set = (key, value) => {
    setForm(current => ({ ...current, [key]: value }))
    setErrors(current => ({ ...current, [key]: '' }))
  }

  const changeCompany = value => {
    setForm({ ...EMPTY, company: value || '' })
    setEmployees([ALL])
    setErrors({})
    if (!value) return
    setEmployeesLoading(true)
    getReportOptions('tenure', { comp_id: value })
      .then(response => {
        if (!response?.status) throw new Error(response?.message)
        setEmployees([ALL, ...(response.data.employees || [])])
      })
      .catch(error => setErrors({ employee: error?.message || 'Unable to load the employees.' }))
      .finally(() => setEmployeesLoading(false))
  }

  const getData = () => {
    const next = {}
    if (!form.company) next.company = 'Please select the company.'
    if (allEmployees && form.fromDate && form.toDate && form.toDate < form.fromDate) next.toDate = 'To date cannot be before the from date.'
    setErrors(next)
    if (Object.keys(next).length) return
    openTenureChangeReport({
      comp_id: form.company,
      emp_code: form.employee,
      ...(allEmployees ? { from_date: form.fromDate, to_date: form.toDate } : {})
    })
  }

  return (
    <ReportFilterPage
      title='Tenure Change'
      loading={loading}
      loadError={loadError}
      onGetData={getData}
      onCancel={() => changeCompany('')}
    >
      <ReportField label='Company' error={errors.company}>
        <SDLReactSelect value={form.company} options={options?.companies || []} placeholder='Please Select' onChange={changeCompany} />
      </ReportField>
      <ReportField label='Employee' error={errors.employee} required={false}>
        <SDLReactSelect
          value={form.employee}
          options={employees}
          placeholder={employeesLoading ? 'Loading...' : 'ALL'}
          isDisabled={!form.company || employeesLoading}
          onChange={value => setForm(current => ({ ...current, employee: value || 'ALL', fromDate: '', toDate: '' }))}
        />
      </ReportField>
      <ReportField label='From Date' error={errors.fromDate} required={false}>
        <SDLCalendar
          value={parseDateValue(form.fromDate)}
          onChange={date => set('fromDate', date ? toDateInputValue(date) : '')}
          disabled={!allEmployees}
          allowAllDates
          showHolidays={false}
        />
      </ReportField>
      <ReportField label='To Date' error={errors.toDate} required={false}>
        <SDLCalendar
          value={parseDateValue(form.toDate)}
          onChange={date => set('toDate', date ? toDateInputValue(date) : '')}
          minDate={parseDateValue(form.fromDate) || undefined}
          disabled={!allEmployees}
          allowAllDates
          showHolidays={false}
        />
      </ReportField>
    </ReportFilterPage>
  )
}

export default TenureChangeReport
