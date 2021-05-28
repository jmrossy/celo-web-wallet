import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { validateWalletConnectForm } from 'src/features/walletConnect/utils'
import { initializeWcClient } from 'src/features/walletConnect/walletConnectSlice'
import { logger } from 'src/utils/logger'

export function useDeepLinkHandler() {
  const [searchParams] = useSearchParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // WalletConnect URI
    if (searchParams.has('wc-uri')) {
      logger.info('WalletConnect URI found in URL')
      const uri = decodeURIComponent(searchParams.get('wc-uri') || '')
      const validation = validateWalletConnectForm({ uri })
      if (validation.isValid) dispatch(initializeWcClient(uri))
    }
    if (location.search) {
      // For now, the app doesn't use search params for anything else
      // so it's safe to clear them. This may need to change eventually
      // Note, not using setSearchParams here because it leaves a ? in the url
      navigate(location.pathname, { replace: true })
    }
  }, [])
}
