import { useDispatch, useSelector } from 'react-redux'
import { logoutActions } from 'src/app/logout/logout'
import type { RootState } from 'src/app/rootReducer'
import { SignerType } from 'src/blockchain/signer'
import { useModal } from 'src/components/modal/useModal'
import { Color } from 'src/styles/Color'

export function useLogoutModal() {
  //TODO rework text here for multi-account
  const dispatch = useDispatch()
  const signerType = useSelector((s: RootState) => s.wallet.type)
  const { showModalAsync } = useModal()
  const subHead =
    signerType === SignerType.Ledger
      ? 'Are you sure you want to logout?'
      : 'Backup your Account Key first!'
  const body =
    signerType === SignerType.Ledger
      ? 'Your account information will be completely removed from this device.'
      : 'Do not logout before copying your Account Key (seed phrase) to a safe place. Your account will be completely removed from this device.'

  const onLogout = async () => {
    const answer = await showModalAsync({
      head: 'LOGOUT WARNING',
      subHead,
      body,
      actions: [
        { key: 'cancel', label: 'Cancel', color: Color.altGrey },
        { key: 'logout', label: 'Log me out', color: Color.primaryRed },
      ],
    })
    if (answer && answer.key === 'logout') {
      dispatch(logoutActions.trigger())
    }
  }
  return onLogout
}
