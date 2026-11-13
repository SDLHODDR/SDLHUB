import { useState } from 'react'
import SDLCalendar from '../../../../shared/components/calendar/SDLCalendar'
import SDLReactSelect from '../../../../shared/components/form/SDLReactSelect'
import { parseDateValue, toDateInputValue } from '../../../../shared/utils/commonUtils'
import { openFollowUpReport } from '../../services/reportService'
import ReportField from './ReportField'
import ReportFilterPage from './ReportFilterPage'
import { useReportOptions } from './useReportOptions'

const EMPTY = { employee: '', fromDate: '', toDate: '' }

/* Follow Up report (legacy rept_admin.php?reptnm=followup): follow-ups an employee recorded in a period. */
const FollowUpReport = () => {
  const { options, loadError, loading } = useReportOptions('followup')
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const set = (key, value) => {
    setForm(current => ({ ...current, [key]: value }))
    setErrors(current => ({ ...current, [key]: '' }))
  }

  const getData = () => {
    const next = {}
    if (!form.employee) next.employee = 'Please select the employee.'
    if (!form.fromDate) next.fromDate = 'Please select the from date.'
    if (!form.toDate) next.toDate = 'Please select the to date.'
    if (form.fromDate && form.toDate && form.toDate < form.fromDate) next.toDate = 'To date cannot be before the from date.'
    setErrors(next)
    if (Object.keys(next).length) return
    openFollowUpReport({ emp_code: form.employee, from_date: form.fromDate, to_date: form.toDate })
  }

  return (
    <ReportFilterPage
      title='Follow Up'
      loading={loading}
      loadError={loadError}
      onGetData={getData}
      onCancel={() => {
        setForm(EMPTY)
        setErrors({})
      }}
    >
      <ReportField label='Employee' error={errors.employee} className='col-md-6 col-lg-4'>
        <SDLReactSelect
          value={form.employee}
          options={options?.employees || []}
          placeholder='Please Select'
          onChange={value => set('employee', value || '')}
        />
      </ReportField>
      <ReportField label='From Date' error={errors.fromDate}>
        <SDLCalendar
          value={parseDateValue(form.fromDate)}
          onChange={date => set('fromDate', date ? toDateInputValue(date) : '')}
          allowAllDates
          showHolidays={false}
        />
      </ReportField>
      <ReportField label='To Date' error={errors.toDate}>
        <SDLCalendar
          value={parseDateValue(form.toDate)}
          onChange={date => set('toDate', date ? toDateInputValue(date) : '')}
          minDate={parseDateValue(form.fromDate) || undefined}
          allowAllDates
          showHolidays={false}
        />
      </ReportField>
    </ReportFilterPage>
  )
}

export default FollowUpReport
