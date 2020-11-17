import { Button } from 'src/components/Button'
import Elipse from 'src/components/icons/celo_elipse.svg'
import { Box } from 'src/components/layout/Box'
import { ModalAction, ModalOkAction, ModalSize } from 'src/components/modal/modal'
import { useModal } from 'src/components/modal/useModal'
import { Color } from 'src/styles/Color'

export function ModalTestScreen() {
  const actionClick = (action: ModalAction) => {
    if (action.key === 'ok' || action.key === 'close') closeModal()
    else {
      console.log('Modal Action Clicked: ', action.key)
    }
  }

  const {
    showModal,
    showLoadingModal,
    showErrorModal,
    showModalWithContent,
    closeModal,
  } = useModal(actionClick)

  const standard = () => {
    return showModal(
      'Modal Head',
      'This is your standard, run-of-the-mill modal',
      ModalOkAction,
      'Modal Subhead'
    )
  }

  const notDismissable = () => {
    void showModal(
      'Modal Head',
      'This modal cannot be dismissed by clicking on the background (and no x)',
      ModalOkAction,
      'Modal Subhead',
      undefined,
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
    ]
    const result = await showModal('Modal with Actions', 'This modal has multiple actions', actions)
    console.log('action clicked:', result)
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
        ? 'This is a message that will be scrunched up into a small modal and wrapped around to show the max width.'
        : size === 'm'
        ? 'This is a medium-sized message that will be inbetween a small and a large size message.  It will wrap since the width of the modal is restricted by the size property'
        : "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."

    return showModal(`Size ${size} Modal`, content, ModalOkAction, undefined, size)
  }

  const withAsync = async () => {
    const result = await showModal(
      'Result Capture',
      'The showModal method is async, so you can await it, and capture the result if you wish',
      ModalOkAction
    )

    console.log('Async Modal Result: ', result)
  }

  return (
    <div>
      <Box direction="column" align="center">
        <h1>Modal Testing</h1>
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
        <Button onClick={withSize('s')} margin="1em">
          Small Modal
        </Button>
        <Button onClick={withSize('l')} margin="1em">
          Large Modal
        </Button>
        <Button
          onClick={() =>
            showLoadingModal('Please wait...', "(Doesn't have to be dismissable)", true)
          }
          margin="1em"
        >
          Loading Modal
        </Button>
        <Button onClick={withAsync} margin="1em">
          Result Capture
        </Button>
      </Box>
    </div>
  )
}
