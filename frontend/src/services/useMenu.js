import { useCallback, useEffect, useState } from 'react'
import { api } from './api'

export function useMenu() {
  const [menu, setMenu] = useState(null)
  const [error, setError] = useState(null)

  const reload = useCallback(() => {
    api.getMenu().then(setMenu).catch((e) => setError(e.message))
  }, [])

  useEffect(reload, [reload])
  return { menu, error, reload }
}
