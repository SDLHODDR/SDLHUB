import { useEffect, useState } from 'react'
import { getReportOptions } from '../../services/reportService'

/** Loads a report's dropdown options once. */
export const useReportOptions = report => {
  const [options, setOptions] = useState(null)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    let active = true
    getReportOptions(report)
      .then(response => {
        if (!response?.status) throw new Error(response?.message)
        if (active) setOptions(response.data)
      })
      .catch(error => {
        if (active) setLoadError(error?.message || 'Unable to load the report options.')
      })
    return () => {
      active = false
    }
  }, [report])

  return { options, loadError, loading: !options && !loadError }
}
