import { useState } from 'react'
import SDLReactSelect from '../../../../shared/components/form/SDLReactSelect'
import ReportField from './ReportField'
import ReportFilterPage from './ReportFilterPage'
import { useReportOptions } from './useReportOptions'

const EMPTY = { company: '', division: '', department: '' }
// [key, label, option list]
const FIELDS = [
  ['company', 'Company', 'companies'],
  ['division', 'Division', 'divisions'],
  ['department', 'Department', 'departments']
]

/*
 * Company / Division / Department report page. Organogram Master (legacy rept_admin.php?reptnm=orgmaster)
 * needs all three; Open Positions passes optionalUnits so only the company is required.
 */
const OrganogramUnitReport = ({ title, report, onOpen, optionalUnits = false }) => {
  const { options, loadError, loading } = useReportOptions(report)
  const isRequired = key => !optionalUnits || key === 'company'
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})

  const getData = () => {
    const next = {}
    FIELDS.forEach(([key, label]) => {
      if (!form[key] && isRequired(key)) next[key] = `Please select the ${label.toLowerCase()}.`
    })
    setErrors(next)
    if (Object.keys(next).length) return
    onOpen({ comp_id: form.company, divsn_id: form.division, dept_id: form.department })
  }

  return (
    <ReportFilterPage
      title={title}
      loading={loading}
      loadError={loadError}
      onGetData={getData}
      onCancel={() => {
        setForm(EMPTY)
        setErrors({})
      }}
    >
      {FIELDS.map(([key, label, list]) => (
        <ReportField key={key} label={label} error={errors[key]} required={isRequired(key)}>
          <SDLReactSelect
            value={form[key]}
            options={options?.[list] || []}
            placeholder={isRequired(key) ? 'Please Select' : 'ALL'}
            onChange={value => {
              setForm(current => ({ ...current, [key]: value || '' }))
              setErrors(current => ({ ...current, [key]: '' }))
            }}
          />
        </ReportField>
      ))}
    </ReportFilterPage>
  )
}

export default OrganogramUnitReport
