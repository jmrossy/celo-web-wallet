import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from 'src/app/hooks'
import { monitoredSagas } from 'src/app/rootSaga'
import { isSignerLedger } from 'src/blockchain/signer'
import { ModalOkAction } from 'src/components/modal/modal'
import { useModal } from 'src/components/modal/useModal'
import { estimateFeeActions, estimateFeeSagaName } from 'src/features/fees/estimateFee'
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

  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const numSignatures = useAppSelector((state) => state.txFlow.numSignatures)

  const saga = monitoredSagas[sagaName]
  if (!saga) throw new Error(`No saga found, is sagaName valid? Name: ${sagaName}`)
  const sagaState = useAppSelector((s) => s.saga[sagaName])
  if (!sagaState) throw new Error(`No saga state found, is sagaName valid? Name: ${sagaName}`)
  const { status: sagaStatus, error: sagaError } = sagaState

  // Also check fee status so errors from fee calculation can be surfaced as well
  const feeSagaState = useAppSelector((s) => s.saga[estimateFeeSagaName])
  const feeSagaStatus = feeSagaState.status

  const { showLoadingModal, showSuccessModal, showErrorModal, showModalWithContent } = useModal()

  const onNeedSignature = (index: number) => {
    const modalText = reqSignatureMsg ?? ['Confirm the transaction on your Ledger']
    let modalTitle = 'Signature Required'
    if (signaturesNeeded > 1) modalTitle += ` (${index + 1}/${signaturesNeeded})`
    showModalWithContent({
      head: modalTitle,
      content: (
        <SignatureRequiredModal text={modalText} signWarningLabel={reqSignatureWarningLabel} />
      ),
      dismissable: false,
    })
  }

  const onSuccess = () => {
    if (customSuccessModal) {
      showModalWithContent({
        head: customSuccessModal.title,
        content: customSuccessModal.content,
        actions: ModalOkAction,
      })
    } else {
      showSuccessModal(successTitle, successMsg)
    }
    dispatch(saga.actions.reset())
    dispatch(estimateFeeActions.reset())
    dispatch(txFlowSent())
    navigate('/')
  }

  const onFailure = (error: string | undefined) => {
    showErrorModal(errorTitle, errorMsg || 'Something went wrong, sorry! Please try again.', error)
    dispatch(saga.actions.reset())
    dispatch(estimateFeeActions.reset())
    dispatch(txFlowFailed(error ?? null))
  }

  const onFeeFailure = () => {
    showErrorModal(
      'Fee Estimation Failed',
      undefined,
      'This transaction may be invalid or you may lack the funds to complete it.'
    )
    dispatch(saga.actions.reset())
    dispatch(estimateFeeActions.reset())
    dispatch(txFlowFailed('Fee estimation failed'))
  }

  useEffect(() => {
    if (sagaStatus === SagaStatus.Started) {
      if (isSignerLedger() && numSignatures < signaturesNeeded) onNeedSignature(numSignatures)
      else showLoadingModal(loadingTitle)
    } else if (sagaStatus === SagaStatus.Success) {
      onSuccess()
    } else if (sagaStatus === SagaStatus.Failure) {
      onFailure(sagaError?.toString())
    } else if (feeSagaStatus === SagaStatus.Failure) {
      onFeeFailure()
    }
  }, [sagaStatus, sagaError, feeSagaStatus, numSignatures, signaturesNeeded])

  return { status: sagaStatus, isWorking: sagaStatus === SagaStatus.Started }
}
