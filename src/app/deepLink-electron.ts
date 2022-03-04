import { ipcRenderer } from 'electron'
import { useEffect } from 'react'
import { Dispatch } from 'redux'
import { useAppDispatch } from 'src/app/hooks'
import { validateWalletConnectForm } from 'src/features/walletConnect/utils'
import { initializeWcClient } from 'src/features/walletConnect/walletConnectSlice'
import { logger } from 'src/utils/logger'
import { trimSlashes } from 'src/utils/string'

export function useDeepLinkHandler() {
  const dispatch = useAppDispatch()
  useEffect(() => {
    const deepLink = ipcRenderer.sendSync('get-app-deeplink')
    if (deepLink) handleDeepLink(deepLink, dispatch)
    const onNewDeeplink = (event: any, message: any) => {
      handleDeepLink(message, dispatch)
    }
    ipcRenderer.on('new-app-deeplink', onNewDeeplink)
    return () => {
      ipcRenderer.off('new-app-deeplink', onNewDeeplink)
    }
  }, [])
}

function handleDeepLink(link: string, dispatch: Dispatch) {
  if (!link || typeof link !== 'string' || !link.startsWith('celowallet://')) {
    logger.debug('Ignoring invalid deep link', link)
    return
  }

  const url = new URL(link)
  const path = trimSlashes(url.pathname)

  // WalletConnect URI
  if (path === 'wc' && url.searchParams.has('uri')) {
    logger.info('WalletConnect URI found in URL')
    const uri = decodeURIComponent(url.searchParams.get('uri') || '')
    const validation = validateWalletConnectForm({ uri })
    if (validation.isValid) dispatch(initializeWcClient(uri))
  }
}
