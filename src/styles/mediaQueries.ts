// See also the global media query styles in index.html

/**
 * Example usage with Emotion:
 * css={{
 *   font-size: 1.5rem,
 *   [mq[480]]: {
 *     font-size: 2rem,
 *   }
 * }
 */
export const mq = {
  480: '@media (min-width: 480px)',
  768: '@media (min-width: 768px)',
  1200: '@media (min-width: 1200px)',
}
