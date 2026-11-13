import { useState } from 'react'
import SDLCalendar from '../../../../shared/components/calendar/SDLCalendar'
import { parseDateValue, toDateInputValue } from '../../../../shared/utils/commonUtils'
import ReportField from './ReportField'
import ReportFilterPage from './ReportFilterPage'

const EMPTY = { fromDate: '', toDate: '' }

/* Report filtered only by From / To date (Requisition Tracker, Candidate Tracker). */
const PeriodReport = ({ title, onOpen }) => {
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const set = (key, value) => {
    setForm(current => ({ ...current, [key]: value }))
    setErrors(current => ({ ...current, [key]: '' }))
  }

  const getData = () => {
    const next = {}
    if (!form.fromDate) next.fromDate = 'Please select the from date.'
    if (!form.toDate) next.toDate = 'Please select the to date.'
    if (form.fromDate && form.toDate && form.toDate < form.fromDate) next.toDate = 'To date cannot be before the from date.'
    setErrors(next)
    if (Object.keys(next).length === 0) onOpen({ from_date: form.fromDate, to_date: form.toDate })
  }

  return (
    <ReportFilterPage
      title={title}
      onGetData={getData}
      onCancel={() => {
        setForm(EMPTY)
        setErrors({})
      }}
    >
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

export default PeriodReport
