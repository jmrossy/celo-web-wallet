import { TextButton } from '../buttons/TextButton'
import Discord from '../icons/logos/discord.svg'
import Github from '../icons/logos/github.svg'
import { ModalLinkGrid } from '../modal/ModalLinkGrid'
import { useModal } from '../modal/useModal'
import { config } from '../../config'
import { Styles } from '../../styles/types'

export function HelpButton({ styles }: { styles: Styles }) {
  const { showModalWithContent } = useModal()
  const onClick = () => {
    showModalWithContent({
      head: 'Need some help?',
      content: <HelpModal />,
      subHead:
        'See the Frequently Asked Questions (FAQ) on Github or join Discord to chat with the Celo community.',
    })
  }
  return (
    <TextButton onClick={onClick} styles={styles}>
      Help
    </TextButton>
  )
}

function HelpModal() {
  const links = [
    {
      url: 'https://github.com/celo-tools/celo-web-wallet/blob/master/FAQ.md',
      imgSrc: Github,
      text: 'FAQ on Github',
      altText: 'Github',
    },
    {
      url: config.discordUrl,
      imgSrc: Discord,
      text: 'Chat on Discord',
      altText: 'Discord',
    },
  ]
  return <ModalLinkGrid links={links} />
}
