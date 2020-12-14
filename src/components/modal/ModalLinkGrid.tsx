import { Box } from 'src/components/layout/Box'
import { Color } from 'src/styles/Color'
import { mq } from 'src/styles/mediaQueries'
import { Stylesheet } from 'src/styles/types'

interface ModalLinkGridProps {
  links: Array<{ url: string; imgSrc: string; text: string; altText?: string }>
}

export function ModalLinkGrid({ links }: ModalLinkGridProps) {
  return (
    <Box direction="row" align="center" justify="center" margin="1.2em 0" wrap>
      {links.map((link, index) => (
        <Box
          key={`ModalLinkGrid-link-${index}`}
          styles={style.exchangeContainer}
          align="center"
          justify="center"
        >
          <a css={style.exchangeLink} href={link.url} target="_blank" rel="noopener noreferrer">
            <Box
              direction="column"
              align="center"
              justify="center"
              styles={style.exchangeLinkContent}
            >
              <img src={link.imgSrc} css={style.exchangeIcon} alt={link.altText || link.text} />
              <div>{link.text}</div>
            </Box>
          </a>
        </Box>
      ))}
    </Box>
  )
}

const style: Stylesheet = {
  exchangeContainer: {
    width: '50%',
  },
  exchangeLink: {
    marginTop: '0.5em',
    fontSize: '1.1em',
    color: Color.primaryBlack,
    textAlign: 'center',
    textDecoration: 'none',
    ':hover': {
      textDecoration: 'underline',
    },
  },
  exchangeLinkContent: {
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
  exchangeIcon: {
    height: '2.5em',
    width: '2.5em',
    marginBottom: '0.7em',
    [mq[768]]: {
      width: '3em',
      height: '3em',
    },
  },
}
