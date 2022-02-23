import { BigNumber, BigNumberish, utils } from 'ethers'
import { CeloContract, config } from 'src/config'
import { MAX_COMMENT_CHAR_LENGTH } from 'src/consts'
import { AbiInterfaceMap, BlockscoutTokenTransfer, BlockscoutTx } from 'src/features/feed/types'
import { OrderedVoteValue } from 'src/features/governance/types'
import {
  isNativeTokenAddress,
  isStableToken,
  isStableTokenAddress,
} from 'src/features/tokens/utils'
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
  OtherTokenApproveTx,
  OtherTokenTransferTx,
  OtherTx,
  StableTokenApproveTx,
  StableTokenTransferTx,
  StakeTokenTx,
  TokenExchangeTx,
  TokenTransaction,
  TransactionType,
} from 'src/features/types'
import { CELO, NativeTokensByAddress, Token } from 'src/tokens'
import { areAddressesEqual, isValidAddress, normalizeAddress } from 'src/utils/addresses'
import { logger } from 'src/utils/logger'

const SENTINEL_INVITE_COMMENT = '__CELO_INVITE_TX__'

export function isValidTransaction(tx: BlockscoutTx) {
  if (!tx) {
    logger.warn('Empty tx is invalid')
    return false
  }
  if (!tx.hash) {
    logger.warn(`Invalid tx; has no hash`)
    return false
  }
  if (!tx.to || !isValidAddress(tx.to)) {
    logger.warn(`tx ${tx.hash} has invalid to field`)
    return false
  }
  if (!tx.from || !isValidAddress(tx.from)) {
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
    logger.warn(`token transfer ${tx.hash} has no token symbol`)
    return false
  }
  if (!tx.contractAddress || !isValidAddress(tx.contractAddress)) {
    logger.warn(`token transfer ${tx.hash} has invalid contract address`)
    return false
  }
  return true
}

