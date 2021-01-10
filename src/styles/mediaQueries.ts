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
  1200: '@media (min-width: 1200px)',
}

interface WindowSize {
  width?: number
  height?: number
}

// From https://usehooks.com/useWindowSize/
export function useWindowSize() {
  // Initialize state with undefined width/height so server and client renders match
  // Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: undefined,
    height: undefined,
  })

  useEffect(() => {
    // Handler to call on window resize
    function handleResize() {
      // Set window width/height to state
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    // Add event listener
    window.addEventListener('resize', handleResize)
    // Call handler right away so state gets updated with initial window size
    handleResize()
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
