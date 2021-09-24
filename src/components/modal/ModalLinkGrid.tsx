import { Box } from 'src/components/layout/Box'
import { Color } from 'src/styles/Color'
import { mq } from 'src/styles/mediaQueries'
import { Stylesheet } from 'src/styles/types'

interface GridLink {
  url: string
  imgSrc: string
  text: string
  subText?: string
  altText?: string
}

interface ModalLinkGridProps {
  links: Array<GridLink>
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
        <BigGridLink link={link} key={`ModalLinkGrid-link-${index}`} />
      ))}
    </Box>
  )
}

function BigGridLink({ link }: { link: GridLink }) {
  return (
    <Box align="center" justify="center">
      <a css={style.link} href={link.url} target="_blank" rel="noopener noreferrer">
        <Box direction="column" align="center" justify="center" styles={style.linkContent}>
          <img src={link.imgSrc} css={style.icon} alt={link.altText || link.text} />
          <div>{link.text}</div>
          {link.subText && <div css={style.subText}>{link.subText}</div>}
        </Box>
      </a>
    </Box>
  )
}

export function SmallGridLink({ link }: { link: GridLink }) {
  return (
    <Box align="center" justify="center">
      <a css={style.link} href={link.url} target="_blank" rel="noopener noreferrer">
        <Box direction="column" align="center" justify="center" styles={styleSm.linkContent}>
          <img src={link.imgSrc} css={styleSm.icon} alt={link.altText || link.text} />
        </Box>
      </a>
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
  subText: {
    fontSize: '0.8em',
    color: Color.primaryGreen,
    marginTop: '0.3em',
  },
}

const styleSm: Stylesheet = {
  linkContent: {
    ...style.linkContent,
    width: '2.8em',
    height: '2.8em',
    margin: '0 0.4em',
    [mq[480]]: {
      width: '2.9em',
      height: '2.9em',
      margin: '0 0.5em',
    },
    [mq[768]]: {
      width: '3em',
      height: '3em',
      margin: '0 0.7em',
    },
  },
  icon: {
    width: '1.8em',
    [mq[768]]: {
      width: '2em',
    },
  },
}
