import { HelpIcon } from 'src/components/icons/HelpIcon'

export function FeeHelpIcon() {
  return (
    <HelpIcon
      tooltip={{
        content: "Fees, or 'gas', keep the network secure.",
        position: 'topRight',
      }}
    />
  )
}
