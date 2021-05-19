import { Box } from 'src/components/layout/Box'
import { Color } from 'src/styles/Color'
import { mq } from 'src/styles/mediaQueries'
import { Stylesheet } from 'src/styles/types'

interface ModalLinkGridProps {
  links: Array<{ url: string; imgSrc: string; text: string; altText?: string }>
}

export function ModalLinkGrid({ links }: ModalLinkGridProps) {
  return (
    <Box
      direction="row"
      align="center"
      justify="center"
      margin="1em 0 0 0"
      styles={style.container}
      wrap
    >
      {links.map((link, index) => (
        <Box key={`ModalLinkGrid-link-${index}`} align="center" justify="center">
          <a css={style.link} href={link.url} target="_blank" rel="noopener noreferrer">
            <Box direction="column" align="center" justify="center" styles={style.linkContent}>
              <img src={link.imgSrc} css={style.icon} alt={link.altText || link.text} />
              <div>{link.text}</div>
            </Box>
          </a>
        </Box>
      ))}
    </Box>
  )
}

const style: Stylesheet = {
  container: {
    maxWidth: '30em',
  },
  link: {
    marginTop: '0.5em',
    fontSize: '1.1em',
    color: Color.primaryBlack,
    textAlign: 'center',
    textDecoration: 'none',
    outline: 'none',
  },
  linkContent: {
    textDecoration: 'none',
    borderRadius: 4,
    width: '4.6em',
    height: '5.8em',
    margin: '0 0.5em',
    border: `1px solid ${Color.primaryWhite}`,
    ':hover': {
      borderColor: Color.altGrey,
    },
    [mq[480]]: {
      width: '5.6em',
    },
    [mq[768]]: {
      width: '7em',
      height: '7.2em',
    },
  },
  icon: {
    width: '2.5em',
    marginBottom: '1em',
    [mq[768]]: {
      width: '3em',
    },
  },
}
