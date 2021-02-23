import { BigNumber, BigNumberish, utils } from 'ethers'
import { RootState } from 'src/app/rootReducer'
import { getContract, getCurrencyFromContract } from 'src/blockchain/contracts'
import { isSignerSet } from 'src/blockchain/signer'
import { CeloContract, config } from 'src/config'
import { MAX_COMMENT_CHAR_LENGTH } from 'src/consts'
import { Currency } from 'src/currency'
import { addTransactions } from 'src/features/feed/feedSlice'
import { OrderedVoteValue } from 'src/features/governance/types'
import {
  CeloNativeTransferTx,
  CeloTokenApproveTx,
  CeloTokenTransferTx,
  CeloTransaction,
  EscrowTransaction,
  EscrowTransferTx,
  EscrowWithdrawTx,
  GovernanceVoteTx,
  LockTokenTx,
  OtherTx,
  StableTokenApproveTx,
  StableTokenTransferTx,
  StakeTokenTx,
  TokenExchangeTx,
  TokenTransaction,
  TransactionMap,
  TransactionType,
} from 'src/features/types'
import { fetchBalancesActions } from 'src/features/wallet/fetchBalances'
import { areAddressesEqual } from 'src/utils/addresses'
import { queryBlockscout } from 'src/utils/blockscout'
import { logger } from 'src/utils/logger'
import { createMonitoredSaga } from 'src/utils/saga'
import { call, delay, put, select } from 'typed-redux-saga'

const QUERY_DEBOUNCE_TIME = 2000 // 2 seconds
const POLL_DELAY = 10000 // 10 seconds
const SENTINEL_INVITE_COMMENT = '__CELO_INVITE_TX__'

interface BlockscoutTxBase {
  hash: string
  value: string
  from: string
  to: string
  input: string
  gas: string
  gasUsed: string
  gasPrice: string
  gatewayFee: string
  gatewayFeeRecipient: string
  feeCurrency: string
  nonce: string
  timeStamp: string
  contractAddress: string
  confirmations: string
  blockNumber: string
  blockHash: string
  cumulativeGasUsed: string
  transactionIndex: string
  isError?: string
}

interface BlockscoutTx extends BlockscoutTxBase {
  tokenTransfers?: BlockscoutTokenTransfer[]
}

interface BlockscoutTokenTransfer extends BlockscoutTxBase {
  tokenSymbol: string
  tokenName: string
  tokenDecimal: string
  logIndex: string
}

// Triggers polling of feed fetching
export function* feedFetchPoller() {
  // TODO only do this when home screen is showing
  while (true) {
    yield* delay(POLL_DELAY)
    if (!isSignerSet()) continue
    yield* put(fetchFeedActions.trigger())
  }
}

function* fetchFeed() {
  const address = yield* select((state: RootState) => state.wallet.address)
  const lastUpdatedTime = yield* select((state: RootState) => state.feed.lastUpdatedTime)
  const lastBlockNumber = yield* select((state: RootState) => state.feed.lastBlockNumber)

  if (!address || !isSignerSet()) return

  const now = Date.now()
  if (lastUpdatedTime && now - lastUpdatedTime < QUERY_DEBOUNCE_TIME) return

  const { newTransactions, newLastBlockNumber } = yield* call(doFetchFeed, address, lastBlockNumber)
  yield* put(
    addTransactions({
      txs: newTransactions,
      lastUpdatedTime: now,
      lastBlockNumber: newLastBlockNumber,
    })
  )

  if (Object.keys(newTransactions).length > 0) {
    yield* put(fetchBalancesActions.trigger())
  }
}

export const {
  name: fetchFeedSagaName,
  wrappedSaga: fetchFeedSaga,
  reducer: fetchFeedReducer,
  actions: fetchFeedActions,
} = createMonitoredSaga(fetchFeed, 'fetchFeed')

