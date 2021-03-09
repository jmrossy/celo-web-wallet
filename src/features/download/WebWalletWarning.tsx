import { Button } from 'src/components/buttons/Button'
import { TextLink } from 'src/components/buttons/TextLink'
import WarningIcon from 'src/components/icons/warning.svg'
import { Box } from 'src/components/layout/Box'
import { DownloadDesktopButton } from 'src/features/download/DownloadDesktopModal'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
import { mq } from 'src/styles/mediaQueries'
import { Stylesheet } from 'src/styles/types'

interface Props {
  type: 'create' | 'import'
  onClose: () => void
}

export function WebWalletWarning({ type, onClose }: Props) {
  const caseText =
    type === 'create'
      ? 'If you will use large amounts in this account'
      : 'If you are importing a large account'

  return (
    <Box direction="column" align="center" styles={style.container}>
      <Box direction="column" align="center" justify="center" styles={style.content}>
        <Box direction="row" align="center" justify="center" margin="1.5em 0 0 0">
          <img css={style.warningIcon} src={WarningIcon} alt="warning" />
          <div css={style.warningHeader}>Warning</div>
          <img css={style.warningIcon} src={WarningIcon} alt="warning" />
        </Box>
        <p css={style.text}>
          {caseText}, using <DownloadDesktopButton>the desktop app</DownloadDesktopButton> or Ledger
          hardware is strongly recommended.
        </p>
        <p css={style.text}>
          The Celo Wallet For Web tries its best to protect your funds but there{' '}
          <TextLink link="https://github.com/celo-tools/celo-web-wallet/blob/master/FAQ.md#is-the-web-wallet-safe">
            are still risks
          </TextLink>
          .
        </p>
      </Box>
      <Button onClick={onClose} margin="1.5em 0 0 0">
        I Understand
      </Button>
    </Box>
  )
}

const style: Stylesheet = {
  container: {
    borderRadius: 4,
    padding: '0 1em 1em 1em',
    background: `${Color.accentBlue}11`,
  },
  content: {
    maxWidth: '26em',
  },
  text: {
    ...Font.body,
    margin: '0.5em 0.4em',
    lineHeight: '1.6em',
    textAlign: 'center',
    ':first-of-type': {
      ...Font.bold,
      marginTop: '1.5em',
    },
    [mq[768]]: {
      margin: '0.6em 1.4em',
    },
  },
  warningHeader: {
    ...Font.h2,
    fontWeight: 500,
    padding: '0 0.5em',
  },
  warningIcon: {
    height: '1.2em',
    width: '1.35em',
    paddingTop: 1,
  },
}
