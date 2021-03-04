import { transparentButtonStyles } from 'src/components/buttons/Button'
import { Tooltip } from 'src/components/Tooltip'
import { Color } from 'src/styles/Color'
import { Styles } from 'src/styles/types'
import { shortenAddress } from 'src/utils/addresses'
import { tryClipboardSet } from 'src/utils/clipboard'

interface ButtonProps {
  address: string
  length: 'short' | 'full'
  styles?: Styles
}

export function CopiableAddress(props: ButtonProps) {
  const { address, length, styles } = props
  const text =
    length === 'full' ? address.toUpperCase() : shortenAddress(address, true).toUpperCase()

  const onClick = async () => {
    await tryClipboardSet(address)
  }

  return (
    <Tooltip content="Click to copy">
      <button css={[defaultStyle, styles]} onClick={onClick} type="button">
        {text}
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
