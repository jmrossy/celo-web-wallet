import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import { validateWalletConnectForm } from 'src/features/walletConnect/utils'
import { initializeWcClient } from 'src/features/walletConnect/walletConnectSlice'
import { logger } from 'src/utils/logger'

export function useDeepLinkHandler() {
  const [searchParams, setSearchParams] = useSearchParams()
  const dispatch = useDispatch()

  useEffect(() => {
    // WalletConnect URI
    if (searchParams.has('wc-uri')) {
      logger.info('WalletConnect URI found in URL')
      const uri = decodeURIComponent(searchParams.get('wc-uri') || '')
      const validation = validateWalletConnectForm({ uri })
      if (validation.isValid) dispatch(initializeWcClient(uri))
    }
    // For now, the app doesn't use search params for anything else
    // so it's safe to clear them. This may need to change eventually
    setSearchParams('', { replace: true })
  }, [])
}
