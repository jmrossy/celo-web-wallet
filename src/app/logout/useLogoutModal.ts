import { useAppDispatch } from 'src/app/hooks'
import { logoutActions } from 'src/app/logout/logout'
import { showModalFunctionAsync, useModal } from 'src/components/modal/useModal'
import { Color } from 'src/styles/Color'

export function useLogoutModal() {
  const dispatch = useAppDispatch()
  const { showModalAsync } = useModal()
  const triggerLogout = () => dispatch(logoutActions.trigger())
  return () => showLogoutModal(showModalAsync, triggerLogout)
}

export async function showLogoutModal(
  showModalAsync: showModalFunctionAsync,
  triggerLogout: () => void
) {
  const answer = await showModalAsync({
    head: 'WALLET RESET WARNING',
    subHead: 'Are you sure you want to logout?',
    body: 'All keys and information for ALL OF YOUR ACCOUNTS will be completely removed from this device. If you have local accounts, back up their recovery (seed) phrase first.',
    actions: [
      { key: 'cancel', label: 'Cancel', color: Color.primaryWhite },
      { key: 'logout', label: 'Log me out', color: Color.primaryRed },
    ],
  })
  if (answer && answer.key === 'logout') {
    triggerLogout()
  }
}
