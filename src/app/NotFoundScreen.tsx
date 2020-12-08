import { Link } from 'react-router-dom'
import NotFoundIcon from 'src/components/icons/not_found.svg'
import { OnboardingScreenFrame } from 'src/components/layout/OnboardingScreenFrame'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
import { Stylesheet } from 'src/styles/types'

export function NotFoundScreen() {
  return (
    <OnboardingScreenFrame>
      <h1 css={Font.h1}>This page could not be found, sorry!</h1>
      <img width={'200em'} src={NotFoundIcon} alt="Not Found" css={style.img} />
      <h3 css={style.h3}>
        Please check the URL or go{' '}
        <Link to="/" css={{ color: Color.primaryBlack }}>
          back to home
        </Link>
        .
      </h3>
    </OnboardingScreenFrame>
  )
}

const style: Stylesheet = {
  img: {
    margin: '2.5em',
  },
  h3: {
    ...Font.h3,
    textAlign: 'center',
  },
}
