import { ipcRenderer } from 'electron'
import { logger } from 'src/utils/logger'

export function useDeepLinkHandler() {
  // TODO
  ipcRenderer.on('new-app-deeplink', (event, message) => {
    logger.info('New app deeplink received', message)
  })
  const deepLink = ipcRenderer.sendSync('get-app-deeplink')
  if (deepLink) logger.info('App initial deeplink found', deepLink)
  else logger.debug('No initial deeplink found')
  return deepLink
}
