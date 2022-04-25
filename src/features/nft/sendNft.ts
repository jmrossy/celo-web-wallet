import { appSelect } from 'src/app/appSelect'
import { SendNftParams } from 'src/features/nft/types'
import { isValidAddress } from 'src/utils/addresses'
import { safeParseInt } from 'src/utils/amount'
import { logger } from 'src/utils/logger'
import { createMonitoredSaga } from 'src/utils/saga'
import { ErrorState, invalidInput } from 'src/utils/validation'

export function validate(params: SendNftParams): ErrorState {
  const { recipient, contract, tokenId } = params
  let errors: ErrorState = { isValid: true }

  if (!recipient) {
    logger.error(`Invalid recipient: ${recipient}`)
    errors = {
      ...errors,
      ...invalidInput('recipient', 'Recipient is required'),
    }
  } else if (!isValidAddress(recipient)) {
    logger.error(`Invalid recipient: ${recipient}`)
    errors = {
      ...errors,
      ...invalidInput('recipient', 'Invalid Recipient'),
    }
  }

  if (!contract) {
    logger.error(`Invalid recipient: ${contract}`)
    errors = {
      ...errors,
      ...invalidInput('contract', 'Contract is required'),
    }
  } else if (!isValidAddress(contract)) {
    logger.error(`Invalid recipient: ${contract}`)
    errors = {
      ...errors,
      ...invalidInput('contract', 'Invalid Contract'),
    }
  }

  const parsedTokenId = safeParseInt(tokenId)
  if (parsedTokenId === null || parsedTokenId < 0) {
    logger.error(`Invalid tokenId: ${tokenId}`)
    errors = {
      ...errors,
      ...invalidInput('tokenId', 'Invalid Token Id'),
    }
  }

  return errors
}

function* sendNft({ recipient, contract, tokenId }: SendNftParams) {
  const address = yield* appSelect((state) => state.wallet.address)
  if (!address) throw new Error('Cannot send Nfts before address is set')
}

export const {
  name: sendNftSagaName,
  wrappedSaga: sendNftSaga,
  reducer: sendNftReducer,
  actions: sendNftActions,
} = createMonitoredSaga<SendNftParams>(sendNft, 'sendNft')
