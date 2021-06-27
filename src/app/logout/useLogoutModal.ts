import { useDispatch } from 'react-redux'
import type { Dispatch } from 'redux'
import { logoutActions } from 'src/app/logout/logout'
import { showModalFunctionAsync, useModal } from 'src/components/modal/useModal'
import { Color } from 'src/styles/Color'

export function useLogoutModal() {
  const dispatch = useDispatch()
  const { showModalAsync } = useModal()
  return () => showLogoutModal(showModalAsync, dispatch)
}

export async function showLogoutModal(
  showModalAsync: showModalFunctionAsync,
  dispatch: Dispatch<any>
) {
  const answer = await showModalAsync({
    head: 'LOGOUT WARNING',
    subHead: 'Are you sure you want to logout?',
    body: 'All keys and information for ALL OF YOUR ACCOUNTS will be completely removed from this device. If you have local accounts, back up their Account Keys first.',
    actions: [
      { key: 'cancel', label: 'Cancel', color: Color.altGrey },
      { key: 'logout', label: 'Log me out', color: Color.primaryRed },
    ],
  })
  if (answer && answer.key === 'logout') {
    dispatch(logoutActions.trigger())
  }
}
