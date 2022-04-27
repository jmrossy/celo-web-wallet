import { providers } from 'ethers'
import { appSelect } from 'src/app/appSelect'
import { getErc721Contract } from 'src/blockchain/contracts'
import { sendSignedTransaction, signTransaction } from 'src/blockchain/transaction'
import { fetchBalancesActions } from 'src/features/balances/fetchBalances'
import { addPlaceholderTransaction } from 'src/features/feed/feedSlice'
import { createPlaceholderForTx } from 'src/features/feed/placeholder'
import { fetchNftsActions } from 'src/features/nft/fetchNfts'
import { SendNftParams } from 'src/features/nft/types'
import { setNumSignatures } from 'src/features/txFlow/txFlowSlice'
import { NftTransferTx, TransactionType } from 'src/features/types'
import { isValidAddress } from 'src/utils/addresses'
import { safeParseInt } from 'src/utils/amount'
import { logger } from 'src/utils/logger'
import { createMonitoredSaga } from 'src/utils/saga'
import { ErrorState, invalidInput, validateOrThrow } from 'src/utils/validation'
import { call, put } from 'typed-redux-saga'

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

function* sendNft(params: SendNftParams) {
  const address = yield* appSelect((state) => state.wallet.address)
  if (!address) throw new Error('Cannot send Nfts before address is set')

  validateOrThrow(() => validate(params), 'Invalid transaction')

  const signedTx = yield* call(createAndSignTx, address, params)
  yield* put(setNumSignatures(1))

  const txReceipt = yield* call(sendSignedTransaction, signedTx)
  logger.info(`NFT transfer hash received: ${txReceipt.transactionHash}`)

  const placeholderTx = getPlaceholderTx(params, txReceipt)
  yield* put(addPlaceholderTransaction(placeholderTx))

  yield* put(fetchNftsActions.trigger())
  yield* put(fetchBalancesActions.trigger())
}

export const {
  name: sendNftSagaName,
  wrappedSaga: sendNftSaga,
  reducer: sendNftReducer,
  actions: sendNftActions,
} = createMonitoredSaga<SendNftParams>(sendNft, 'sendNft')

async function createAndSignTx(accountAddr: Address, params: SendNftParams) {
  const tx = await createNftTransferTx(accountAddr, params)
  logger.info(`Signing tx to send NFT to ${params.recipient}`)
  const signedTx = await signTransaction(tx, params.feeEstimate)
  return signedTx
}

export function createNftTransferTx(accountAddr: Address, params: SendNftParams) {
  const { recipient, contract: contractAddr, tokenId } = params
  const contract = getErc721Contract(contractAddr)
  if (!contract) throw new Error(`No contract found for nft ${contractAddr}`)
  // Need to specify signature in method name because erc721 overloads safeTransferFrom
  return contract.populateTransaction['safeTransferFrom(address,address,uint256)'](
    accountAddr,
    recipient,
    tokenId
  )
}

function getPlaceholderTx(
  params: SendNftParams,
  txReceipt: providers.TransactionReceipt
): NftTransferTx {
  return {
    ...createPlaceholderForTx(txReceipt, '0', params.feeEstimate!),
    type: TransactionType.NftTransfer,
    to: params.recipient,
    contract: params.contract,
    tokenId: params.tokenId,
  }
}
