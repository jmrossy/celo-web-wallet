import Bittrex from 'src/components/icons/logos/bittrex.svg'
import Coinbase from 'src/components/icons/logos/coinbase.svg'
import Okcoin from 'src/components/icons/logos/okcoin.svg'
import Simplex from 'src/components/icons/logos/simplex.svg'
import { ModalLinkGrid } from 'src/components/modal/ModalLinkGrid'
import { useModal } from 'src/components/modal/useModal'

export function useFundWalletModal() {
  const { showModalWithContent } = useModal()
  return (address: string) => {
    showModalWithContent(
      'Where to buy Celo',
      <FundWalletModal address={address} />,
      null,
      null,
      'Celo currencies can be earned or purchased from these exchanges.'
    )
  }
}

export function FundWalletModal({ address }: { address: string }) {
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
      url: `https://valoraapp.com/simplex?address=${address}`,
      imgSrc: Simplex,
      text: 'Simplex',
    },
  ]
  return <ModalLinkGrid links={links} />
}