async function doFetchFeed(address: string, lastBlockNumber: number | null) {
  const txList = await fetchTxsFromBlockscout(address, lastBlockNumber)
  const abiInterfaces = getAbiInterfacesForParsing()

  const newTransactions: TransactionMap = {}
  let newLastBlockNumber = lastBlockNumber || 0

  for (const tx of txList) {
    if (!isValidTransaction(tx)) continue
    newLastBlockNumber = Math.max(BigNumber.from(tx.blockNumber).toNumber(), newLastBlockNumber)
    const parsedTx = parseTransaction(tx, address, abiInterfaces)
    if (parsedTx) {
      newTransactions[parsedTx.hash] = parsedTx
    }
  }

  return { newTransactions, newLastBlockNumber }
}

async function fetchTxsFromBlockscout(address: string, lastBlockNumber: number | null) {
  // TODO consider pagination here

  // First fetch the basic tx list, which includes outgoing token transfers
  let txQueryUrl = config.blockscoutUrl + '/api?module=account&action=txlist&address=' + address
  if (lastBlockNumber) {
    txQueryUrl += `&startblock=${lastBlockNumber + 1}`
  }
  const txListP = queryBlockscout<Array<BlockscoutTx>>(txQueryUrl)

  // The txlist query alone doesn't get all needed transactions
  // It excludes incoming token transfers so we need a second query to cover those
  // TODO better handle case where tokenTx for given tx isn't available yet
  // Blockscout tends to need more time with those
  let tokenTxQueryUrl =
    config.blockscoutUrl + '/api?module=account&action=tokentx&address=' + address
  if (lastBlockNumber) {
    tokenTxQueryUrl += `&startblock=${lastBlockNumber + 1}`
  }
  const tokenTxListP = queryBlockscout<Array<BlockscoutTokenTransfer>>(tokenTxQueryUrl)

  const [txList, tokenTxList] = await Promise.all([txListP, tokenTxListP])

  // Create a map of hash to txs
  const txMap = new Map<string, BlockscoutTx>()
  for (const tx of txList) {
    txMap.set(tx.hash, tx)
  }

  //  Attach the token transfers to their parent txs in the first list
  for (const tx of tokenTxList) {
    // If transfer doesn't have a corresponding tx from the first list, make a placeholder
    // Most common reason would be incoming token transfer
    if (!txMap.has(tx.hash)) {
      txMap.set(tx.hash, copyTx(tx))
    }

    const parentTx = txMap.get(tx.hash)!
    if (!parentTx.tokenTransfers) {
      parentTx.tokenTransfers = []
    }
    parentTx.tokenTransfers.push(tx)
  }
  return txMap.values()
}

type AbiInterfaceMap = Partial<Record<CeloContract, utils.Interface>>

function getAbiInterfacesForParsing(): AbiInterfaceMap {
  const goldTokenContract = getContract(CeloContract.GoldToken)
  const stableTokenContract = getContract(CeloContract.StableToken)
  const exchangeContract = getContract(CeloContract.Exchange)
  const escrowContract = getContract(CeloContract.Escrow)
  const lockedGoldContract = getContract(CeloContract.LockedGold)
  const electionContract = getContract(CeloContract.Election)
  const governanceContract = getContract(CeloContract.Governance)

  return {
    [CeloContract.GoldToken]: goldTokenContract.interface,
    [CeloContract.StableToken]: stableTokenContract.interface,
    [CeloContract.Exchange]: exchangeContract.interface,
    [CeloContract.Escrow]: escrowContract.interface,
    [CeloContract.LockedGold]: lockedGoldContract.interface,
    [CeloContract.Election]: electionContract.interface,
    [CeloContract.Governance]: governanceContract.interface,
  }
}

