import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from 'src/app/rootReducer'
import { useNavHintModal } from 'src/components/modal/useNavHintModal'
import { StakeActionType } from 'src/features/validators/types'
import { dismissActivatableReminder } from 'src/features/validators/validatorsSlice'

export function useVoteActivationCheck() {
  const dispatch = useDispatch()

  const hasActivatable = useSelector((state: RootState) => state.validators.hasActivatable)
  const showActivateModal =
    hasActivatable.status &&
    hasActivatable.groupAddresses.length &&
    !hasActivatable.reminderDismissed

  useNavHintModal(
    showActivateModal,
    'Activate Your Votes!',
    'You have pending validator votes that are ready to be activated. They must be activated to start earning staking rewards.',
    'Activate',
    '/stake',
    { groupAddress: hasActivatable.groupAddresses[0], action: StakeActionType.Activate },
    () => {
      dispatch(dismissActivatableReminder())
    }
  )
}
