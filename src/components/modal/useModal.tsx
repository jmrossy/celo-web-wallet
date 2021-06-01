import { ReactElement, useContext } from 'react'
import {
  ModalAction,
  ModalActionCallback,
  ModalOkAction,
  ModalProps,
  ModalSize,
  SuccessModalContent,
} from 'src/components/modal/modal'
import { ModalContext } from 'src/components/modal/modalContext'
import { errorToString } from 'src/utils/validation'

export interface ModalWithContentProps {
  head: string
  headIcon?: ReactElement | null
  subHead?: string | null
  content: any
  actions?: ModalAction | ModalAction[] | null
  onActionClick?: ModalActionCallback | null
  dismissable?: boolean | null
}

export function useModal() {
  const context = useContext(ModalContext)

  const showLoadingModal = (head: string, subHead?: string | null) => {
    const modalProps: ModalProps = {
      type: 'loading',
      head: head,
      subHead: subHead ?? undefined,
    }
    context.showModal(modalProps)
  }

  const showSuccessModal = (head: string, subHead?: string | null) => {
    const modalProps: ModalProps = {
      head,
      subHead: subHead ?? undefined,
      onClose: context.closeModal,
      actions: ModalOkAction,
      onActionClick: context.closeModal,
    }
    context.showModal(modalProps, <SuccessModalContent />)
  }

  const showErrorModal = (head: string, subHead?: string | undefined, error?: unknown) => {
    const errorMsg = errorToString(error, 80)
    const modalProps: ModalProps = {
      head,
      subHead: subHead,
      body: errorMsg,
      severity: 'error',
      actions: ModalOkAction,
      onClose: context.closeModal,
      onActionClick: context.closeModal,
    }
    context.showModal(modalProps)
  }

  const showModalWithContent = (props: ModalWithContentProps) => {
    const modalProps: ModalProps = {
      head: props.head,
      headIcon: props.headIcon ?? undefined,
      subHead: props.subHead ?? undefined,
      onClose: props.dismissable === false ? undefined : context.closeModal,
      actions: props.actions ?? undefined,
      onActionClick: props.onActionClick,
    }
    context.showModal(modalProps, props.content)
  }

  // TODO refactor params to object bag
  const showModalAsync = (
    head: string,
    body: string,
    actions: ModalAction | ModalAction[] | undefined | null = undefined,
    subHead: string | undefined | null = undefined,
    size: ModalSize | undefined | null = undefined,
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
    size: ModalSize | undefined | null = undefined,
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
    showLoadingModal,
    showSuccessModal,
    showErrorModal,
    showModalWithContent,
    closeModal: context.closeModal,
  }
}
