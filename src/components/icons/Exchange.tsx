import { memo } from 'react'
import SwapIcon from './swap.svg'
import { Box } from '../layout/Box'
import { Color } from '../../styles/Color'
import { CELO, Token } from '../../tokens'

function _ExchangeIcon({ toToken }: { toToken: Token }) {
  const backgroundColor = toToken.id === CELO.id ? Color.primaryGold : Color.primaryGreen
  return (
    <Box
      align="center"
      justify="center"
      styles={{
        height: '34px',
        width: '34px',
        borderRadius: '50%',
        backgroundColor,
      }}
    >
      <img width="18px" height="18px" src={SwapIcon} alt="Exchange" />
    </Box>
  )
}

export const ExchangeIcon = memo(_ExchangeIcon)
