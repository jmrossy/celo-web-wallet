import { useSelector } from 'react-redux'
import { RootState } from 'src/app/rootReducer'
import { Box } from 'src/components/layout/Box'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'

export const ConnectionStatus = () => {
  const { lastBlockNumber } = useSelector((state: RootState) => state.feed)
  //TODO: Get the Chain ID and the actuall connection status
  const status = 'You are connected to the Celo Mainnet network!'
  const chain = '42220'

  return (
    <Box direction="column" align="center" styles={style.container}>
      <p css={style.greenText}>{status}</p>
      <p>
        Full Node:{' '}
        <a href="https://forno.celo.org" target="_blank" rel="noopener noreferrer">
          https://forno.celo.org
        </a>
      </p>
      <p>Last Block Number: {lastBlockNumber}</p>
      <p>Chain ID: {chain}</p>
    </Box>
  )
}

const style = {
  container: {
    paddingTop: '2em',
    '& p': {
      ...Font.body,
      margin: '0 1em 1em 1em',
    },
  },
  greenText: {
    ...Font.body,
    color: `${Color.primaryGreen} !important`,
  },
}
