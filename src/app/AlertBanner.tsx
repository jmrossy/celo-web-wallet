import { useState } from 'react'
import { XIcon } from 'src/components/icons/X'
import { Box } from 'src/components/layout/Box'
import { Color } from 'src/styles/Color'
import { Stylesheet } from 'src/styles/types'

export function AlertBanner() {
  const [show, setShow] = useState(true)

  if (!show) return null

  return (
    <div css={styles.container} onClick={() => setShow(false)}>
      <Box align="center" justify="center" styles={styles.banner}>
        <div>
          Othello Wallet (formerly Celo Wallet) is a community-run project. For a wallet with more
          features,{' '}
          <a
            href="https://valoraapp.com"
            target="_blank"
            rel="noopener noreferrer"
            css={styles.link}
          >
            try Valora
          </a>
          .
        </div>
        <div css={styles.icon}>
          <XIcon width={18} height={18} color={Color.primaryBlack} />
        </div>
      </Box>
    </div>
  )
}

const styles: Stylesheet = {
  container: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    cursor: 'pointer',
    '& div': {
      fontWeight: 500,
    },
    ':hover': { opacity: 0.9 },
  },
  banner: {
    backgroundColor: Color.primaryGold,
    width: '100%',
    padding: '0.3em 1.5em 0.3em 0.5em',
  },
  link: {
    color: Color.primaryBlack,
    textDecoration: 'underline',
  },
  icon: {
    paddingTop: '0.2em',
    marginLeft: '1em',
  },
}
