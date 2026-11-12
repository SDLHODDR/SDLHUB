import { useCallback, useEffect, useMemo, useState } from 'react'
import { getCareersSession, logoutCandidate } from './services/careersApi'
import { CareersAuthContext } from './careersAuthContext'

/* Candidate session of the careers portal (independent of the employee login). */
export const CareersAuthProvider = ({ children }) => {
  const [candidate, setCandidate] = useState(null)
  const [countries, setCountries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    const result = await getCareersSession()
    if (result?.status) {
      setCandidate(result.data?.loggedIn ? result.data.candidate : null)
      setError('')
    } else {
      setError(result?.message || 'Unable to reach the server.')
    }
    return result
  }, [])

  useEffect(() => {
    let active = true
    getCareersSession().then(result => {
      if (!active) return
      if (result?.status) {
        setCandidate(result.data?.loggedIn ? result.data.candidate : null)
        setCountries(result.data?.countries || [])
      } else {
        setError(result?.message || 'Unable to reach the server.')
      }
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [])

  const logout = useCallback(async () => {
    await logoutCandidate()
    setCandidate(null)
  }, [])

  const value = useMemo(
    () => ({ candidate, setCandidate, countries, loading, error, refresh, logout }),
    [candidate, countries, loading, error, refresh, logout]
  )

  return <CareersAuthContext.Provider value={value}>{children}</CareersAuthContext.Provider>
}

