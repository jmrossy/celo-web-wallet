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
  resetSagaOnSuccess = true
) {
  const { status, error } = _useSagaStatus(sagaName, resetSagaOnSuccess, onSuccess)

  const { showErrorModal } = useModal()
  useEffect(() => {
    if (status === SagaStatus.Failure) {
      showErrorModal(
        errorTitle,
        errorMsg || 'Something went wrong, sorry! Please try again.',
        error
      )
    }
  }, [status, error])

  return status
}

// Same as above but without the error modal
export function useSagaStatusNoModal(
  sagaName: string,
  onSuccess?: () => void,
  resetSagaOnSuccess = true
) {
  const sagaState = _useSagaStatus(sagaName, resetSagaOnSuccess, onSuccess)
  return sagaState.status
}

function _useSagaStatus(sagaName: string, resetSagaOnSuccess: boolean, onSuccess?: () => void) {
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

  useEffect(() => {
    if (status === SagaStatus.Success) {
      if (resetSagaOnSuccess) dispatch(saga.actions.reset(null))
      if (onSuccess) onSuccess()
    }
  }, [status, error])

  useEffect(() => {
    return () => {
      if (resetSagaOnSuccess) dispatch(saga.actions.reset(null))
    }
  }, [])

  return sagaState
}
