import { TextButton } from 'src/components/buttons/TextButton'
import Discord from 'src/components/icons/logos/discord.svg'
import Github from 'src/components/icons/logos/github.svg'
import { ModalLinkGrid } from 'src/components/modal/ModalLinkGrid'
import { useModal } from 'src/components/modal/useModal'
import { config } from 'src/config'
import { Styles } from 'src/styles/types'

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
