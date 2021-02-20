import { useContext } from 'react'
import {
  ModalAction,
  ModalActionCallback,
  ModalOkAction,
  ModalProps,
  ModalSize,
} from 'src/components/modal/modal'
import { ModalContext } from 'src/components/modal/modalContext'

export function useModal() {
  const context = useContext(ModalContext)

  const showWorkingModal = (head: string, subHead: string | undefined | null = undefined) => {
    const modalProps: ModalProps = {
      isLoading: true,
      head: head,
      subHead: subHead ?? undefined,
    }
    context.showModal(modalProps)
  }

  const showSuccessModal = (head: string, subHead: string | undefined | null = undefined) => {
    const modalProps: ModalProps = {
      isSuccess: true,
      head: head,
      subHead: subHead ?? undefined,
      actions: ModalOkAction,
      onClose: context.closeModal,
      onActionClick: context.closeModal,
    }
    context.showModal(modalProps)
  }

  const showErrorModal = (
    head: string,
    error: string | number | unknown | undefined | null,
    body: string | null | undefined = undefined
  ) => {
    let errorMsg: string
    if (!error) {
      errorMsg = 'Unknown Error'
    } else if (typeof error === 'string') {
      errorMsg = error
    } else if (typeof error === 'number') {
      errorMsg = `Error code: ${error}`
    } else {
      errorMsg = JSON.stringify(error)
    }

    const modalProps: ModalProps = {
      head,
      subHead: errorMsg,
      body: body ?? undefined,
      severity: 'error',
      actions: ModalOkAction,
      onClose: context.closeModal,
      onActionClick: context.closeModal,
    }
    context.showModal(modalProps)
  }

  const showModalWithContent = (
    head: string,
    content: any,
    actions: ModalAction | ModalAction[] | undefined | null = undefined,
    onActionClick: ModalActionCallback | undefined | null = undefined,
    subHead: string | undefined | null = undefined,
    dismissable = true
  ) => {
    const modalProps: ModalProps = {
      head,
      subHead: subHead ?? undefined,
      onClose: dismissable ? context.closeModal : undefined,
      actions: actions ?? undefined,
      onActionClick: onActionClick,
    }
    context.showModal(modalProps, content)
  }

  const showModalAsync = (
    head: string,
    body: string,
    actions: ModalAction | ModalAction[] | undefined | null = undefined,
    subHead: string | undefined | null = undefined,
    size: ModalSize | null = undefined,
    onActionClick: ModalActionCallback | undefined | null = undefined,
    dismissable = true
  ) => {
    const modalProps: ModalProps = {
      head,
      body,
      actions: actions ?? ModalOkAction, //default to an ok button
      subHead: subHead ?? undefined,
      size: size ?? undefined,
      onActionClick: actions ? onActionClick : context.closeModal, //default to close for the Ok button
      onClose: dismissable ? context.closeModal : undefined,
    }

    return context.showModalAsync(modalProps)
  }

  const showModal = (
    head: string,
    body: string,
    actions: ModalAction | ModalAction[] | undefined | null = undefined,
    subHead: string | undefined | null = undefined,
    size: ModalSize | null = undefined,
    onActionClick: ModalActionCallback | undefined | null = undefined,
    dismissable = true
  ) => {
    const modalProps: ModalProps = {
      head,
      body,
      actions: actions ?? ModalOkAction, //default to an ok button
      subHead: subHead ?? undefined,
      size: size ?? undefined,
      onActionClick: actions ? onActionClick : context.closeModal, //default to close for the Ok button
      onClose: dismissable ? context.closeModal : undefined,
    }

    context.showModal(modalProps)
  }

  return {
    showModal,
    showModalAsync,
    showWorkingModal,
    showSuccessModal,
    showErrorModal,
    showModalWithContent,
    closeModal: context.closeModal,
  }
}
