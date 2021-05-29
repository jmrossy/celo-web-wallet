import { ipcRenderer } from 'electron'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { Dispatch } from 'redux'
import { validateWalletConnectForm } from 'src/features/walletConnect/utils'
import { initializeWcClient } from 'src/features/walletConnect/walletConnectSlice'
import { logger } from 'src/utils/logger'

export function useDeepLinkHandler() {
  const dispatch = useDispatch()
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
  const params = new URLSearchParams(url.search)

  // WalletConnect URI
  if (params.has('wc-uri')) {
    logger.info('WalletConnect URI found in URL')
    const uri = decodeURIComponent(params.get('wc-uri') || '')
    const validation = validateWalletConnectForm({ uri })
    if (validation.isValid) dispatch(initializeWcClient(uri))
  }
}
