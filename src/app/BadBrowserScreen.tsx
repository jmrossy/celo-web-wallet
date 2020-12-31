import WebIcon from 'src/components/icons/web.svg'
import { OnboardingScreenFrame } from 'src/features/onboarding/OnboardingScreenFrame'
import { Font } from 'src/styles/fonts'
import { Stylesheet } from 'src/styles/types'

export function BadBrowserScreen() {
  return (
    <OnboardingScreenFrame>
      <h1 css={Font.h1}>Your browser is not supported, sorry!</h1>
      <img width="200em" src={WebIcon} alt="Browser" css={style.img} />
      <h3 css={style.h3}>
        The wallet requires modern browsers that support the WebCrypto standard. Please try the
        latest Chrome, Firefox, Safari, or Brave browsers instead.
      </h3>
    </OnboardingScreenFrame>
  )
}

const style: Stylesheet = {
  img: {
    margin: '1.5em',
  },
  h3: {
    ...Font.h3,
    textAlign: 'center',
  },
}
