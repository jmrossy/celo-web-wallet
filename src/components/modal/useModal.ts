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
    return context.showModal(modalProps)
  }

  const showErrorModal = (
    head: string,
    error: string,
    body: string | null | undefined = undefined
  ) => {
    const modalProps: ModalProps = {
      head,
      subHead: error,
      body: body ?? undefined,
      severity: 'error',
      actions: ModalOkAction,
      onClose: context.closeModal,
      onActionClick: context.closeModal,
    }
    return context.showModal(modalProps)
  }

  const showModalWithContent = (
    head: string,
    content: any,
    actions: ModalAction | ModalAction[] | undefined | null,
    subHead: string | undefined | null = undefined,
    onActionClick: ModalActionCallback | undefined | null = undefined,
    dismissable = true
  ) => {
    const modalProps: ModalProps = {
      head,
      subHead: subHead ?? undefined,
      onClose: dismissable ? context.closeModal : undefined,
      actions: actions ?? undefined,
      onActionClick: onActionClick,
    }
    return context.showModal(modalProps, content)
  }

  const showActionsModal = (
    head: string,
    body: string,
    actions: ModalAction | ModalAction[] | undefined = undefined,
    onActionClick: ModalActionCallback | undefined | null = undefined,
    subHead: string | undefined | null = undefined,
    size: ModalSize | null = undefined,
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

    return context.showModal(modalProps)
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

    return context.showModal(modalProps)
  }

  return {
    showModal,
    showWorkingModal,
    showErrorModal,
    showActionsModal,
    showModalWithContent,
    closeModal: context.closeModal,
  }
}
