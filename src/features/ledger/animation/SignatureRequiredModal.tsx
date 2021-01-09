import { Box } from 'src/components/layout/Box'
import { DeviceClickAnimation } from 'src/features/ledger/animation/DeviceClickAnimation'
import { Font } from 'src/styles/fonts'
import { Stylesheet } from 'src/styles/types'

interface Props {
  text: string[]
}

export function SignatureRequiredModal({ text }: Props) {
  return (
    <Box direction="column" align="center" margin="0.5em 0 1.3em 0">
      {text.map((line, i) => (
        <p key={`sig-requred-modal-body-${i}`} css={style.p}>
          {line}
        </p>
      ))}
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
  device: {
    marginTop: '0.5em',
  },
}
