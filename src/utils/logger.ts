/* eslint-disable no-console */

import { config } from '../config'

export const logger = {
  debug: (...args: any[]) => config.debug && console.debug(...args),
  info: (...args: any[]) => config.debug && console.info(...args),
  warn: (...args: any[]) => console.warn(...args),
  error: (...args: any[]) => console.error(...args),
}
