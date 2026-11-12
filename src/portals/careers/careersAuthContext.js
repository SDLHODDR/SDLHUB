import { createContext, useContext } from 'react'

export const CareersAuthContext = createContext(null)

/* Candidate session of the careers portal (see CareersAuthProvider). */
export const useCareersAuth = () => useContext(CareersAuthContext)
