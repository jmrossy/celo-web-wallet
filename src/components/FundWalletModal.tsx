import Binance from 'src/components/icons/logos/binance.svg'
import Bittrex from 'src/components/icons/logos/bittrex.svg'
import Coinbase from 'src/components/icons/logos/coinbase.svg'
import Coinlist from 'src/components/icons/logos/coinlist.svg'
import Okcoin from 'src/components/icons/logos/okcoin.svg'
import Okex from 'src/components/icons/logos/okex.svg'
import Ramp from 'src/components/icons/logos/ramp.svg'
import Simplex from 'src/components/icons/logos/simplex.svg'
import { Box } from 'src/components/layout/Box'
import { ModalLinkGrid, SmallGridLink } from 'src/components/modal/ModalLinkGrid'
import { useModal } from 'src/components/modal/useModal'
import { RAMP_PROJECT_ID } from 'src/consts'

export function useFundWalletModal() {
  const { showModalWithContent } = useModal()
  return (address: string) => {
    showModalWithContent({
      head: 'Where to buy Celo',
      content: <FundWalletModal address={address} />,
      subHead: 'Celo currencies can be earned or purchased from online exchanges including these.',
    })
  }
}

export function FundWalletModal({ address }: { address: string }) {
  const bigLinks = [
    {
      url: `https://buy.ramp.network/?hostAppName=CeloWallet&hostLogoUrl=https%3A%2F%2Fcelowallet.app%2Fstatic%2Ficon.png&defaultAsset=CELO&userAddress=${address}&hostApiKey=${RAMP_PROJECT_ID}`,
      imgSrc: Ramp,
      text: 'Ramp',
      subText: 'No Fees!',
    },
    {
      url: 'https://www.coinbase.com/earn/celo',
      imgSrc: Coinbase,
      text: 'Coinbase',
    },
    {
      url: `https://valoraapp.com/simplex?address=${address}`,
      imgSrc: Simplex,
      text: 'Simplex',
    },
  ]
  const smallLinks = [
    {
      url: 'https://global.bittrex.com/Market/Index?MarketName=USD-CELO',
      imgSrc: Bittrex,
      text: 'Bittrex',
    },
    {
      url: 'https://www.okcoin.com/spot/trade/celo-usd',
      imgSrc: Okcoin,
      text: 'Okcoin',
    },
    {
      url: 'https://www.binance.com/en/trade/CELO_BTC',
      imgSrc: Binance,
      text: 'Binance',
    },
    {
      url: 'https://www.okex.com/markets/spot-info/celo-usdt',
      imgSrc: Okex,
      text: 'Okex',
    },
    {
      url: 'https://coinlist.co/asset/celo',
      imgSrc: Coinlist,
      text: 'Coinlist',
    },
  ]
  return (
    <div>
      <ModalLinkGrid links={bigLinks} />
      <Box align="center" justify="center" wrap margin="1em 0 1em 0">
        {smallLinks.map((link, index) => (
          <SmallGridLink link={link} key={`ModalLinkGridSm-link-${index}`} />
        ))}
      </Box>
    </div>
  )
}