function isValidTransaction(tx: BlockscoutTx) {
  if (!tx) {
    logger.warn('Empty tx is invalid')
    return false
  }

  if (!tx.hash) {
    logger.warn(`Invalid tx; has no hash`)
    return false
  }

  if (!tx.to || !utils.isAddress(tx.to)) {
    logger.warn(`tx ${tx.hash} has invalid to field`)
    return false
  }

  if (!tx.from || !utils.isAddress(tx.from)) {
    logger.warn(`tx ${tx.hash} has invalid from field`)
    return false
  }

  if (!tx.blockNumber || BigNumber.from(tx.blockNumber).lte(0)) {
    logger.warn(`tx ${tx.hash} has invalid block number`)
    return false
  }

  return true
}

function isValidTokenTransfer(tx: BlockscoutTokenTransfer) {
  if (!isValidTransaction(tx)) {
    return
  }

  if (!tx.value || BigNumber.from(tx.value).lte(0)) {
    logger.warn(`token transfer ${tx.hash} has invalid value`)
    return false
  }

  if (!tx.tokenSymbol) {
    logger.warn(`token transfer  ${tx.hash} has invalid token symbol`)
    return false
  }

  return true
}

function parseTransaction(
  tx: BlockscoutTx,
  address: string,
  abiInterfaces: AbiInterfaceMap
): CeloTransaction | null {
  if (tx.isError === '1') {
    // TODO handle failed txs
    return null
  }

  if (areAddressesEqual(tx.to, config.contractAddresses[CeloContract.Exchange])) {
    return parseExchangeTx(tx, address, abiInterfaces[CeloContract.Exchange]!)
  }

  if (areAddressesEqual(tx.to, config.contractAddresses[CeloContract.StableToken])) {
    return parseOutgoingTokenTx(tx, Currency.cUSD, abiInterfaces[CeloContract.StableToken]!)
  }

  if (areAddressesEqual(tx.to, config.contractAddresses[CeloContract.GoldToken])) {
    return parseOutgoingTokenTx(tx, Currency.CELO, abiInterfaces[CeloContract.GoldToken]!)
  }

  if (areAddressesEqual(tx.to, config.contractAddresses[CeloContract.Escrow])) {
    return parseOutgoingEscrowTx(tx, address, abiInterfaces)
  }

  if (areAddressesEqual(tx.from, config.contractAddresses[CeloContract.Escrow])) {
    // TODO parse escrow incoming
  }

  if (areAddressesEqual(tx.to, config.contractAddresses[CeloContract.LockedGold])) {
    return parseLockedGoldTx(tx, abiInterfaces)
  }

  if (areAddressesEqual(tx.to, config.contractAddresses[CeloContract.Election])) {
    return parseElectionTx(tx, abiInterfaces)
  }

  if (areAddressesEqual(tx.to, config.contractAddresses[CeloContract.Governance])) {
    return parseGovernanceTx(tx, abiInterfaces)
  }

  if (tx.tokenTransfers && tx.tokenTransfers.length && !isTxInputEmpty(tx)) {
    return parseTxWithTokenTransfers(tx, address, abiInterfaces)
  }

  if (tx.value && BigNumber.from(tx.value).gt(0)) {
    return parseNativeTransferTx(tx, address)
  }

  return parseOtherTx(tx)
}

function parseExchangeTx(
  tx: BlockscoutTx,
  address: string,
  abiInterface: utils.Interface
): TokenExchangeTx | OtherTx {
  try {
    const txDescription = abiInterface.parseTransaction({ data: tx.input, value: tx.value })
    const name = txDescription.name
    if (name === 'exchange' || name === 'sell') {
      return parseTokenExchange(
        tx,
        address,
        txDescription.args.sellAmount,
        txDescription.args.minBuyAmount,
        txDescription.args.sellGold
      )
    }

    logger.warn(`Parsing exchange tx with unsupported tx description name: ${name}`, tx)
    return parseOtherTx(tx)
  } catch (error) {
    logger.error('Failed to parse exchange tx data', error, tx)
    return parseOtherTx(tx)
  }
}

