import ChimoneyIcon from 'src/components/icons/logos/chimoney_logo.svg'
import { modalStyles } from 'src/components/modal/modalStyles'
import { useModal } from 'src/components/modal/useModal'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
import { Stylesheet } from 'src/styles/types'

export function useSpendCeloModal() {
  const { showModalWithContent, closeModal } = useModal()
  return () => {
    showModalWithContent({
      head: 'Spend Celo (Beta)',
      content: <SpendModal close={closeModal} />,
      headIcon: <Icon />,
    })
  }
}

interface Props {
  close: () => void
}

function SpendModal({ close }: Props) {
  console.log({ close })
  // const { status, session, request, error } = useSelector((s: RootState) => s.walletConnect)

  return <SpendApp />
}

function Icon() {
  return <img src={ChimoneyIcon} css={style.chiIcon} alt="WalletConnect Icon" />
}

// http://localhost:4040/?cSContext=xumm&xAppStyle=light
const SpendApp = () => {
  const baseURL = 'http://localhost:4040'
  const options = {
    name: 'celowallet',
    xAppStyle: 'light',
    cSContext: 'celowallet-web',
    primaryColor: '#35D07F',
    secondaryColor: '#FBCC5C',
  }
  const urlParams = new URLSearchParams(options).toString()
  const url = `${baseURL}?${urlParams}`
  console.log({ url })
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
  h3: {
    ...modalStyles.h3,
    maxWidth: '18em',
  },
  label: {
    ...modalStyles.p,
    ...Font.bold,
    maxWidth: '22em',
  },
  dappUrl: {
    margin: '1.2em 0 0 0',
    textAlign: 'center',
    maxWidth: '24em',
    fontSize: '1em',
  },
  error: {
    ...modalStyles.p,
    color: Color.textError,
  },
  chiIcon: {
    height: '1em',
    width: '2em',
    filter: 'saturate(0) brightness(0.4)',
    paddingTop: 4,
  },
  spendEmbed: {
    width: '1068px',
    maxWidth: '100%',
    height: '60vh',
    maxheight: '100%',
  },
}
