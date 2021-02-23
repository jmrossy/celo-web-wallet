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
      margin="1.2em 0 1em 0"
      styles={style.container}
      wrap
    >
      {links.map((link, index) => (
        <Box
          key={`ModalLinkGrid-link-${index}`}
          styles={style.linkContainer}
          align="center"
          justify="center"
        >
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
    maxWidth: '25em',
  },
  linkContainer: {
    width: '50%',
  },
  link: {
    marginTop: '0.5em',
    fontSize: '1.1em',
    color: Color.primaryBlack,
    textAlign: 'center',
    textDecoration: 'none',
    ':hover': {
      textDecoration: 'underline',
    },
  },
  linkContent: {
    textDecoration: 'none',
    borderRadius: 3,
    width: '5.6em',
    height: '5.8em',
    margin: '0 0.5em',
    border: `1px solid ${Color.primaryWhite}`,
    ':hover': {
      borderColor: Color.altGrey,
    },
    [mq[768]]: {
      width: '7em',
      height: '7.2em',
    },
  },
  icon: {
    height: '2.5em',
    width: '2.5em',
    marginBottom: '0.7em',
    [mq[768]]: {
      width: '3em',
      height: '3em',
    },
  },
}
