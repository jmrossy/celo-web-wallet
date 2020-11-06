import { useNavigate } from 'react-router'
import { Button } from 'src/components/Button'
import { Footer } from 'src/components/footer/Footer'
import Logo from 'src/components/icons/logoWithWallet.svg'
import { Box } from 'src/components/layout/Box'

export function WelcomeScreen() {
  const navigate = useNavigate()

  const onClickCreateNew = () => {
    navigate('/new')
  }

  const onClickUseExisting = () => {
    navigate('/import')
  }

  return (
    <Box direction="column" justify="between" align="center" styles={{ minHeight: '100vh' }}>
      <Box direction="column" justify="center" align="center" styles={{ marginTop: '30vh' }}>
        <img width={'500rem'} src={Logo} alt="Celo Logo" css={{ maxWidth: '80%' }} />
        <Button size={'m'} onClick={onClickCreateNew} margin={'2.5em 0 0 0'}>
          Create New Account
        </Button>
        <Button size={'m'} onClick={onClickUseExisting} margin={'2em 0 0 0'}>
          Use Existing Account
        </Button>
      </Box>
      <Footer isOnboarding={true} />
    </Box>
  )
}
