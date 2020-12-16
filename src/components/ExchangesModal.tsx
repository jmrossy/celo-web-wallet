import Bittrex from 'src/components/icons/logos/bittrex.svg'
import Coinbase from 'src/components/icons/logos/coinbase.svg'
import Okcoin from 'src/components/icons/logos/okcoin.svg'
import Simplex from 'src/components/icons/logos/simplex.svg'
import { ModalLinkGrid } from 'src/components/modal/ModalLinkGrid'

export function ExchangesModal() {
  const links = [
    {
      url: 'https://www.coinbase.com/earn/celo',
      imgSrc: Coinbase,
      text: 'Coinbase',
    },
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
      url: 'https://valoraapp.com/simplex',
      imgSrc: Simplex,
      text: 'Simplex',
    },
  ]
  return <ModalLinkGrid links={links} />
}
