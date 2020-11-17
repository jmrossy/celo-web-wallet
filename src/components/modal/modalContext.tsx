import { createContext, useState } from 'react'
import { Modal, ModalAction, ModalProps } from 'src/components/modal/modal'

type showAsyncFunc = (props: ModalProps) => Promise<ModalAction | null>

export interface IModalContext {
  showModal: showAsyncFunc
  showLoadingModal: (head: string) => void
  closeModal: () => void
  setModalContent: (value: any) => void
  modalProps: ModalProps | null
}

//The context in question.  Values
export const ModalContext = createContext<IModalContext>({
  showModal: () => {
    throw Error('Missing modal context')
  },
  showLoadingModal: () => {
    throw Error('Missing modal context')
  },
  closeModal: () => {
    throw Error('Missing modal context')
  },
  setModalContent: () => {
    throw Error('Missing modal context')
  },
  modalProps: null,
})

export const ModalProvider = ({ children }: any) => {
  const [modal, setModal] = useState<ModalProps | null>(null)
  const [content, setContent] = useState<any>(null)

  const showModal = async (props: ModalProps) => {
    const isDismissable = !props.isLoading && Boolean(props.onClose || !props.onActionClick)
    return new Promise<ModalAction | null>((resolve) => {
      const asyncProps = {
        ...props,
        onClose: isDismissable
          ? () => {
              closeModal()
              resolve(null)
            }
          : undefined,
        onActionClick: (action: ModalAction) => {
          if (props.onActionClick) {
            props.onActionClick(action)
          } else {
            closeModal()
          }
          resolve(action)
        },
      }
      setModal(asyncProps)
    })
  }

  const closeModal = () => {
    setModal(null)
  }

  const showLoadingModal = (head: string) => {
    const props: ModalProps = { head: head, isLoading: true }
    setModal(props)
  }

  const myContext: IModalContext = {
    modalProps: modal,
    showModal,
    showLoadingModal,
    closeModal,
    setModalContent: setContent,
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
