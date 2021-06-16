import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from 'src/app/rootReducer'
import { monitoredSagas } from 'src/app/rootSaga'
import { useModal } from 'src/components/modal/useModal'
import { SagaStatus } from 'src/utils/saga'

// Convenience hook to get the status + error of an active saga
// And then show a generic error modal if something goes wrong
export function useSagaStatus(
  sagaName: string,
  errorTitle: string,
  errorMsg?: string,
  onSuccess?: () => void,
  resetSagaOnSuccess = true,
  showModalOnError = true
) {
  const dispatch = useDispatch()
  const sagaState = useSelector((s: RootState) => s.saga[sagaName])
  if (!sagaState) {
    throw new Error(`No saga state found, is sagaName valid? Name: ${sagaName}`)
  }

  const saga = monitoredSagas[sagaName]
  if (!saga) {
    throw new Error(`No saga found, is sagaName valid? Name: ${sagaName}`)
  }

  const { status, error } = sagaState

  const { showErrorModal } = useModal()
  useEffect(() => {
    if (status === SagaStatus.Success) {
      if (resetSagaOnSuccess) dispatch(saga.actions.reset(null))
      if (onSuccess) onSuccess()
    } else if (status === SagaStatus.Failure && showModalOnError) {
      showErrorModal(
        errorTitle,
        errorMsg || 'Something went wrong, sorry! Please try again.',
        error
      )
    }
  }, [status, error])

  useEffect(() => {
    return () => {
      if (resetSagaOnSuccess) dispatch(saga.actions.reset(null))
    }
  }, [])

  return status
}