function parseTokenExchange(
  tx: BlockscoutTx,
  address: string,
  sellAmount: BigNumberish | undefined,
  minBuyAmount: BigNumberish | undefined,
  sellGold: boolean | undefined
): TokenExchangeTx | OtherTx {
  if (!sellAmount || !minBuyAmount) {
    throw new Error('Invalid exchange args')
  }

  let toValue: BigNumberish
  if (tx.tokenTransfers && tx.tokenTransfers.length >= 2) {
    // Find largest incoming transfer, we assume that's the received exchange funds
    // Normally there would only be one incoming transfer. This is to handle the
    // rare case where there are more (like a validator exchanging and also receiving fees)
    let largestIncomingTransfer: BlockscoutTokenTransfer | null = null
    for (const transfer of tx.tokenTransfers) {
      if (!isValidTokenTransfer(transfer)) continue
      const isIncoming = areAddressesEqual(transfer.to, address)
      if (!isIncoming) continue
      const value = BigNumber.from(transfer.value)
      if (!largestIncomingTransfer || value.gt(largestIncomingTransfer.value)) {
        largestIncomingTransfer = transfer
      }
    }

    if (largestIncomingTransfer) {
      toValue = largestIncomingTransfer.value
    } else {
      logger.warn('No incoming transfers for exchange found, using minBuyAmount instead')
      toValue = minBuyAmount
    }
  } else {
    logger.warn('Exchange tx did not have two token transfers, using minBuyAmount instead')
    toValue = minBuyAmount
  }

  return {
    ...parseOtherTx(tx),
    type: TransactionType.TokenExchange,
    fromToken: sellGold ? Currency.CELO : Currency.cUSD,
    toToken: sellGold ? Currency.cUSD : Currency.CELO,
    fromValue: BigNumber.from(sellAmount).toString(),
    toValue: BigNumber.from(toValue).toString(),
  }
}

// Parse transactions to the token contracts
function parseOutgoingTokenTx(
  tx: BlockscoutTx,
  currency: Currency,
  abiInterface: utils.Interface
): TokenTransaction | OtherTx {
  try {
    const txDescription = abiInterface.parseTransaction({ data: tx.input, value: tx.value })
    const name = txDescription.name
    if (name === 'transfer' || name === 'transferWithComment') {
      return parseOutgoingTokenTransfer(
        tx,
        currency,
        txDescription.args.to,
        txDescription.args.value,
        sanitizeComment(txDescription.args.comment)
      )
    }

    if (name === 'approve' || name === 'increaseAllowance') {
      return parseTokenApproveTx(tx, currency, txDescription.args.spender, txDescription.args.value)
    }

    logger.warn(`Parsing token tx with unsupported tx description name: ${name}`, tx)
    return parseOtherTx(tx)
  } catch (error) {
    logger.error('Failed to parse token tx data', error, tx)
    return parseOtherTx(tx)
  }
}

function parseOutgoingTokenTransfer(
  tx: BlockscoutTx,
  currency: Currency,
  to: string,
  value: BigNumberish,
  comment: string | undefined
): StableTokenTransferTx | CeloTokenTransferTx | OtherTx {
  const valueBn = BigNumber.from(value)
  if (!to || !utils.isAddress(to) || !value || valueBn.isNegative()) {
    throw new Error('Transfer tx has invalid properties')
  }

  const result = { ...parseOtherTx(tx), to, value: valueBn.toString(), comment, isOutgoing: true }

  if (currency === Currency.CELO) {
    return { ...result, type: TransactionType.CeloTokenTransfer, currency: Currency.CELO }
  } else {
    return { ...result, type: TransactionType.StableTokenTransfer, currency: Currency.cUSD }
  }
}

