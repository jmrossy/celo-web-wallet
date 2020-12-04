import { ConnectionStatus } from 'src/components/footer/ConnectionStatus'
import { ConnectionIcon } from 'src/components/icons/Connection'
import { Box } from 'src/components/layout/Box'
import { ModalOkAction } from 'src/components/modal/modal'
import { useModal } from 'src/components/modal/useModal'
import { Color } from 'src/styles/Color'
import { Styles, Stylesheet } from 'src/styles/types'

export function Footer() {
  const { showModalWithContent } = useModal()
  //TODO: determine color from actual connection status
  const connectionColor = Color.accentBlue

  const onConnectionClick = () => {
    showModalWithContent('Connection Status', <ConnectionStatus />, ModalOkAction)
  }

  return (
    <Box align="center" justify="between" styles={style.container}>
      <Box align="center" justify="center">
        <a css={textStyle} href="https://celo.org" target="_blank" rel="noopener noreferrer">
          About Celo
        </a>
        <span>-</span>
        <a css={textStyle} href="https://valoraapp.com" target="_blank" rel="noopener noreferrer">
          Valora Mobile App
        </a>
        <span>-</span>
        <a
          css={textStyle}
          href="https://github.com/celo-tools/celo-web-wallet"
          target="_blank"
          rel="noopener noreferrer"
        >
          View Source
        </a>
      </Box>
      <div css={style.connectedBox} onClick={onConnectionClick}>
        <ConnectionIcon fill={connectionColor} />
        <div css={[style.connection, { color: `${connectionColor} !important` }]}>Connected</div>
      </div>
    </Box>
  )
}

const textStyle: Styles = {
  padding: '0 0.8em',
  fontSize: '0.8em',
  fontWeight: 300,
  color: Color.primaryBlack,
  textAlign: 'center',
  textDecoration: 'none',
  ':hover': {
    textDecoration: 'underline',
  },
}

const style: Stylesheet = {
  container: {
    padding: '0.5em 0.8em',
    width: '100%',
    opacity: 0.8,
    borderTop: `1px solid ${Color.borderLight}`,
  },
  connection: {
    ...textStyle,
    display: 'inline',
  },
  connectedBox: {
    display: 'flex',
    alignContent: 'flex-end',
    borderLeft: `1px solid ${Color.borderInactive}`,
    paddingLeft: '1em',
    position: 'relative',
    cursor: 'pointer',
    '& svg': {
      height: '3.5em',
      width: '3.5em',
      position: 'absolute',
      top: '-1.7em',
      left: '-.5em',
    },
  },
}
