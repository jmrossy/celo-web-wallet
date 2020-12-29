import { PropsWithChildren, ReactElement } from 'react'
import QuestionIcon from 'src/components/icons/question_mark.svg'
import { Box } from 'src/components/layout/Box'
import { ModalOkAction } from 'src/components/modal/modal'
import { useModal } from 'src/components/modal/useModal'
import { Tooltip, TooltipProps } from 'src/components/Tooltip'
import { Stylesheet } from 'src/styles/types'

interface IconProps {
  width?: string | number
  margin?: string | number
  modal?: {
    head: string
    content: ReactElement
  }
  tooltip?: TooltipProps
}

export function HelpIcon(props: IconProps) {
  const { width, margin, tooltip, modal } = props
  const styles = { ...style.iconStyle, width: width ?? '1.1em' }

  const { showModalWithContent } = useModal()

  if (tooltip) {
    return (
      <Tooltip {...tooltip} margin={margin}>
        <img src={QuestionIcon} css={styles} />
      </Tooltip>
    )
  }

  if (modal) {
    const onClick = () => {
      showModalWithContent(modal.head, modal.content, ModalOkAction)
    }
    return (
      <button onClick={onClick} css={[style.button, { margin }]} type="button">
        <img src={QuestionIcon} css={styles} />
      </button>
    )
  }

  return null
}

export function BasicHelpIconModal(props: PropsWithChildren<any>) {
  return (
    <Box direction="column" align="center" margin="0.5em 0 0 0" styles={style.helpModalContainer}>
      {props.children}
    </Box>
  )
}

const style: Stylesheet = {
  tooltip: {
    cursor: 'help',
  },
  button: {
    padding: 0,
    background: 'none',
    border: 'none',
    outline: 'none',
    cursor: 'pointer',
    ':hover': {
      opacity: 0.8,
    },
  },
  iconStyle: {
    paddingLeft: '0.25em',
    marginBottom: '-0.25em',
  },
  helpModalContainer: {
    p: {
      fontSize: '1em',
      textAlign: 'center',
      maxWidth: '25em',
      lineHeight: '1.6em',
      margin: '1em 0 0 0',
    },
  },
}
