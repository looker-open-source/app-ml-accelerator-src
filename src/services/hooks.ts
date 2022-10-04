import { useRef, useEffect} from 'react'

export const useUnload = (fn => {
    const cb = useRef(fn);
  
    useEffect(() => {
      window.addEventListener('beforeunload', cb.current);
      return () => window.removeEventListener('beforeunload', cb.current)
    }, [cb]);
  })