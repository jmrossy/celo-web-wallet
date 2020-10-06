import { TransactionRequest } from '@ethersproject/abstract-provider'
import { getAddress } from '@ethersproject/address'
import { BigNumber, BigNumberish } from '@ethersproject/bignumber'
import {
  arrayify,
  BytesLike,
  DataOptions,
  hexlify,
  hexZeroPad,
  isBytesLike,
  SignatureLike,
  splitSignature,
  stripZeros,
} from '@ethersproject/bytes'
import { Zero } from '@ethersproject/constants'
import { keccak256 } from '@ethersproject/keccak256'
import { Logger } from '@ethersproject/logger'
import { checkProperties } from '@ethersproject/properties'
import * as RLP from '@ethersproject/rlp'
import { recoverAddress, Transaction } from '@ethersproject/transactions'

const logger = new Logger('celoTransactions')

export interface CeloTransactionRequest extends TransactionRequest {
  feeCurrency?: string
  gatewayFeeRecipient?: string
  gatewayFee?: BigNumberish
}

export interface CeloTransaction extends Transaction {
  feeCurrency?: string
  gatewayFeeRecipient?: string
  gatewayFee?: BigNumber
}

export const celoTransactionFields = [
  { name: 'nonce', maxLength: 32, numeric: true },
  { name: 'gasPrice', maxLength: 32, numeric: true },
  { name: 'gasLimit', maxLength: 32, numeric: true },
  { name: 'feeCurrency', length: 20 },
  { name: 'gatewayFeeRecipient', length: 20 },
  { name: 'gatewayFee', maxLength: 32, numeric: true },
  { name: 'to', length: 20 },
  { name: 'value', maxLength: 32, numeric: true },
  { name: 'data' },
]

export const celoAllowedTransactionKeys: { [key: string]: boolean } = {
  chainId: true,
  data: true,
  gasLimit: true,
  gasPrice: true,
  nonce: true,
  to: true,
  value: true,
  feeCurrency: true,
  gatewayFeeRecipient: true,
  gatewayFee: true,
}

// Almost identical to https://github.com/ethers-io/ethers.js/blob/master/packages/transactions/src.ts/index.ts#L85
// Need to override to use the celo tx prop whitelists above
export function serializeCeloTransaction(transaction: any, signature?: SignatureLike): string {
  checkProperties(transaction, celoAllowedTransactionKeys)

  const raw: Array<string | Uint8Array> = []

  celoTransactionFields.forEach(function (fieldInfo) {
    let value = (<any>transaction)[fieldInfo.name] || []
    const options: DataOptions = {}
    if (fieldInfo.numeric) {
      options.hexPad = 'left'
    }
    value = arrayify(hexlify(value, options))

    // Fixed-width field
    if (fieldInfo.length && value.length !== fieldInfo.length && value.length > 0) {
      logger.throwArgumentError(
        'invalid length for ' + fieldInfo.name,
        'transaction:' + fieldInfo.name,
        value
      )
    }

    // Variable-width (with a maximum)
    if (fieldInfo.maxLength) {
      value = stripZeros(value)
      if (value.length > fieldInfo.maxLength) {
        logger.throwArgumentError(
          'invalid length for ' + fieldInfo.name,
          'transaction:' + fieldInfo.name,
          value
        )
      }
    }

    raw.push(hexlify(value))
  })

  let chainId = 0
  if (transaction.chainId != null) {
    // A chainId was provided; if non-zero we'll use EIP-155
    chainId = transaction.chainId

    if (typeof chainId !== 'number') {
      logger.throwArgumentError('invalid transaction.chainId', 'transaction', transaction)
    }
  } else if (signature && !isBytesLike(signature) && signature.v && signature.v > 28) {
    // No chainId provided, but the signature is signing with EIP-155; derive chainId
    chainId = Math.floor((signature.v - 35) / 2)
  }

  // We have an EIP-155 transaction (chainId was specified and non-zero)
  if (chainId !== 0) {
    raw.push(hexlify(chainId)) // @TODO: hexValue?
    raw.push('0x')
    raw.push('0x')
  }

  // Requesting an unsigned transation
  if (!signature) {
    return RLP.encode(raw)
  }

  // The splitSignature will ensure the transaction has a recoveryParam in the
  // case that the signTransaction function only adds a v.
  const sig = splitSignature(signature)

  // We pushed a chainId and null r, s on for hashing only; remove those
  let v = 27 + sig.recoveryParam
  if (chainId !== 0) {
    raw.pop()
    raw.pop()
    raw.pop()
    v += chainId * 2 + 8

    // If an EIP-155 v (directly or indirectly; maybe _vs) was provided, check it!
    if (sig.v > 28 && sig.v !== v) {
      logger.throwArgumentError('transaction.chainId/signature.v mismatch', 'signature', signature)
    }
  } else if (sig.v !== v) {
    logger.throwArgumentError('transaction.chainId/signature.v mismatch', 'signature', signature)
  }

  raw.push(hexlify(v))
  raw.push(stripZeros(arrayify(sig.r)))
  raw.push(stripZeros(arrayify(sig.s)))

  return RLP.encode(raw)
}

