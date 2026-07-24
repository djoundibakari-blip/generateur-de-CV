import { createContext, useCallback, useContext, useEffect, useState } from 'react'

const PlanContext = createContext(null)

const DEFAULT_STATE = {
  loading: true,
  authenticated: false,
  user: null,
  plan: 'FREE',
  features: [],
  creditsBalance: 0,
}

export function PlanProvider({ children }) {
  const [state, setState] = useState(DEFAULT_STATE)

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/me')
      const data = await res.json()
      setState({ ...data, loading: false })
    } catch {
      setState({ ...DEFAULT_STATE, loading: false })
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const can = (feature) => state.features.includes(feature)

  return (
    <PlanContext.Provider value={{ ...state, can, refresh }}>
      {children}
    </PlanContext.Provider>
  )
}

export function usePlan() {
  const ctx = useContext(PlanContext)
  if (!ctx) throw new Error('usePlan() doit être utilisé sous <PlanProvider>')
  return ctx
}
