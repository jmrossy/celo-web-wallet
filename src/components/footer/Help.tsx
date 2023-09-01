import { TextButton } from 'src/components/buttons/TextButton'
import Github from 'src/components/icons/logos/github.svg'
import { ModalLinkGrid } from 'src/components/modal/ModalLinkGrid'
import { useModal } from 'src/components/modal/useModal'
import { Styles } from 'src/styles/types'

export function HelpButton({ styles }: { styles: Styles }) {
  const { showModalWithContent } = useModal()
  const onClick = () => {
    showModalWithContent({
      head: 'Need some help?',
      content: <HelpModal />,
      subHead: 'See the Frequently Asked Questions (FAQ) on Github.',
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
  ]
  return <ModalLinkGrid links={links} />
}
