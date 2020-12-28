import { useNavigate } from 'react-router'
import { transparentButtonStyles } from 'src/components/buttons/Button'
import { Box } from 'src/components/layout/Box'
import { Color } from 'src/styles/Color'
import { Styles } from 'src/styles/types'
import { range } from 'src/utils/amount'

interface PageDotsProps {
  // Both these are 1-indexed, i.e. page numbers are 1,2,3 for total 3
  current: number
  total: number
}

export function PageDots({ current, total }: PageDotsProps) {
  if (current <= 0 || total <= 0) return null

  const navigate = useNavigate()
  const onClickBackDot = (back: number) => {
    return () => {
      navigate(back)
    }
  }

  const previousPages = range(current, 1)
  const nextPages = range(total - current)

  return (
    <Box direction="row" align="center" justify="center">
      {previousPages.map((i) => (
        <button key={`page-dot-back-${i}`} onClick={onClickBackDot(i - current)} css={buttonStyles}>
          <Dot size={9} color={Color.primaryGrey} />
        </button>
      ))}
      <Dot size={12} color={Color.primaryBlack} />
      {nextPages.map((i) => (
        <Dot key={`page-dot-next-${i}`} size={9} color={Color.primaryGrey} />
      ))}
    </Box>
  )
}

interface DotProps {
  size: number
  color: string
}

function Dot({ size, color }: DotProps) {
  return (
    <svg height={size} width={size} css={{ margin: '0 0.75em' }}>
      <circle cx={size / 2} cy={size / 2} r={size / 2} fill={color} />
    </svg>
  )
}

export const buttonStyles: Styles = {
  ...transparentButtonStyles,
  ':hover': {
    transform: 'scale(1.2, 1.2)',
    filter: 'brightness(80%)',
  },
}
