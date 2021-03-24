import QuestionIcon from 'src/components/icons/question_mark.svg'
import { Box } from 'src/components/layout/Box'
import { DeviceClickAnimation } from 'src/features/ledger/animation/DeviceClickAnimation'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
import { Stylesheet } from 'src/styles/types'

interface Props {
  text: string[]
  signWarningLabel?: string
}

export function SignatureRequiredModal({ text, signWarningLabel }: Props) {
  return (
    <Box direction="column" align="center" margin="0.5em 0 1.3em 0">
      {text.map((line, i) => (
        <p key={`sig-requred-modal-body-${i}`} css={style.p}>
          {line}
        </p>
      ))}
      {signWarningLabel && (
        <Box direction="row" align="center" margin="1em 0 0 0">
          <p
            css={style.warning}
          >{`Note: Transaction details on Ledger are not yet available for ${signWarningLabel}`}</p>
          <a
            href="https://github.com/celo-tools/celo-web-wallet/blob/master/FAQ.md#is-ledger-supported"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src={QuestionIcon} css={style.helpIcon} alt="More info" />
          </a>
        </Box>
      )}
      <div css={style.device}>
        <DeviceClickAnimation />
      </div>
    </Box>
  )
}

const style: Stylesheet = {
  p: {
    ...Font.body,
    margin: '0.8em 0 0 0',
    textAlign: 'center',
    lineHeight: '1.2em',
  },
  warning: {
    margin: '0 0.5em 0 0',
    fontSize: '1em',
    lineHeight: '1em',
    maxWidth: '18em',
    color: Color.textGrey,
    textAlign: 'left',
  },
  helpIcon: {
    width: '1.4em',
  },
  device: {
    marginTop: '0.5em',
  },
}
