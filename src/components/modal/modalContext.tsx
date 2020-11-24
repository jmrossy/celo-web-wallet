import { createContext, useRef, useState } from 'react'
import { Modal, ModalAction, ModalProps } from 'src/components/modal/modal'
import { logger } from 'src/utils/logger'

interface IModalContext {
  showModal: (props: ModalProps, content?: any) => void
  showModalAsync: (props: ModalProps, content?: any) => Promise<ModalAction | null>
  closeModal: () => void
  modalProps: ModalProps | null
}

//Create and Export the context
export const ModalContext = createContext<IModalContext>({
  showModal: () => {
    throw Error('Missing modal context')
  },
  showModalAsync: () => {
    throw Error('Missing modal context')
  },
  closeModal: () => {
    throw Error('Missing modal context')
  },
  modalProps: null,
})

//A fallback close func that will warn if close is called when nothing is open
const closeFallback = (action?: ModalAction | null) =>
  logger.warn('attempted to close modal when no modal was open. action: ', action)

//A provider that will supply modal functionality to all children
export const ModalProvider = ({ children }: any) => {
  const [modal, setModal] = useState<ModalProps | null>(null)
  const [content, setContent] = useState<any>(null)
  const closeRef = useRef<(action?: ModalAction | null) => void>(closeFallback)

  const showModal = (props: ModalProps, content: any = null) => {
    const isDismissable = !props.isLoading && Boolean(props.onClose)
    if (content) setContent(content)
    closeRef.current = () => {
      setModal(null)
      setContent(null)
      closeRef.current = closeFallback //reset the ref
    }

    const modalProps = {
      ...props,
      onClose: isDismissable ? closeRef.current : undefined,
      onActionClick: props.onActionClick ? props.onActionClick : closeRef.current, //if there are actions, and no onActionClick, have the action close the modal
    }

    setModal(modalProps)
  }

  const showModalAsync = async (props: ModalProps, content: any = null) => {
    const isDismissable = !props.isLoading && Boolean(props.onClose)
    if (content) setContent(content)

    const modalPromise = new Promise<ModalAction | null>((resolve) => {
      closeRef.current = (action?: ModalAction | null) => {
        setModal(null)
        setContent(null)
        closeRef.current = closeFallback //reset the ref
        resolve(action)
      }

      const asyncProps = {
        ...props,
        onClose: isDismissable ? closeRef.current : undefined,
        onActionClick: props.onActionClick ? props.onActionClick : closeRef.current, //if there are actions, and no onActionClick, have the action close the modal
      }

      setModal(asyncProps)
    })

    return modalPromise
  }

  const myContext: IModalContext = {
    modalProps: modal,
    showModal,
    showModalAsync,
    closeModal: () => closeRef.current(),
  }

  return (
    <ModalContext.Provider value={myContext}>
      <div>
        {children}
        {modal && <Modal {...modal}>{content}</Modal>}
      </div>
    </ModalContext.Provider>
  )
}