function parseTokenApproveTx(
  tx: BlockscoutTx,
  currency: Currency,
  spender: string,
  approvedValue: BigNumberish
): StableTokenApproveTx | CeloTokenApproveTx | OtherTx {
  const approvedValueBn = BigNumber.from(approvedValue)
  if (!spender || !utils.isAddress(spender) || !approvedValue || approvedValueBn.isNegative()) {
    throw new Error('Approve tx has invalid properties')
  }

  const result = { ...parseOtherTx(tx), spender, approvedValue: approvedValueBn.toString() }

  if (currency === Currency.CELO) {
    return { ...result, type: TransactionType.CeloTokenApprove, currency: Currency.CELO }
  } else {
    return { ...result, type: TransactionType.StableTokenApprove, currency: Currency.cUSD }
  }
}

function parseTxWithTokenTransfers(
  tx: BlockscoutTx,
  address: string,
  abiInterfaces: AbiInterfaceMap
): StableTokenTransferTx | CeloTokenTransferTx | OtherTx | null {
  if (!tx.tokenTransfers || !tx.tokenTransfers.length) {
    logger.error('Parent tx does not have any token transfers', tx)
    return null
  }

  try {
    const totals = {
      [Currency.CELO]: BigNumber.from(0),
      [Currency.cUSD]: BigNumber.from(0),
    }
    for (const transfer of tx.tokenTransfers) {
      if (!isValidTokenTransfer(transfer)) continue

      const currency = tokenSymbolToCurrency(transfer.tokenSymbol)

      if (areAddressesEqual(transfer.to, address)) {
        totals[currency] = totals[currency].add(transfer.value)
      } else if (areAddressesEqual(transfer.from, address)) {
        totals[currency] = totals[currency].sub(transfer.value)
      } else {
        continue
      }
    }

    // This logic assumes blockscout puts the main transfer (i.e. not gas
    // transfers) first the list. If that changes this needs to be smarter.
    const mainTransfer = tx.tokenTransfers[0]
    const currency = tokenSymbolToCurrency(mainTransfer.tokenSymbol)
    const comment = tryParseTransferComment(mainTransfer, currency, abiInterfaces)

    const result = {
      ...parseOtherTx(tx),
      from: mainTransfer.from,
      to: mainTransfer.to,
      value: totals[currency].toString(),
      comment,
      isOutgoing: false,
    }

    if (currency === Currency.CELO) {
      return { ...result, type: TransactionType.CeloTokenTransfer, currency: Currency.CELO }
    } else {
      return { ...result, type: TransactionType.StableTokenTransfer, currency: Currency.cUSD }
    }
  } catch (error) {
    logger.error('Failed to parse tx with token transfers', error, tx)
    return parseOtherTx(tx)
  }
}

function parseOutgoingEscrowTx(
  tx: BlockscoutTx,
  address: string,
  abiInterfaces: AbiInterfaceMap
): EscrowTransaction | OtherTx {
  try {
    const abiInterface = abiInterfaces[CeloContract.Escrow]!
    const txDescription = abiInterface.parseTransaction({ data: tx.input, value: tx.value })
    const name = txDescription.name

    if (name === 'transfer') {
      const tokenAddress: string | undefined = txDescription.args.token
      const value: BigNumberish | undefined = txDescription.args.value
      return parseOutgoingEscrowTransfer(tx, tokenAddress, value)
    }

    if (name === 'withdraw') {
      return parseEscrowWithdraw(tx, address, abiInterfaces)
    }

    logger.warn(`Unsupported escrow method: ${name}`)
    return parseOtherTx(tx)
  } catch (error) {
    logger.error('Failed to parse escrow transfer', error, tx)
    return parseOtherTx(tx)
  }
}

function parseOutgoingEscrowTransfer(
  tx: BlockscoutTx,
  tokenAddress?: string,
  value?: BigNumberish
): EscrowTransferTx {
  if (!tokenAddress || !value) {
    throw new Error(`Escrow tx has invalid aruments: ${tokenAddress}, ${value}`)
  }

  const currency = getCurrencyFromContract(tokenAddress)
  if (!currency) {
    throw new Error(`No currency found for token address: ${tokenAddress}`)
  }

  return {
    ...parseOtherTx(tx),
    type: TransactionType.EscrowTransfer,
    value: BigNumber.from(value).toString(),
    isOutgoing: true,
    currency,
  }
}

