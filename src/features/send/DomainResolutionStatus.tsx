import { Address } from 'src/components/Address'
import { TransparentIconButton } from 'src/components/buttons/TransparentIconButton'
import { CheckmarkIcon } from 'src/components/icons/Checkmark'
import { XIcon } from 'src/components/icons/X'
import { Box } from 'src/components/layout/Box'
import { modalStyles } from 'src/components/modal/modalStyles'
import { useModal } from 'src/components/modal/useModal'
import { Spinner } from 'src/components/Spinner'
import { NULL_ADDRESS } from 'src/consts'
import { DomainResolverStatus } from 'src/features/send/domainResolution'
import { Color } from 'src/styles/Color'
import { Styles, Stylesheet } from 'src/styles/types'

type DomainResolverStatusProps = DomainResolverStatus & {
  styles: Styles
}

export function DomainResolverStatus({
  result,
  loading,
  error,
  styles,
}: DomainResolverStatusProps) {
  const { showModal, showModalWithContent } = useModal()

  const onClickCheckmark = () => {
    if (!result) return
    showModalWithContent({
      head: 'Valid Address Found',
      content: <DomainStatusSuccessDetails address={result} />,
    })
  }

  const onClickNullAddressError = () => {
    showModal({
      head: 'No Address Found',
      body: 'Note: for Nomspace, default addresses are retrieved. For Unstoppable and ENS, only Celo-specific address records are used.',
      size: 's',
    })
  }

  const onClickGenericError = () => {
    showModal({
      head: 'Error retrieving address',
      body: 'Othello was unable to retrieve the name records. Check that the wallet is connected and that a valid name was provided.',
      size: 's',
    })
  }

  if (!result && !loading && !error) {
    return null // Show nothing
  }

  if (result && result !== NULL_ADDRESS && !loading && !error) {
    return (
      <TransparentIconButton
        icon={<CheckmarkIcon />}
        onClick={onClickCheckmark}
        title="Address found"
        opacity={1}
        styles={{ ...style.checkmarkIcon, ...styles }}
      />
    )
  }

  if (result === NULL_ADDRESS && !loading && !error) {
    return (
      <TransparentIconButton
        icon={<XIcon color={Color.textError} />}
        onClick={onClickNullAddressError}
        title="No address found"
        opacity={1}
        styles={styles}
      />
    )
  }

  if (loading) {
    return (
      <Box align="center" justify="center" styles={styles}>
        <div css={style.spinnerIcon}>
          <Spinner />
        </div>
      </Box>
    )
  }

  if (error) {
    return (
      <TransparentIconButton
        icon={<XIcon color={Color.textError} />}
        onClick={onClickGenericError}
        title="Error"
        opacity={1}
        styles={styles}
      />
    )
  }

  // Should never reach here
  return null
}

function DomainStatusSuccessDetails({ address }: { address: Address }) {
  return (
    <Box direction="column" align="center" margin="0 0 0.5em 0">
      <p css={style.modalDescription}>The following address was resolved:</p>
      <Address address={address} buttonType="copy" />
    </Box>
  )
}

const style: Stylesheet = {
  checkmarkIcon: {
    padding: 1,
    ':hover': {
      filter: 'brightness(1.2)',
    },
    ':active': {
      filter: 'brightness(1.1)',
    },
  },
  spinnerIcon: {
    opacity: 0.4,
    transform: 'scale(0.25)',
  },
  modalDescription: {
    ...modalStyles.p,
    margin: '0 0 1.5em 0',
    maxWidth: '20em',
  },
}
