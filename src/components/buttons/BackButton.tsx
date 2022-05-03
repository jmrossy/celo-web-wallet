import { useNavigate } from 'react-router-dom'
import {
  TransparentIconButton,
  TransparentIconButtonProps,
} from 'src/components/buttons/TransparentIconButton'
import { ArrowIcon } from 'src/components/icons/Arrow'
import { Color } from 'src/styles/Color'

type Props = Omit<Omit<TransparentIconButtonProps, 'icon'>, 'onClick'> & {
  onGoBack?: () => void
}

export function BackButton(props: Props) {
  const { styles, iconStyles, margin, title, color, onGoBack } = props

  const navigate = useNavigate()
  const onClickBack = () => {
    if (onGoBack) onGoBack()
    else navigate(-1)
  }

  return (
    <TransparentIconButton
      icon={
        <ArrowIcon
          direction="w"
          color={color === 'light' ? Color.primaryWhite : Color.primaryBlack}
        />
      }
      styles={styles}
      iconStyles={iconStyles}
      color={color}
      margin={margin}
      onClick={onClickBack}
      title={title || 'Go Back'}
    />
  )
}
