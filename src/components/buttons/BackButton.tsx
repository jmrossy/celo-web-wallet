import { useNavigate } from 'react-router'
import {
  TransparentIconButton,
  TransparentIconButtonProps,
} from 'src/components/buttons/TransparentIconButton'
import { ArrowIcon } from 'src/components/icons/Arrow'
import { Color } from 'src/styles/Color'

export function BackButton(props: Omit<Omit<TransparentIconButtonProps, 'icon'>, 'onClick'>) {
  const { styles, iconStyles, margin, title, color } = props

  const navigate = useNavigate()
  const onClickBack = () => {
    navigate(-1)
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
