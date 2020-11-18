import { useState } from 'react'
import { Button } from 'src/components/Button'
import Elipse from 'src/components/icons/celo_elipse.svg'
import { Box } from 'src/components/layout/Box'
import { ModalAction, ModalOkAction, ModalSize } from 'src/components/modal/modal'
import { useModal } from 'src/components/modal/useModal'
import { Notification } from 'src/components/Notification'
import { Color } from 'src/styles/Color'
import { invalidFeatures, useFeatureValidation } from 'src/utils/validation'

export function ModalTestScreen() {
  const [isLoading, setLoading] = useState<boolean>(false)
  const [isInvalid, setInvalid] = useState(false)
  const isBrowserValid = useFeatureValidation(isInvalid ? invalidFeatures : null)

  const actionClick = (action: ModalAction) => {
    if (action.key === 'ok' || action.key === 'close') closeModal()
    else {
      console.log('Modal Action Clicked: ', action.key)
    }
  }

  const {
    showModal,
    showWorkingModal,
    showErrorModal,
    showActionsModal,
    showModalWithContent,
    closeModal,
  } = useModal()

  const dismissLoading = () => {
    closeModal()
    setLoading(false)
  }

  const standard = () => {
    return showModal('Modal Head', 'This is your standard, run-of-the-mill modal')
  }

  const notDismissable = () => {
    void showModal(
      'Modal Head',
      'This modal cannot be dismissed by clicking on the background (and no x)',
      ModalOkAction,
      'Modal Subhead',
      null,
      null,
      false
    )
  }

  const withContent = () => {
    const content = <img src={Elipse} />
    void showModalWithContent(
      'Modal with Content',
      content,
      ModalOkAction,
      'This modal has an image for content'
    )
  }

  const withActions = async () => {
    const actions = [
      { key: 'close', label: 'Close', color: Color.primaryGrey },
      { key: 'retry', label: 'Retry', color: Color.primaryGreen },
      { key: 'undo', label: 'Undo', color: Color.accentBlue },
    ]
    await showActionsModal(
      'Modal with Actions',
      'This modal has multiple actions, and stays active unless you click close',
      actions,
      actionClick
    )
  }

  const withError = () => {
    void showErrorModal(
      'Error Modal',
      'Oops!  Something went wrong',
      "Please don't do that again, it hurt!"
    )
  }

  const withSize = (size: ModalSize) => () => {
    const content =
      size === 's'
        ? "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum." //'This is a message that will be scrunched up into a small modal and wrapped around to show the max width.'
        : size === 'm'
        ? "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum." //This is a medium-sized message that will be inbetween a small and a large size message.  It will wrap since the width of the modal is restricted by the size property'
        : "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."

    return showModal(`Size ${size} Modal`, content, ModalOkAction, undefined, size)
  }

  const withResultCapture = async () => {
    const actions = [
      { key: 'action-a', label: 'Action A', color: Color.primaryGrey },
      { key: 'action-b', label: 'Action B', color: Color.accentBlue },
      ModalOkAction,
    ]

    const result = await showModal(
      'Result Capture',
      'The showModal method is async, so you can await it, and capture the result if you wish',
      actions
    )

    void showModal('Your Choice', `You chose ${result?.label} in the previous modal`)
  }

  const working = () => {
    setLoading(true)
    void showWorkingModal('Please wait...', 'Click the button at bottom right to dismiss')
  }

  return (
    <div>
      <Notification
        message={
          isBrowserValid
            ? 'Your browser is valid'
            : 'Your browser does not support required features'
        }
        color={isBrowserValid ? Color.fillLight : Color.fillError}
        textColor={isBrowserValid ? Color.primaryGreen : Color.textError}
      />

      <Box direction="column" align="center">
        <h1 css={{ width: '100%', textAlign: 'center' }}>Browser Feature Testing</h1>
        {isInvalid && (
          <Button onClick={() => setInvalid(false)} margin="0 0 2em 0">
            Test Required Features
          </Button>
        )}
        {!isInvalid && (
          <Button onClick={() => setInvalid(true)} margin="0 0 2em 0">
            Test Invalid Features
          </Button>
        )}
      </Box>

      <Box direction="row" justify="center" styles={{ flexWrap: 'wrap' }}>
        <h1 css={{ width: '100%', textAlign: 'center' }}>Modal Testing</h1>
        <Button onClick={standard} margin="1em">
          Standard
        </Button>
        <Button onClick={notDismissable} margin="1em">
          Not Dismissable
        </Button>
        <Button onClick={withContent} margin="1em">
          Modal with content
        </Button>
        <Button onClick={withActions} margin="1em">
          Modal with more actions
        </Button>
        <Button onClick={withError} margin="1em">
          Error Modal
        </Button>
        <Button onClick={withResultCapture} margin="1em">
          Result Capture
        </Button>
        <Button onClick={working} margin="1em">
          Working Modal
        </Button>
        <Button onClick={withSize('s')} margin="1em">
          Small Modal
        </Button>
        <Button onClick={withSize('m')} margin="1em">
          Medium (default) Modal
        </Button>
        <Button onClick={withSize('l')} margin="1em">
          Large Modal
        </Button>
      </Box>

      {isLoading && (
        <Button
          styles={{ position: 'absolute', bottom: 0, right: 0, zIndex: 102 }}
          onClick={dismissLoading}
        >
          Dismiss Working
        </Button>
      )}
    </div>
  )
}