export function parseTransaction(
  tx: BlockscoutTx,
  address: Address, // wallet address
  tokensByAddress: Record<Address, Token>,
  exchangesByAddress: Record<Address, Token>,
  abiInterfaces: AbiInterfaceMap
): CeloTransaction | null {
  const to = normalizeAddress(tx.to)
  const from = normalizeAddress(tx.from)

  if (tx.isError === '1') {
    // TODO handle failed txs
    return null
  }

  if (exchangesByAddress[to]) {
    // If recipient was a known mento exchange
    return parseExchangeTx(
      tx,
      address,
      exchangesByAddress[to],
      abiInterfaces[CeloContract.Exchange]!
    )
  }

  if (areAddressesEqual(to, config.contractAddresses[CeloContract.GoldToken])) {
    return parseOutgoingTokenTx(tx, CELO, abiInterfaces[CeloContract.GoldToken]!)
  }

  if (tokensByAddress[to]) {
    // If recipient was a known token
    // Note, using StableToken ABI as its a superset of ERC20 ABI
    return parseOutgoingTokenTx(tx, tokensByAddress[to], abiInterfaces[CeloContract.StableToken]!)
  }

  if (areAddressesEqual(to, config.contractAddresses[CeloContract.Escrow])) {
    return parseOutgoingEscrowTx(tx, address, tokensByAddress, abiInterfaces)
  }

  if (areAddressesEqual(from, config.contractAddresses[CeloContract.Escrow])) {
    // TODO parse escrow incoming
  }

  if (areAddressesEqual(to, config.contractAddresses[CeloContract.LockedGold])) {
    return parseLockedGoldTx(tx, abiInterfaces)
  }

  if (areAddressesEqual(to, config.contractAddresses[CeloContract.Election])) {
    return parseElectionTx(tx, abiInterfaces)
  }

  if (areAddressesEqual(to, config.contractAddresses[CeloContract.Governance])) {
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
  address: Address,
  token: Token,
  abiInterface: utils.Interface
): TokenExchangeTx | OtherTx {
  try {
    const txDescription = abiInterface.parseTransaction({ data: tx.input, value: tx.value })
    const name = txDescription.name
    if (name === 'exchange' || name === 'sell') {
      return parseTokenExchange(
        tx,
        address,
        token,
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
  address: Address,
  token: Token,
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
    fromTokenId: sellGold ? CELO.address : token.address,
    toTokenId: sellGold ? token.address : CELO.address,
    fromValue: BigNumber.from(sellAmount).toString(),
    toValue: BigNumber.from(toValue).toString(),
  }
}

// Parse transactions to the token contracts
function parseOutgoingTokenTx(
  tx: BlockscoutTx,
  token: Token,
  abiInterface: utils.Interface
): TokenTransaction | OtherTx {
  try {
    const txDescription = abiInterface.parseTransaction({ data: tx.input, value: tx.value })
    const name = txDescription.name
    if (name === 'transfer' || name === 'transferWithComment') {
      return parseOutgoingTokenTransfer(
        tx,
        token,
        txDescription.args.to,
        txDescription.args.value,
        sanitizeComment(txDescription.args.comment)
      )
    }

    if (name === 'approve' || name === 'increaseAllowance') {
      return parseTokenApproveTx(tx, token, txDescription.args.spender, txDescription.args.value)
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
  token: Token,
  to: Address,
  value: BigNumberish,
  comment: string | undefined
): StableTokenTransferTx | CeloTokenTransferTx | OtherTokenTransferTx {
  const valueBn = BigNumber.from(value)
  if (!to || !isValidAddress(to) || !value || valueBn.isNegative()) {
    throw new Error('Transfer tx has invalid properties')
  }

  const result = { ...parseOtherTx(tx), to, value: valueBn.toString(), comment, isOutgoing: true }

  if (token.address === CELO.address) {
    return { ...result, type: TransactionType.CeloTokenTransfer, tokenId: token.address }
  } else if (isStableToken(token)) {
    return { ...result, type: TransactionType.StableTokenTransfer, tokenId: token.address }
  } else {
    return { ...result, type: TransactionType.OtherTokenTransfer, tokenId: token.address }
  }
}

function parseTokenApproveTx(
  tx: BlockscoutTx,
  token: Token,
  spender: Address,
  approvedValue: BigNumberish
): StableTokenApproveTx | CeloTokenApproveTx | OtherTokenApproveTx {
  const approvedValueBn = BigNumber.from(approvedValue)
  if (!spender || !isValidAddress(spender) || !approvedValue || approvedValueBn.isNegative()) {
    throw new Error('Approve tx has invalid properties')
  }

  const result = { ...parseOtherTx(tx), spender, approvedValue: approvedValueBn.toString() }

  if (token.address === CELO.address) {
    return { ...result, type: TransactionType.CeloTokenApprove, tokenId: token.address }
  } else if (isStableToken(token)) {
    return { ...result, type: TransactionType.StableTokenApprove, tokenId: token.address }
  } else {
    return { ...result, type: TransactionType.OtherTokenApprove, tokenId: token.address }
  }
}

function parseTxWithTokenTransfers(
  tx: BlockscoutTx,
  address: Address,
  abiInterfaces: AbiInterfaceMap
): StableTokenTransferTx | CeloTokenTransferTx | OtherTokenTransferTx | OtherTx | null {
  if (!tx.tokenTransfers || !tx.tokenTransfers.length) {
    logger.error('Parent tx does not have any token transfers', tx)
    return null
  }

  try {
    const totals: Record<Address, BigNumber> = {} // token addr to sum
    let biggestTransfer = tx.tokenTransfers[0]
    for (const transfer of tx.tokenTransfers) {
      if (!isValidTokenTransfer(transfer)) continue
      const tokenAddress = normalizeAddress(transfer.contractAddress)
      const transferValue = BigNumber.from(transfer.value)
      if (!totals[tokenAddress]) totals[tokenAddress] = BigNumber.from(0)
      if (areAddressesEqual(transfer.to, address)) {
        totals[tokenAddress] = totals[tokenAddress].add(transferValue)
      } else if (areAddressesEqual(transfer.from, address)) {
        totals[tokenAddress] = totals[tokenAddress].sub(transferValue)
      } else {
        continue
      }
      if (transferValue.gt(biggestTransfer.value)) biggestTransfer = transfer
    }

    // This logic assumes the biggest transfer is the 'main' transfer that
    // should define the tx's token and properties
    // If this doesn't work well, manually parsing the tx data may work too
    const tokenAddress = normalizeAddress(biggestTransfer.contractAddress)
    const comment = tryParseTransferComment(biggestTransfer, tokenAddress, abiInterfaces)

    const result = {
      ...parseOtherTx(tx),
      from: biggestTransfer.from,
      to: biggestTransfer.to,
      value: totals[tokenAddress].toString(),
      comment,
      isOutgoing: false,
    }

    if (tokenAddress === CELO.address) {
      return { ...result, type: TransactionType.CeloTokenTransfer, tokenId: tokenAddress }
    } else if (isStableTokenAddress(tokenAddress)) {
      return { ...result, type: TransactionType.StableTokenTransfer, tokenId: tokenAddress }
    } else {
      return { ...result, type: TransactionType.OtherTokenTransfer, tokenId: tokenAddress }
    }
  } catch (error) {
    logger.error('Failed to parse tx with token transfers', error, tx)
    return parseOtherTx(tx)
  }
}

function parseOutgoingEscrowTx(
  tx: BlockscoutTx,
  address: Address,
  tokens: Record<Address, Token>,
  abiInterfaces: AbiInterfaceMap
): EscrowTransaction | OtherTx {
  try {
    const abiInterface = abiInterfaces[CeloContract.Escrow]!
    const txDescription = abiInterface.parseTransaction({ data: tx.input, value: tx.value })
    const name = txDescription.name

    if (name === 'transfer') {
      const tokenAddress: Address | undefined = txDescription.args.token
      const value: BigNumberish | undefined = txDescription.args.value
      return parseOutgoingEscrowTransfer(tx, tokens, tokenAddress, value)
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
  tokens: Record<Address, Token>,
  tokenAddress?: Address,
  value?: BigNumberish
): EscrowTransferTx {
  if (!tokenAddress || !value) {
    throw new Error(`Escrow tx has invalid arguments: ${tokenAddress}, ${value}`)
  }

  const token = tokens[normalizeAddress(tokenAddress)]
  if (!token) {
    throw new Error(`No token found for address: ${tokenAddress}`)
  }

  return {
    ...parseOtherTx(tx),
    type: TransactionType.EscrowTransfer,
    value: BigNumber.from(value).toString(),
    isOutgoing: true,
    tokenId: token.address,
  }
}

function parseEscrowWithdraw(
  tx: BlockscoutTx,
  address: Address,
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
      const proposalId = BigNumber.from(txDescription.args.proposalId).toString()
      const voteValue = OrderedVoteValue[voteValueIndex]
      return {
        ...parseOtherTx(tx),
        type: TransactionType.GovernanceVote,
        proposalId,
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
  tokenAddress: Address,
  abiInterfaces: AbiInterfaceMap
): string | undefined {
  try {
    // Only supports native token contracts for now as transferWithComment
    // isn't in the ERC20 standard
    if (!isNativeTokenAddress(tokenAddress)) return undefined

    const abiInterface =
      tokenAddress === CELO.address
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
    tokenId: CELO.address,
  }
}

function parseOtherTx(tx: BlockscoutTx): OtherTx {
  return {
    type: TransactionType.Other,
    hash: tx.hash,
    from: tx.from,
    to: tx.to,
    value: tx.value,
    inputData: tx.input,
    blockNumber: BigNumber.from(tx.blockNumber).toNumber(),
    nonce: BigNumber.from(tx.nonce).toNumber(),
    timestamp: BigNumber.from(tx.timeStamp).toNumber(),
    gasPrice: tx.gasPrice,
    gasUsed: tx.gasUsed,
    feeCurrency: tokenSymbolToAddress(tx.feeCurrency),
    gatewayFee: tx.gatewayFee,
    gatewayFeeRecipient: tx.gatewayFeeRecipient,
  }
}

function tokenSymbolToAddress(
  symbol: string | null | undefined,
  tokens: Record<Address, Token> = NativeTokensByAddress
): string {
  if (!symbol || symbol.toLowerCase() === 'cgld') return CELO.address
  for (const token of Object.values(tokens) as Token[]) {
    if (symbol.toLowerCase() === token.symbol.toLowerCase()) return token.address
  }
  throw new Error(`No address found for token symbol ${symbol}`)
}

function isTxInputEmpty(tx: BlockscoutTx) {
  return !tx.input || tx.input.toLowerCase() === '0x' || BigNumber.from(tx.input).isZero()
}
