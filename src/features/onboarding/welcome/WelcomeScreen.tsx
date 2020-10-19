import React from 'react'
import { useNavigate } from 'react-router'
import { Button } from 'src/components/Button'
import { Footer } from 'src/components/footer/Footer'
import Logo from 'src/components/icons/logoWithWallet.svg'
import { Box } from 'src/components/layout/Box'

export function WelcomeScreen() {
  const navigate = useNavigate()

  const onCreateNewClick = () => {
    navigate('/')
  }

  const onUseExistingClick = () => {
    navigate('/')
  }

  return (
    <Box direction="column" justify="between" align="center" styles={{ minHeight: '100vh' }}>
      <Box direction="column" justify="center" align="center" styles={{ marginTop: '30vh' }}>
        <img width={'500px'} src={Logo} alt="Celo Logo" />
        <Button size={'l'} onClick={onCreateNewClick} margin={'1rem'}>
          Create New Account
        </Button>
        <Button size={'l'} onClick={onUseExistingClick} margin={'1rem'}>
          Use Existing Account
        </Button>
      </Box>
      <Footer />
    </Box>
  )
}
