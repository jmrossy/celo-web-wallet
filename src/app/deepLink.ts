import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { validateWalletConnectForm } from '../features/walletConnect/utils'
import { initializeWcClient } from '../features/walletConnect/walletConnectSlice'
import { logger } from '../utils/logger'
import { trimSlashes } from '../utils/string'

export function useDeepLinkHandler() {
  const [searchParams] = useSearchParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // WalletConnect URI
    const path = trimSlashes(location.pathname)
    if (path === 'wc' && searchParams.has('uri')) {
      logger.info('WalletConnect URI found in URL')
      const uri = decodeURIComponent(searchParams.get('uri') || '')
      const validation = validateWalletConnectForm({ uri })
      if (validation.isValid) dispatch(initializeWcClient(uri))
      // For now, the app doesn't use search params for anything else
      // so it's safe to clear them. This may need to change eventually
      // Note, not using setSearchParams here because it leaves a ? in the url
      navigate('/', { replace: true })
    }
  }, [])
}
