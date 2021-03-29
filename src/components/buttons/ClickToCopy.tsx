import { transparentButtonStyles } from 'src/components/buttons/Button'
import { Tooltip } from 'src/components/Tooltip'
import { Color } from 'src/styles/Color'
import { Styles } from 'src/styles/types'
import { tryClipboardSet } from 'src/utils/clipboard'
import { trimToLength } from 'src/utils/string'

interface ButtonProps {
  text: string
  copyText?: string
  maxLength?: number
  styles?: Styles
}

export function ClickToCopy(props: ButtonProps) {
  const { text, copyText, maxLength, styles } = props

  const onClick = async () => {
    await tryClipboardSet(copyText ?? text)
  }

  const displayText = maxLength ? trimToLength(text, maxLength) : text

  return (
    <Tooltip content="Click to copy">
      <button css={[defaultStyle, styles]} onClick={onClick} type="button">
        {displayText}
      </button>
    </Tooltip>
  )
}

const defaultStyle: Styles = {
  ...transparentButtonStyles,
  color: Color.primaryBlack,
  ':hover': {
    opacity: 0.8,
  },
  textRendering: 'geometricprecision',
}
