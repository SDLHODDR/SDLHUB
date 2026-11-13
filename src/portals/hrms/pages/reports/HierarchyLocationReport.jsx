import { useState } from 'react'
import SDLReactSelect from '../../../../shared/components/form/SDLReactSelect'
import ReportField from './ReportField'
import ReportFilterPage from './ReportFilterPage'
import { useReportOptions } from './useReportOptions'

/* Location filter of the two Organogram Hierarchy reports (legacy rept_admin.php?reptnm=orglochierarchy[visual]). */
const HierarchyLocationReport = ({ title, report, onOpen }) => {
  const { options, loadError, loading } = useReportOptions(report)
  const [location, setLocation] = useState('')
  const [error, setError] = useState('')

  return (
    <ReportFilterPage
      title={title}
      loading={loading}
      loadError={loadError}
      onGetData={() => {
        if (!location) {
          setError('Please select the location.')
          return
        }
        onOpen(location)
      }}
      onCancel={() => {
        setLocation('')
        setError('')
      }}
    >
      <ReportField label='Location' error={error} className='col-lg-8'>
        <SDLReactSelect
          value={location}
          options={options?.locations || []}
          placeholder='Please Select'
          onChange={value => {
            setLocation(value || '')
            setError('')
          }}
        />
      </ReportField>
    </ReportFilterPage>
  )
}

export default HierarchyLocationReport