function parseEscrowWithdraw(
  tx: BlockscoutTx,
  address: string,
  abiInterfaces: AbiInterfaceMap
): EscrowWithdrawTx {
  const parsedTx = parseTxWithTokenTransfers(tx, address, abiInterfaces)

  if (!parsedTx || parsedTx.type === TransactionType.Other) {
    throw new Error('Escrow withdrawal has no token transfers or could not be parsed')
  }

  return { ...parsedTx, type: TransactionType.EscrowWithdraw, isOutgoing: false }
}

function parseLockedGoldTx(
  tx: BlockscoutTx,
  abiInterfaces: AbiInterfaceMap
): LockTokenTx | OtherTx {
  try {
    const abiInterface = abiInterfaces[CeloContract.LockedGold]!
    const txDescription = abiInterface.parseTransaction({ data: tx.input, value: tx.value })
    const name = txDescription.name

    if (name === 'lock') {
      return {
        ...parseOtherTx(tx),
        type: TransactionType.LockCelo,
      }
    }
    if (name === 'relock') {
      return {
        ...parseOtherTx(tx),
        type: TransactionType.RelockCelo,
        value: BigNumber.from(txDescription.args.value).toString(),
      }
    }
    if (name === 'unlock') {
      return {
        ...parseOtherTx(tx),
        type: TransactionType.UnlockCelo,
        value: BigNumber.from(txDescription.args.value).toString(),
      }
    }
    if (name === 'withdraw') {
      let value = '0'
      if (tx.tokenTransfers?.length) {
        value = tx.tokenTransfers[0].value
      }
      return {
        ...parseOtherTx(tx),
        type: TransactionType.WithdrawLockedCelo,
        value,
      }
    }

    logger.warn(`Unsupported locked gold method: ${name}`)
    return parseOtherTx(tx)
  } catch (error) {
    logger.error('Failed to parse locked gold tx', error, tx)
    return parseOtherTx(tx)
  }
}

function parseElectionTx(tx: BlockscoutTx, abiInterfaces: AbiInterfaceMap): StakeTokenTx | OtherTx {
  try {
    const abiInterface = abiInterfaces[CeloContract.Election]!
    const txDescription = abiInterface.parseTransaction({ data: tx.input, value: tx.value })
    const name = txDescription.name
    const groupAddress = txDescription.args?.group

    if (name === 'vote' || name === 'revokeActive' || name === 'revokePending') {
      const type =
        name === 'vote'
          ? TransactionType.ValidatorVoteCelo
          : name === 'revokeActive'
          ? TransactionType.ValidatorRevokeActiveCelo
          : TransactionType.ValidatorRevokePendingCelo
      return {
        ...parseOtherTx(tx),
        type,
        groupAddress,
        value: BigNumber.from(txDescription.args.value).toString(),
      }
    }
    if (name === 'activate') {
      return {
        ...parseOtherTx(tx),
        type: TransactionType.ValidatorActivateCelo,
        groupAddress,
      }
    }

    logger.warn(`Unsupported election method: ${name}`)
    return parseOtherTx(tx)
  } catch (error) {
    logger.error('Failed to parse eletion tx', error, tx)
    return parseOtherTx(tx)
  }
}

