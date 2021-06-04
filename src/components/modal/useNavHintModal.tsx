import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ModalAction } from 'src/components/modal/modal'
import { useModal } from 'src/components/modal/useModal'
import { Color } from 'src/styles/Color'

// Show a modal with two buttons
// One to nav somewhere, other to dismiss
export function useNavHintModal(
  showShow: any,
  head: string,
  body: string,
  navLabel: string,
  navTarget: string,
  navState?: Record<string, unknown>,
  onClose?: () => void
) {
  const navigate = useNavigate()
  const { showModal, closeModal } = useModal()
  useEffect(() => {
    if (!showShow) return
    const navAction = {
      key: 'nav',
      label: navLabel,
      color: Color.primaryGreen,
    }
    const dismissAction = {
      key: 'dismiss',
      label: 'Dismiss',
      color: Color.altGrey,
    }
    const onActionClick = (action: ModalAction) => {
      if (action.key === 'nav') navigate(navTarget, navState ? { state: navState } : undefined)
      if (onClose) onClose()
      closeModal()
    }
    showModal({ head, body, actions: [navAction, dismissAction], onActionClick, size: 's' })
  }, [showShow])
}
