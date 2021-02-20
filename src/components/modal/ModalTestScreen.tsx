import { useState } from 'react'
import { Button } from 'src/components/buttons/Button'
import Elipse from 'src/components/icons/celo_elipse.svg'
import { HelpIcon } from 'src/components/icons/HelpIcon'
import Lightbulb from 'src/components/icons/lightbulb.svg'
import { Box } from 'src/components/layout/Box'
import { ModalAction, ModalOkAction, ModalSize } from 'src/components/modal/modal'
import { useModal } from 'src/components/modal/useModal'
import { Notification } from 'src/components/Notification'
import { Tooltip } from 'src/components/Tooltip'
import { SignatureRequiredModal } from 'src/features/ledger/animation/SignatureRequiredModal'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
import { testInvalidFeatures, useBrowserFeatureChecks } from 'src/utils/browsers'
import { logger } from 'src/utils/logger'

export function ModalTestScreen() {
  const [isLoading, setLoading] = useState<boolean>(false)
  const [isInvalid, setInvalid] = useState(false)
  const isBrowserValid = useBrowserFeatureChecks(isInvalid ? testInvalidFeatures : null)

  const actionClick = (action: ModalAction) => {
    if (action.key === 'ok' || action.key === 'close') closeModal()
    else {
      logger.info('Modal Action Clicked: ', action.key)
    }
  }

  const {
    showModal,
    showModalAsync,
    showWorkingModal,
    showSuccessModal,
    showErrorModal,
    showModalWithContent,
    closeModal,
  } = useModal()

  const dismissLoading = () => {
    closeModal()
    setLoading(false)
  }

  const standard = () => {
    showModal('Modal Head', 'This is your standard, run-of-the-mill modal')
  }

  const notDismissable = () => {
    showModal(
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
    showModalWithContent(
      'Modal with Content',
      content,
      ModalOkAction,
      null,
      'This modal has an image for content'
    )
  }

  const withActions = async () => {
    const actions = [
      { key: 'close', label: 'Close', color: Color.primaryGrey },
      { key: 'retry', label: 'Retry', color: Color.primaryGreen },
      { key: 'undo', label: 'Undo', color: Color.accentBlue },
    ]
    await showModal(
      'Modal with Actions',
      'This modal has multiple actions, and stays active unless you click close (check console for clicked actions)',
      actions,
      'This is a subhead',
      's',
      actionClick
    )
  }

  const withError = () => {
    showErrorModal(
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

    showModal(`Size ${size} Modal`, content, ModalOkAction, undefined, size)
  }

  const withResultCapture = async () => {
    const actions = [
      { key: 'action-a', label: 'Action A', color: Color.primaryGrey },
      { key: 'action-b', label: 'Action B', color: Color.accentBlue },
      ModalOkAction,
    ]

    const result = await showModalAsync(
      'Result Capture',
      'The showModal method is async, so you can await it, and capture the result if you wish',
      actions
    )

    showModal('Your Choice', `You chose ${result?.label} in the previous modal`)
  }

  const working = () => {
    setLoading(true)
    showWorkingModal('Please wait...', 'Modal will disappear shortly')
    setTimeout(() => {
      closeModal()
      setLoading(false)
    }, 3000)
  }

  const success = () => {
    showSuccessModal('Yeahhh!!!', 'Success! It worked woohoo!')
  }

  const badClose = () => {
    closeModal() //attempt to close the modal when there isn't one open.  This will log a warning in the console
  }

  const backToBack = () => {
    showWorkingModal('Loading...', 'A dismissable modal will appear in a moment')
    setTimeout(() => {
      showSuccessModal('Nice Job!')
    }, 2000)
  }

  const ledgerSignature = () => {
    showModalWithContent(
      'Signature Required (1/2)',
      <SignatureRequiredModal text={['test modal']} />,
      null,
      null,
      null,
      false
    )
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
        <Button onClick={success} margin="1em">
          Success Modal
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
        <Button onClick={badClose} margin="1em">
          Close when not open (watch console)
        </Button>
        <Button onClick={backToBack} margin="1em">
          Show back-to-back
        </Button>
        <Button onClick={ledgerSignature} margin="1em">
          Show ledger signature modal
        </Button>
      </Box>

      <Box direction="column" justify="center" align="center">
        <h1 css={{ width: '100%', textAlign: 'center' }}>Tooltip Testing</h1>

        <Box css={{ width: '100%' }} justify="center" align="center">
          <HelpIcon
            tooltip={{ content: 'This is a HelpIcon with a tooltip', variant: 'dark' }}
            margin="1em"
          />
          <HelpIcon
            tooltip={{
              content: 'This is a HelpIcon with a tooltip on the right side',
              position: 'right',
            }}
            margin="1em"
          />
          <HelpIcon
            tooltip={{
              content: 'This is a HelpIcon with a tooltip on the left side',
              position: 'left',
              variant: 'dark',
            }}
            margin="1em"
          />
          <HelpIcon
            tooltip={{
              content: 'This is a HelpIcon with a tooltip on the bottom',
              position: 'bottom',
            }}
            margin="1em"
          />
          <HelpIcon
            tooltip={{
              content: 'This is a HelpIcon with a tooltip on the bottom left',
              position: 'bottomLeft',
            }}
            margin="1em"
          />
          <HelpIcon
            tooltip={{
              content: 'This is a HelpIcon with a tooltip on the top left',
              position: 'topLeft',
            }}
            margin="1em"
          />
          <HelpIcon
            tooltip={{
              content: 'This is a HelpIcon with a tooltip on the top right',
              position: 'topRight',
            }}
            margin="1em"
          />
          <HelpIcon
            tooltip={{
              content: 'This is a HelpIcon with a tooltip on the bottom right',
              position: 'bottomRight',
            }}
            margin="1em"
          />
        </Box>

        <Box css={{ width: '100%' }} justify="center" align="center">
          <Tooltip content="This is a button with a tooltip" margin="1em" position="top">
            <Button>Button with Tooltip</Button>
          </Tooltip>
          <Tooltip
            content="This is a button with a tooltip"
            margin="1em"
            position="left"
            variant="dark"
          >
            <Button>Left Tooltip</Button>
          </Tooltip>
          <Tooltip content="This is a button with a tooltip" margin="1em" position="right">
            <Button>Right Tooltip</Button>
          </Tooltip>
          <Tooltip
            content="This is a button with a tooltip"
            margin="1em"
            position="bottom"
            variant="dark"
          >
            <Button>Bottom Tooltip</Button>
          </Tooltip>
        </Box>

        <Box justify="center" align="center">
          <HelpIcon
            tooltip={{
              content: <img src={Lightbulb} height={32} width={32} />,
              position: 'right',
              variant: 'light',
            }}
            margin="1em"
          />
          <Tooltip
            margin="1em"
            position="topRight"
            content={
              <Box direction="column" margin="1em" align="center">
                <h3 css={{ ...Font.h2Green }}>Fancy Tooltip!</h3>
                <img src={Lightbulb} height={32} width={32} />
                <p>This tooltip has complex content</p>
                <Button onClick={working}>Click Me</Button>
              </Box>
            }
          >
            <Button>Tooltip Content</Button>
          </Tooltip>
        </Box>
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
