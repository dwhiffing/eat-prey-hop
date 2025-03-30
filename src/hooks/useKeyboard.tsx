import { useEffect } from 'react'

export const useKeyboard = (func: (e: KeyboardEvent) => void) => {
  useEffect(() => {
    document.addEventListener('keydown', func)
    return () => document.removeEventListener('keydown', func)
  }, [func])
}
