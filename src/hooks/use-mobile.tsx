
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

// Additional mobile detection for native apps
export function useIsNativeMobile() {
  const [isNative, setIsNative] = React.useState(false)

  React.useEffect(() => {
    // Check if running in Capacitor
    const isCapacitor = !!(window as any).Capacitor
    // Check user agent for mobile devices
    const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    
    setIsNative(isCapacitor || isMobileUserAgent)
  }, [])

  return isNative
}
