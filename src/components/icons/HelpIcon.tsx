import QuestionIcon from 'src/components/icons/question_mark.svg'
import { Stylesheet } from 'src/styles/types'

interface IconProps {
  tooltip: string
  margin?: string
}

export const HelpIcon = (props: IconProps) => {
  const { tooltip, margin } = props
  const iconMargin = margin ? { margin: margin } : {}

  return <img src={QuestionIcon} css={[styles.icon, iconMargin]} title={tooltip} />
}

const styles: Stylesheet = {
  icon: {
    width: '1.1em',
    paddingLeft: '0.25em',
    marginBottom: '-0.3em',
    cursor: 'help',
  },
}
