import { useState } from 'react'
import { defaultButtonStyles } from 'src/components/buttons/Button'
import Eye from 'src/components/icons/eye.svg'
import Paste from 'src/components/icons/paste.svg'
import { Box } from 'src/components/layout/Box'
import { isValidMnemonic } from 'src/features/wallet/utils'
import { Color } from 'src/styles/Color'
import { mq } from 'src/styles/mediaQueries'
import { Stylesheet } from 'src/styles/types'
import { tryClipboardSet } from 'src/utils/clipboard'
import { chunk } from 'src/utils/string'

interface Props {
  mnemonic: string
  unavailable?: boolean
}

export function Mnemonic(props: Props) {
  const { mnemonic, unavailable } = props

  const [hidden, setHidden] = useState<boolean>(true)

  if (!isValidMnemonic(mnemonic)) {
    throw new Error('Invalid mnemonic')
  }

  const onShowButtonClick = () => {
    setHidden(!hidden)
  }

  const onCopyButtonClick = async () => {
    await tryClipboardSet(mnemonic)
  }

  const valueToShow = hidden ? getObfuscatedMnemonic(mnemonic) : mnemonic
  const mnemonicWords = chunk<Array<string>>(valueToShow.trim().split(' '), 6)

  if (unavailable) {
    return (
      <Box direction="row" align="center">
        <div css={style.containerUnavailable}>
          <div>Unavailable: secret is on your Ledger.</div>
        </div>
      </Box>
    )
  }

  return (
    <Box direction="row" align="center">
      <div css={style.container}>
        {mnemonicWords.map((words, i) => (
          <Box direction="row" align="center" justify="between" key={`mLine-${i}`}>
            {words.map((word, j) => (
              <span key={`mWord-${i}-${j}`} css={style.line}>
                {word}
              </span>
            ))}
          </Box>
        ))}
      </div>
      <Box direction="column" justify="between" align="center" margin="0 0 0 -10px">
        <button css={style.button} onClick={onShowButtonClick} title="Show phrase" type="button">
          <img width="20px" height="20px" src={Eye} alt="Show/Hide" />
        </button>
        <button css={style.button} onClick={onCopyButtonClick} title="Copy phrase" type="button">
          <img width="17px" height="17px" src={Paste} alt="Copy" />
        </button>
      </Box>
    </Box>
  )
}

function getObfuscatedMnemonic(mnemonic: string) {
  return mnemonic.substring(0, 8) + mnemonic.substring(8).replace(/[a-zA-Z]/g, '*')
}

const style: Stylesheet = {
  container: {
    zIndex: 5,
    backgroundColor: Color.fillLight,
    padding: '5px 18px 5px 5px',
    borderRadius: 4,
    [mq[768]]: {
      minWidth: '20em',
    },
  },
  containerUnavailable: {
    zIndex: 5,
    backgroundColor: Color.fillLight,
    padding: '1em',
    borderRadius: 4,
  },
  line: {
    padding: '0px 2px',
    lineHeight: '22px',
  },
  button: {
    ...defaultButtonStyles,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    height: 27,
    width: 27,
    borderRadius: 3,
    ':nth-of-type(2)': {
      marginTop: 10,
    },
  },
}
