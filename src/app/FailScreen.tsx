import { Component } from 'react'
import { TextLink } from 'src/components/buttons/TextLink'
import SadFace from 'src/components/icons/sad_face.svg'
import { config } from 'src/config'
import { OnboardingScreenFrame } from 'src/features/onboarding/OnboardingScreenFrame'
import { Font } from 'src/styles/fonts'
import { Stylesheet } from 'src/styles/types'
import { logger } from 'src/utils/logger'

interface ErrorBoundaryState {
  error: any
  errorInfo: any
}

export class ErrorBoundary extends Component<any, ErrorBoundaryState> {
  constructor(props: any) {
    super(props)
    this.state = { error: null, errorInfo: null }
  }

  componentDidCatch(error: any, errorInfo: any) {
    this.setState({
      error: error,
      errorInfo: errorInfo,
    })
    logger.error('Error caught by error boundary', error, errorInfo)
  }

  render() {
    if (this.state.errorInfo) {
      return <FailScreen />
    }
    return this.props.children
  }
}

export function FailScreen() {
  return (
    <OnboardingScreenFrame>
      <h1 css={Font.h1}>Something went wrong, sorry!</h1>
      <img width="200em" src={SadFace} alt="Sad Face" css={style.img} />
      <h3 css={style.h3}>
        Please refresh the page. If the problem persists, you can{' '}
        <TextLink link={config.discordUrl}>ask for help here</TextLink>.
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
