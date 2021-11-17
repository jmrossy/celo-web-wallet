import { PropsWithChildren, ReactElement } from 'react'
import { transparentButtonStyles } from '../buttons/Button'
import QuestionIcon from './icons/question_mark.svg'
import { Box } from '../layout/Box'
import { ModalOkAction } from '../modal/modal'
import { modalStyles } from '../modal/modalStyles'
import { useModal } from '../modal/useModal'
import { Tooltip, TooltipProps } from '../Tooltip'
import { Stylesheet } from '../../styles/types'

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
      showModalWithContent({ head: modal.head, content: modal.content, actions: ModalOkAction })
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
    <Box direction="column" align="center" styles={style.helpModalContainer}>
      {props.children}
    </Box>
  )
}

const style: Stylesheet = {
  tooltip: {
    cursor: 'help',
  },
  button: {
    ...transparentButtonStyles,
    ':hover': {
      opacity: 0.8,
    },
  },
  iconStyle: {
    paddingLeft: '0.25em',
    marginBottom: '-0.25em',
  },
  helpModalContainer: {
    p: modalStyles.p,
  },
}
