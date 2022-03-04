import { useAppDispatch, useAppSelector } from 'src/app/hooks'
import { useNavHintModal } from 'src/components/modal/useNavHintModal'
import { StakeActionType } from 'src/features/validators/types'
import { dismissActivatableReminder } from 'src/features/validators/validatorsSlice'

export function useVoteActivationCheck() {
  const dispatch = useAppDispatch()

  const hasActivatable = useAppSelector((state) => state.validators.hasActivatable)
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