function parseGovernanceTx(
  tx: BlockscoutTx,
  abiInterfaces: AbiInterfaceMap
): GovernanceVoteTx | OtherTx {
  try {
    const abiInterface = abiInterfaces[CeloContract.Governance]!
    const txDescription = abiInterface.parseTransaction({ data: tx.input, value: tx.value })
    const name = txDescription.name

    if (name === 'vote') {
      const voteValueIndex = BigNumber.from(txDescription.args.value).toNumber()
      const voteValue = OrderedVoteValue[voteValueIndex]
      return {
        ...parseOtherTx(tx),
        type: TransactionType.GovernanceVote,
        proposalId: txDescription.args.proposalId,
        vote: voteValue,
      }
    }

    logger.warn(`Unsupported governance method: ${name}`)
    return parseOtherTx(tx)
  } catch (error) {
    logger.error('Failed to parse governance tx', error, tx)
    return parseOtherTx(tx)
  }
}

function tryParseTransferComment(
  tx: BlockscoutTokenTransfer,
  currency: Currency,
  abiInterfaces: AbiInterfaceMap
): string | undefined {
  try {
    const abiInterface =
      currency === Currency.CELO
        ? abiInterfaces[CeloContract.GoldToken]
        : abiInterfaces[CeloContract.StableToken]
    const txDescription = abiInterface!.parseTransaction({ data: tx.input })
    if (txDescription.name === 'transferWithComment') {
      return sanitizeComment(txDescription.args.comment)
    } else {
      return undefined
    }
  } catch (error) {
    logger.warn('Could not parse transfer comment', tx)
    return undefined
  }
}

function sanitizeComment(comment: string | undefined) {
  if (!comment || !comment.length) return undefined
  if (comment === SENTINEL_INVITE_COMMENT) return 'Invite Sent'
  // Likely an encrypted comment or some other non-human-intended text
  if (comment.length > MAX_COMMENT_CHAR_LENGTH) return undefined
  return comment
}

function parseNativeTransferTx(tx: BlockscoutTx, address: string): CeloNativeTransferTx {
  return {
    ...parseOtherTx(tx),
    type: TransactionType.CeloNativeTransfer,
    isOutgoing: areAddressesEqual(tx.from, address),
    comment: undefined,
    currency: Currency.CELO,
  }
}

function parseOtherTx(tx: BlockscoutTx): OtherTx {
  return {
    type: TransactionType.Other,
    hash: tx.hash,
    from: tx.from,
    to: tx.to,
    value: tx.value,
    blockNumber: BigNumber.from(tx.blockNumber).toNumber(),
    nonce: BigNumber.from(tx.nonce).toNumber(),
    timestamp: BigNumber.from(tx.timeStamp).toNumber(),
    gasPrice: tx.gasPrice,
    gasUsed: tx.gasUsed,
    feeCurrency: tokenSymbolToCurrency(tx.feeCurrency),
    gatewayFee: tx.gatewayFee,
    gatewayFeeRecipient: tx.gatewayFeeRecipient,
  }
}

function copyTx(tx: BlockscoutTxBase): BlockscoutTx {
  // Don't just use destructuring here because extra fields
  // should be filtered out
  return {
    hash: tx.hash,
    value: tx.value,
    from: tx.from,
    to: tx.to,
    input: tx.input,
    gas: tx.gas,
    gasUsed: tx.gasUsed,
    gasPrice: tx.gasPrice,
    feeCurrency: tx.feeCurrency,
    gatewayFee: tx.gatewayFee,
    gatewayFeeRecipient: tx.gatewayFeeRecipient,
    nonce: tx.nonce,
    timeStamp: tx.timeStamp,
    contractAddress: tx.contractAddress,
    confirmations: tx.confirmations,
    blockNumber: tx.blockNumber,
    blockHash: tx.blockHash,
    cumulativeGasUsed: tx.cumulativeGasUsed,
    transactionIndex: tx.transactionIndex,
  }
}

function tokenSymbolToCurrency(symbol?: string) {
  if (symbol && symbol.toLowerCase() === 'cusd') {
    return Currency.cUSD
  } else {
    return Currency.CELO
  }
}

function isTxInputEmpty(tx: BlockscoutTx) {
  return !tx.input || tx.input.toLowerCase() === '0x' || BigNumber.from(tx.input).isZero()
}
