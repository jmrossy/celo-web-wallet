// See also the global media query styles in index.html

import { useEffect, useState } from 'react'

/**
 * Example usage with Emotion:
 * css={{
 *   font-size: 1.5em,
 *   [mq[480]]: {
 *     font-size: 2em,
 *   }
 * }
 */
export const mq = {
  480: '@media (min-width: 480px)',
  768: '@media (min-width: 768px)',
  1024: '@media (min-width: 1024px)',
  1200: '@media (min-width: 1200px)',
}

interface WindowSize {
  width?: number
  height?: number
}

// From https://usehooks.com/useWindowSize/
export function useWindowSize() {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: window.innerWidth,
    height: window.innerHeight,
  })

  useEffect(() => {
    // Handler to call on window resize
    const handleResize = () => {
      // Set window width/height to state
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    // Add event listener
    window.addEventListener('resize', handleResize)
    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize)
  }, []) // Empty array ensures that effect is only run on mount

  return windowSize
}

export function isWindowSizeMobile(windowWidth: number | undefined) {
  return !!(windowWidth && windowWidth < 768)
}

export function isWindowSizeSmallMobile(windowWidth: number | undefined) {
  return !!(windowWidth && windowWidth < 360)
}

export function useIsMobile() {
  const windowSize = useWindowSize()
  return isWindowSizeMobile(windowSize.width)
}
