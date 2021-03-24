import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router'
import { RootState } from 'src/app/rootReducer'
import { monitoredSagas } from 'src/app/rootSaga'
import { isSignerLedger } from 'src/blockchain/signer'
import { ModalOkAction } from 'src/components/modal/modal'
import { useModal } from 'src/components/modal/useModal'
import { SignatureRequiredModal } from 'src/features/ledger/animation/SignatureRequiredModal'
import { txFlowFailed, txFlowSent } from 'src/features/txFlow/txFlowSlice'
import { SagaStatus } from 'src/utils/saga'

interface TxFlowStatusModalsParams {
  sagaName: string
  signaturesNeeded: number
  loadingTitle: string
  successTitle: string
  successMsg: string
  errorTitle: string
  errorMsg: string
  reqSignatureMsg?: string[]
  reqSignatureWarningLabel?: string
  customSuccessModal?: { title: string; content: any }
}

// Shows a request signature to loading to success/failure
// modals based on saga status updates
export function useTxFlowStatusModals(params: TxFlowStatusModalsParams) {
  const {
    sagaName,
    signaturesNeeded,
    loadingTitle,
    successTitle,
    successMsg,
    errorTitle,
    errorMsg,
    reqSignatureMsg,
    reqSignatureWarningLabel,
    customSuccessModal,
  } = params

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { numSignatures } = useSelector((state: RootState) => state.txFlow)

  const sagaState = useSelector((s: RootState) => s.saga[sagaName])
  if (!sagaState) {
    throw new Error(`No saga state found, is sagaName valid? Name: ${sagaName}`)
  }
  const saga = monitoredSagas[sagaName]
  if (!saga) {
    throw new Error(`No saga found, is sagaName valid? Name: ${sagaName}`)
  }
  const { status: sagaStatus, error: sagaError } = sagaState

  const { showSuccessModal, showErrorModal, showWorkingModal, showModalWithContent } = useModal()

  const onNeedSignature = (index: number) => {
    const modalText = reqSignatureMsg ?? ['Confirm the transaction on your Ledger']
    let modalTitle = 'Signature Required'
    if (signaturesNeeded > 1) modalTitle += ` (${index + 1}/${signaturesNeeded})`
    showModalWithContent(
      modalTitle,
      <SignatureRequiredModal text={modalText} signWarningLabel={reqSignatureWarningLabel} />,
      null,
      null,
      null,
      false
    )
  }

  const onSuccess = () => {
    if (customSuccessModal) {
      showModalWithContent(customSuccessModal.title, customSuccessModal.content, ModalOkAction)
    } else {
      showSuccessModal(successTitle, successMsg)
    }
    dispatch(saga.actions.reset(null))
    dispatch(txFlowSent())
    navigate('/')
  }

  const onFailure = (error: string | undefined) => {
    showErrorModal(errorTitle, errorMsg || 'Something went wrong, sorry! Please try again.', error)
    dispatch(saga.actions.reset(null))
    dispatch(txFlowFailed(error ?? null))
  }

  useEffect(() => {
    if (sagaStatus === SagaStatus.Started) {
      if (isSignerLedger() && numSignatures < signaturesNeeded) onNeedSignature(numSignatures)
      else showWorkingModal(loadingTitle)
    } else if (sagaStatus === SagaStatus.Success) {
      onSuccess()
    } else if (sagaStatus === SagaStatus.Failure) {
      onFailure(sagaError?.toString())
    }
  }, [sagaStatus, sagaError, numSignatures, signaturesNeeded])

  return { status, isWorking: sagaStatus === SagaStatus.Started }
}
