import { useContext } from 'react'
import {
  ModalAction,
  ModalActionCallback,
  ModalOkAction,
  ModalProps,
  ModalSize,
} from 'src/components/modal/modal'
import { ModalContext } from 'src/components/modal/modalContext'

export function useModal(
  onActionClick: ModalActionCallback | null = null
  // onClose: (() => void) | null = null
) {
  const context = useContext(ModalContext)

  const showLoadingModal = (
    head: string,
    subHead: string | undefined = undefined,
    dismissable = false
  ) => {
    const modalProps = {
      isLoading: true,
      head: head,
      subHead: subHead,
      onClose: dismissable ? closeModal : undefined,
    }
    context.setModalContent(null) //clear out any content when it's closing
    return context.showModal(modalProps)
  }

  const showErrorModal = (head: string, error: string, body: string | undefined = undefined) => {
    const modalProps: ModalProps = {
      head,
      subHead: error,
      body,
      severity: 'error',
      actions: ModalOkAction,
      onClose: closeModal,
      onActionClick: () => closeModal(),
    }
    context.setModalContent(null) //clear out any content when it's closing
    return context.showModal(modalProps)
  }

  const showModalWithContent = (
    head: string,
    content: any,
    actions: ModalAction | ModalAction[] | undefined,
    subHead: string | undefined = undefined,
    dismissable = true
  ) => {
    const modalProps: ModalProps = {
      head,
      subHead,
      onClose: dismissable ? closeModal : undefined,
      actions: actions,
      onActionClick: onActionClick,
    }
    context.setModalContent(content)
    return context.showModal(modalProps)
  }

  const closeModal = () => {
    context.closeModal()
    context.setModalContent(null) //clear out any content when it's closing
    // if (onClose) onClose()
  }

  const showModal = (
    head: string,
    body: string,
    actions: ModalAction | ModalAction[] | undefined = undefined,
    subHead: string | undefined = undefined,
    size: ModalSize = undefined,
    dismissable = true
  ) => {
    const modalProps: ModalProps = {
      head,
      body,
      actions: actions ?? ModalOkAction, //default to an ok button
      subHead,
      size,
      onActionClick: actions ? onActionClick : () => closeModal(), //default to close for the Ok button
      onClose: dismissable ? closeModal : undefined,
    }

    context.setModalContent(null)
    return context.showModal(modalProps)
  }

  return {
    showModal,
    showLoadingModal,
    showErrorModal,
    showModalWithContent,
    closeModal,
  }
}
