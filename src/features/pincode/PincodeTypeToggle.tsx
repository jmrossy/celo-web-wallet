import { ButtonToggle } from 'src/components/buttons/ButtonToggle'
import { BasicHelpIconModal, HelpIcon } from 'src/components/icons/HelpIcon'
import { Stylesheet } from 'src/styles/types'

interface Props {
  onToggle: (index: number) => void
  margin?: string
}

export function PincodeTypeToggle(props: Props) {
  const { margin, onToggle } = props
  return (
    <div css={{ ...style.buttonToggleContainer, margin }}>
      <ButtonToggle label1="Pincode" label2="Password" onToggle={onToggle} />
      <div css={style.helpIcon}>
        <HelpIcon width="1.5em" modal={{ head: 'Pincode vs Password', content: <HelpModal /> }} />
      </div>
    </div>
  )
}

function HelpModal() {
  return (
    <BasicHelpIconModal>
      <p>
        You can use a 6-digit pincode or a password to secure your account on this device. Pincodes
        are more convenient but passwords are more secure.
      </p>
      <p>
        Note, there is no way to recover your pin or password, <strong>keep it safe!</strong> Using
        a password manager is recommended.
      </p>
    </BasicHelpIconModal>
  )
}

const style: Stylesheet = {
  buttonToggleContainer: {
    position: 'relative',
    width: 'fit-content',
    maxWidth: '16em',
  },
  helpIcon: {
    position: 'absolute',
    right: -52,
    top: 6,
  },
}
