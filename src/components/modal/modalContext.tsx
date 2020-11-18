import { createContext, useState } from 'react'
import { Modal, ModalAction, ModalProps } from 'src/components/modal/modal'

interface IModalContext {
  showModal: (props: ModalProps, content?: any) => Promise<ModalAction | null>
  closeModal: () => void
  modalProps: ModalProps | null
}

//Create and Export the context
export const ModalContext = createContext<IModalContext>({
  showModal: () => {
    throw Error('Missing modal context')
  },
  closeModal: () => {
    throw Error('Missing modal context')
  },
  modalProps: null,
})

//A provider that will supply modal functionality to all children
export const ModalProvider = ({ children }: any) => {
  const [modal, setModal] = useState<ModalProps | null>(null)
  const [content, setContent] = useState<any>(null)

  const showModal = async (props: ModalProps, content: any = null) => {
    const isDismissable = !props.isLoading && Boolean(props.onClose)
    if (content) setContent(content)

    const modalPromise = new Promise<ModalAction | null>((resolve) => {
      const asyncProps = {
        ...props,
        onClose: isDismissable
          ? () => {
              closeModal()
              resolve(null)
            }
          : undefined,
        onActionClick: (action: ModalAction) => {
          props.onActionClick ? props.onActionClick(action) : closeModal()
          resolve(action)
        },
      }

      setModal(asyncProps)
      if (!isDismissable) resolve(null) //Since there's no way for a user to dismiss, don't leave the promise hanging around
    })

    return modalPromise
  }

  const closeModal = () => {
    setModal(null)
    setContent(null) //clear out content for next time
  }

  const myContext: IModalContext = {
    modalProps: modal,
    showModal,
    closeModal,
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
