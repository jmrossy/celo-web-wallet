import { logger } from 'src/utils/logger'

export function restartApp() {
  // No-op on web, only for electron
  logger.info('Restart app requested')
}
