import { Link, useNavigate } from 'react-router-dom'
import { Button } from 'src/components/Button'
import Bittrex from 'src/components/icons/exchanges/bittrex.svg'
import Coinbase from 'src/components/icons/exchanges/coinbase.svg'
import Okcoin from 'src/components/icons/exchanges/okcoin.svg'
import Mail from 'src/components/icons/mail.svg'
import { Box } from 'src/components/layout/Box'
import { useModal } from 'src/components/modal/useModal'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
import { Stylesheet } from 'src/styles/types'

export function HeaderSectionEmpty() {
  const { showModalWithContent } = useModal()
  const onClickBuyCelo = () => {
    showModalWithContent(
      'Where to buy Celo',
      <ExchangesModal />,
      null,
      null,
      'Celo currencies can be earned or purchased from exchanges.'
    )
  }

  const navigate = useNavigate()
  const onClickSeeWallet = () => {
    navigate('/wallet')
  }

  return (
    <Box direction="column">
      <h1 css={style.header}>Welcome to your Celo wallet!</h1>

      <Box direction="column">
        <Box direction="row" align="end">
          <img src={Mail} css={style.icon} alt="Get Started" />
          <label css={[Font.body, Font.bold]}>Get started</label>
        </Box>
        <p css={style.tip}>All new wallets start empty. Add funds to start using Celo.</p>
        <p css={style.tip}>
          You can{' '}
          <a href="javascript:void(0);" css={Font.linkLight} onClick={onClickBuyCelo}>
            buy currency
          </a>{' '}
          from an exchange or ask a friend on Celo to send a payment to{' '}
          <Link to="/wallet" css={Font.linkLight}>
            your address.
          </Link>
        </p>
        <div>
          <Button size="s" onClick={onClickBuyCelo} margin="2em 2em 0 0">
            Buy Celo
          </Button>
          <Button size="s" onClick={onClickSeeWallet} margin="2em 0 0 0">
            See Your Wallet
          </Button>
        </div>
      </Box>
    </Box>
  )
}

function ExchangesModal() {
  return (
    <Box direction="row" align="center" justify="center" margin="2em 0">
      <a
        css={style.exchangeLink}
        href="https://www.coinbase.com/earn/celo"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Box direction="column" align="center" justify="center" styles={style.exchangeLinkContent}>
          <img src={Coinbase} css={style.exchangeIcon} alt="Coinbase" />
          <div>Coinbase</div>
        </Box>
      </a>
      <a
        css={style.exchangeLink}
        href="https://global.bittrex.com/Market/Index?MarketName=USD-CELO"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Box direction="column" align="center" justify="center" styles={style.exchangeLinkContent}>
          <img src={Bittrex} css={style.exchangeIcon} alt="Bittrex" />
          <div>Bittrex</div>
        </Box>
      </a>
      <a
        css={style.exchangeLink}
        href="https://www.okcoin.com/spot/trade/celo-usd"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Box direction="column" align="center" justify="center" styles={style.exchangeLinkContent}>
          <img src={Okcoin} css={style.exchangeIcon} alt="OkCoin" />
          <div>OkCoin</div>
        </Box>
      </a>
    </Box>
  )
}

const style: Stylesheet = {
  header: {
    ...Font.h1,
    marginBottom: '1.2em',
    color: Color.primaryGreen,
  },
  icon: {
    marginRight: '0.5em',
    height: '2em',
    width: '2em',
  },
  tip: {
    ...Font.body,
    margin: '1em 0 0 0',
  },
  exchangeLink: {
    marginTop: '1em',
    fontSize: '1.1em',
    color: Color.primaryBlack,
    textAlign: 'center',
    textDecoration: 'none',
    ':hover': {
      textDecoration: 'underline',
    },
  },
  exchangeLinkContent: {
    textDecoration: 'none',
    borderRadius: 3,
    width: '8em',
    height: '8em',
    margin: '0 1em',
    border: `1px solid ${Color.primaryWhite}`,
    ':hover': {
      borderColor: Color.altGrey,
    },
  },
  exchangeIcon: {
    height: '4em',
    width: '4em',
    marginBottom: '1em',
  },
}
