import { useDispatch } from 'react-redux'
import { logoutActions } from 'src/app/logout/logout'
import { useModal } from 'src/components/modal/useModal'
import { Color } from 'src/styles/Color'

export function useLogoutModal() {
  const dispatch = useDispatch()
  const { showModalAsync } = useModal()
  const warning =
    'Do not logout before copying your Account Key (mnemonic phrase) to a safe place. Your account will be completely removed from this device.'
  const onLogout = async () => {
    const answer = await showModalAsync(
      'LOGOUT WARNING',
      warning,
      [
        { key: 'cancel', label: 'Cancel', color: Color.altGrey },
        { key: 'logout', label: 'Log me out', color: Color.primaryRed },
      ],
      'Backup your Account Key first!'
    )
    if (answer && answer.key === 'logout') {
      dispatch(logoutActions.trigger())
    }
  }
  return onLogout
}
