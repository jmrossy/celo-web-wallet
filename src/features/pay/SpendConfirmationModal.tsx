import { useSelector } from 'react-redux'
import type { RootState } from 'src/app/rootReducer'
import ChimoneyIcon from 'src/components/icons/logos/chimoney_logo.svg'
import { useModal } from 'src/components/modal/useModal'
import { Stylesheet } from 'src/styles/types'

export function useSpendConfirmationModal() {
  const { showModalWithContent } = useModal()
  return () => {
    showModalWithContent({
      head: 'Spend Celo Confirmation',
      content: <SpendModal />,
      headIcon: <Icon />,
    })
  }
}

function SpendModal() {
  return <SpendApp />
}

function Icon() {
  return <img src={ChimoneyIcon} css={style.chiIcon} alt="WalletConnect Icon" />
}

const SpendApp = () => {
  const allState = useSelector((state: RootState) => state)

  const tnxs = allState.feed.transactions
  const sortedTransaction = Object.values(tnxs).sort((a, b) => b.timestamp - a.timestamp)
  const txid = sortedTransaction[0]?.hash

  const baseURL = 'https://chispend.com/process/celo/confirm'
  // const baseURL = 'http://localhost:4040/process/celo/confirm'
  const options = {
    name: 'celowallet',
    txid,
    xAppStyle: 'light',
    cSContext: 'celowallet-web',
    primaryColor: '#35D07F',
    secondaryColor: '#FBCC5C',
  }
  const urlParams = new URLSearchParams(options).toString()
  const url = `${baseURL}?${urlParams}`
  return (
    <iframe
      src={url}
      css={style.spendEmbed}
      frameBorder={0}
      marginHeight={0}
      marginWidth={0}
      seamless
    />
  )
}

const style: Stylesheet = {
  chiIcon: {
    height: '1em',
    width: '2em',
    filter: 'saturate(0) brightness(0.4)',
    paddingTop: 4,
  },
  spendEmbed: {
    width: '1280px',
    maxWidth: '100%',
    height: '60vh',
    maxheight: '100%',
  },
}
