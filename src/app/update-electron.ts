import { ipcRenderer } from 'electron'
import { logger } from 'src/utils/logger'

ipcRenderer.on('update_downloaded', () => {
  ipcRenderer.removeAllListeners('update_downloaded')
  const updateBanner = document.getElementById('update-banner')
  if (!updateBanner) {
    logger.error('No update banner found')
    return
  }
  updateBanner.style.display = 'block'
})

export function restartApp() {
  ipcRenderer.send('restart_app')
}
