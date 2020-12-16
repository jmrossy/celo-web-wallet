import QuestionIcon from 'src/components/icons/question_mark.svg'
import { TipPositions, Tooltip } from 'src/components/Tooltip'
import { Stylesheet } from 'src/styles/types'

interface IconProps {
  tooltip: any
  margin?: string | number
  tipPosition?: TipPositions
  tipVariant?: 'light' | 'dark'
}

export const HelpIcon = (props: IconProps) => {
  const { tooltip, margin, tipPosition, tipVariant } = props

  return (
    <Tooltip
      content={tooltip}
      margin={margin ?? undefined}
      position={tipPosition}
      variant={tipVariant}
    >
      <img src={QuestionIcon} css={styles.icon} />
    </Tooltip>
  )
}

const styles: Stylesheet = {
  icon: {
    width: '1.1em',
    paddingLeft: '0.25em',
    marginBottom: '-0.3em',
    cursor: 'help',
  },
}
