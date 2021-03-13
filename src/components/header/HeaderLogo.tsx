import { Link } from 'react-router-dom'
import LogoCompact from 'src/components/icons/logo-compact.svg'
import LogoNormal from 'src/components/icons/logo.svg'
import { useIsMobile } from 'src/styles/mediaQueries'
import { Stylesheet } from 'src/styles/types'

export function HeaderLogo() {
  const isMobile = useIsMobile()
  return (
    <Link to="/">
      {isMobile ? (
        <img width="26" height="26" src={LogoCompact} alt="Celo Logo" css={style.logoCompact} />
      ) : (
        <img width="96" height="42" src={LogoNormal} alt="Celo Logo" css={style.logoNormal} />
      )}
    </Link>
  )
}

const style: Stylesheet = {
  logoCompact: {
    width: '1.8em',
  },
  logoNormal: {
    width: '6em',
    padding: '0 0.2em',
  },
}
