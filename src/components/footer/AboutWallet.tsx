import { TextButton } from '../buttons/TextButton'
import { TextLink } from '../buttons/TextLink'
import { Box } from '../layout/Box'
import { ModalOkAction } from '../modal/modal'
import { useModal } from '../modal/useModal'
import { config } from '../../config'
import { Font } from '../../styles/fonts'
import { Styles, Stylesheet } from '../../styles/types'

export function AboutWalletLink({ styles }: { styles: Styles }) {
  const { showModalWithContent } = useModal()

  const onClick = () => {
    showModalWithContent({
      head: 'About This Wallet',
      content: <AboutWalletModal />,
      actions: ModalOkAction,
    })
  }

  return (
    <TextButton styles={styles} onClick={onClick}>
      About This Wallet
    </TextButton>
  )
}

function AboutWalletModal() {
  return (
    <Box direction="column" align="center" styles={style.container}>
      <p css={style.text}>
        The Celo Wallet is a free, open source wallet for the Celo network. It was created by{' '}
        <TextLink link="https://twitter.com/RossyWrote">J M Rossy</TextLink> and{' '}
        <TextLink link="https://www.linkedin.com/in/brianschwalm/">Brian Schwalm</TextLink>.
      </p>
      <p css={style.text}>
        The source code for the wallet can be found{' '}
        <TextLink link="https://github.com/celo-tools/celo-web-wallet">on Github</TextLink> and
        includes answers to{' '}
        <TextLink link="https://github.com/celo-tools/celo-web-wallet/blob/master/FAQ.md">
          Frequently Asked Questions
        </TextLink>
        . For other help, try asking in the{' '}
        <TextLink link={config.discordUrl}>Discord chat</TextLink>.
      </p>
      <p css={style.version}>{`Version: ${config.version}`}</p>
    </Box>
  )
}

const style: Stylesheet = {
  container: {
    maxWidth: '26em',
  },
  text: {
    ...Font.body2,
    margin: '0.3em 0',
    textAlign: 'center',
    lineHeight: '1.5em',
  },
  version: {
    ...Font.body2,
    textAlign: 'center',
    margin: '0.6em 0 0.1em 0',
  },
}
