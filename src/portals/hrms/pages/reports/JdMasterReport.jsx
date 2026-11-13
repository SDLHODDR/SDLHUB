import { useState } from 'react'
import SDLReactSelect from '../../../../shared/components/form/SDLReactSelect'
import { getReportOptions, openJdMasterReport } from '../../services/reportService'
import ReportField from './ReportField'
import ReportFilterPage from './ReportFilterPage'
import { useReportOptions } from './useReportOptions'

const ALL = { value: 'ALL', label: 'ALL' }

/* JD Master report (legacy rept_admin.php?reptnm=jdmaster): job descriptions of a department. */
const JdMasterReport = () => {
  const { options, loadError, loading } = useReportOptions('jdmaster')
  const [department, setDepartment] = useState('')
  const [designation, setDesignation] = useState('')
  const [designations, setDesignations] = useState([])
  const [designationsLoading, setDesignationsLoading] = useState(false)
  const [errors, setErrors] = useState({})

  // Designations mapped to the department (legacy jd_sv.php?populate_des_report), with ALL first.
  const changeDepartment = value => {
    setDepartment(value || '')
    setDesignation('')
    setDesignations([])
    setErrors({})
    if (!value) return
    setDesignationsLoading(true)
    getReportOptions('jdmaster', { dept_id: value })
      .then(response => {
        if (!response?.status) throw new Error(response?.message)
        setDesignations([ALL, ...(response.data.designations || [])])
      })
      .catch(error => setErrors({ designation: error?.message || 'Unable to load the designations.' }))
      .finally(() => setDesignationsLoading(false))
  }

  const getData = () => {
    const next = {}
    if (!department) next.department = 'Please select the department.'
    if (!designation) next.designation = 'Please select the designation.'
    setErrors(next)
    if (Object.keys(next).length) return
    openJdMasterReport({ dept_id: department, desig_id: designation })
  }

  return (
    <ReportFilterPage
      title='JD Master'
      loading={loading}
      loadError={loadError}
      onGetData={getData}
      onCancel={() => changeDepartment('')}
    >
      <ReportField label='Department' error={errors.department}>
        <SDLReactSelect value={department} options={options?.departments || []} placeholder='Please Select' onChange={changeDepartment} />
      </ReportField>
      <ReportField label='Designation' error={errors.designation}>
        <SDLReactSelect
          value={designation}
          options={designations}
          placeholder={designationsLoading ? 'Loading...' : 'Please Select'}
          isDisabled={!department || designationsLoading}
          onChange={value => {
            setDesignation(value || '')
            setErrors(current => ({ ...current, designation: '' }))
          }}
        />
      </ReportField>
    </ReportFilterPage>
  )
}

export default JdMasterReport
