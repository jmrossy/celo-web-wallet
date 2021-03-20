import { BigNumber } from 'ethers'
import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { RootState } from 'src/app/rootReducer'
import { transparentButtonStyles } from 'src/components/buttons/Button'
import { Box } from 'src/components/layout/Box'
import { MoneyValue } from 'src/components/MoneyValue'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
import { mq, useWindowSize } from 'src/styles/mediaQueries'
import { Stylesheet } from 'src/styles/types'

export function BalanceSummary() {
  const { width: windowWidth } = useWindowSize()
  let numItems = 2
  if (windowWidth && windowWidth > 550) numItems = 3
  if (windowWidth && windowWidth > 1024) numItems = 4

  const tokens = useSelector((s: RootState) => s.wallet.balances.tokens)
  const { tokensToShow, hiddenTokens } = useMemo(() => {
    const sortedTokens = Object.values(tokens).sort((t1, t2) => {
      const t1Value = BigNumber.from(t1.value)
      const t2Value = BigNumber.from(t2.value)
      if (t1Value.gt(t2Value)) return -1
      if (t1Value.lt(t2Value)) return 1
      const t1Sort = t1.sortOrder ?? 1000
      const t2Sort = t2.sortOrder ?? 1000
      if (t1Sort < t2Sort) return -1
      if (t1Sort > t2Sort) return 1
      return t1.id < t2.id ? -1 : 1
    })
    const totalTokens = sortedTokens.length
    if (totalTokens <= numItems) {
      return { tokensToShow: sortedTokens, hiddenTokens: 0 }
    } else {
      return {
        tokensToShow: sortedTokens.slice(0, numItems - 1),
        hiddenTokens: totalTokens - (numItems - 1),
      }
    }
  }, [tokens, numItems])

  const navigate = useNavigate()
  const onBalanceClick = () => {
    navigate('/balances')
  }

  return (
    <div css={style.balances} onClick={onBalanceClick}>
      {tokensToShow.map((t) => (
        <MoneyValue
          key={`balance-summary-${t.id}`}
          amountInWei={t.value}
          token={t}
          roundDownIfSmall={true}
          baseFontSize={1.4}
          containerCss={style.balanceContainer}
          symbol="icon"
          iconSize="1.7em"
        />
      ))}
      {hiddenTokens > 0 && (
        <Box
          align="center"
          justify="center"
          styles={style.moreTokensContainer}
        >{`${hiddenTokens} more`}</Box>
      )}
    </div>
  )
}

const style: Stylesheet = {
  balances: {
    ...transparentButtonStyles,
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    letterSpacing: '0.05em',
  },
  balanceContainer: {
    margin: '0 0.5em',
    fontSize: '0.9em',
    [mq[480]]: {
      margin: '0 0.75em',
    },
    [mq[768]]: {
      fontSize: '1em',
      margin: '0 1em',
    },
    [mq[1024]]: {
      margin: '0 1.2em',
    },
    [mq[1200]]: {
      margin: '0 1.4em',
    },
    ':hover': {
      filter: 'brightness(1.1)',
    },
  },
  moreTokensContainer: {
    ...Font.bold,
    fontSize: '0.85em',
    padding: '0.4em 0.8em',
    borderRadius: '2em',
    background: Color.fillLighter,
    ':hover': {
      backgroundColor: Color.fillLight,
    },
    margin: '0.1em 0.5em 0 0.5em',
    [mq[480]]: {
      margin: '0.1em 0.75em 0 0.75em',
    },
    [mq[768]]: {
      fontSize: '0.95em',
      margin: '0.1em 1em 0 1em',
    },
    [mq[1200]]: {
      margin: '0.1em 1.2em 0 1.2em',
    },
  },
}
