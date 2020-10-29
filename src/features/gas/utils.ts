import { BigNumber } from 'ethers'
import { Currency } from 'src/consts'
import { CeloTransaction } from 'src/features/feed/types'

export function getTransactionFee(tx: CeloTransaction) {
  // TODO support cUSD fees, assumes CELO for now
  const feeValue = BigNumber.from(tx.gasPrice)
    .mul(tx.gasUsed)
    .add(tx.gatewayFee ?? 0)
  return { feeValue, feeCurrency: Currency.CELO }
}