// Almost identical to https://github.com/ethers-io/ethers.js/blob/master/packages/transactions/src.ts/index.ts#L165
// Need to override to use the celo tx prop whitelists above
export function parseCeloTransaction(rawTransaction: BytesLike): CeloTransaction {
  const transaction = RLP.decode(rawTransaction)

  if (transaction.length !== 12 && transaction.length !== 9) {
    logger.throwArgumentError('invalid raw transaction', 'rawTransaction', rawTransaction)
  }

  const tx: CeloTransaction = {
    nonce: handleNumber(transaction[0]).toNumber(),
    gasPrice: handleNumber(transaction[1]),
    gasLimit: handleNumber(transaction[2]),
    feeCurrency: handleAddress(transaction[3]),
    gatewayFeeRecipient: handleAddress(transaction[4]),
    gatewayFee: handleNumber(transaction[5]),
    to: handleAddress(transaction[6]),
    value: handleNumber(transaction[7]),
    data: transaction[8],
    chainId: 0,
  }

  // Legacy unsigned transaction
  if (transaction.length === 9) {
    return tx
  }

  try {
    tx.v = BigNumber.from(transaction[9]).toNumber()
  } catch (error) {
    console.log(error)
    return tx
  }

  tx.r = hexZeroPad(transaction[10], 32)
  tx.s = hexZeroPad(transaction[11], 32)

  if (BigNumber.from(tx.r).isZero() && BigNumber.from(tx.s).isZero()) {
    // EIP-155 unsigned transaction
    tx.chainId = tx.v
    tx.v = 0
  } else {
    // Signed Tranasaction

    tx.chainId = Math.floor((tx.v - 35) / 2)
    if (tx.chainId < 0) {
      tx.chainId = 0
    }

    let recoveryParam = tx.v - 27

    const raw = transaction.slice(0, 6)

    if (tx.chainId !== 0) {
      raw.push(hexlify(tx.chainId))
      raw.push('0x')
      raw.push('0x')
      recoveryParam -= tx.chainId * 2 + 8
    }

    const digest = keccak256(RLP.encode(raw))
    try {
      tx.from = recoverAddress(digest, {
        r: hexlify(tx.r),
        s: hexlify(tx.s),
        recoveryParam: recoveryParam,
      })
    } catch (error) {
      console.log(error)
    }

    tx.hash = keccak256(rawTransaction)
  }

  return tx
}

function handleAddress(value: string): string | undefined {
  if (value === '0x') {
    return undefined
  }
  return getAddress(value)
}

function handleNumber(value: string): BigNumber {
  if (value === '0x') {
    return Zero
  }
  return BigNumber.from(value)
}
