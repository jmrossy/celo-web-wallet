import { BigNumber, BigNumberish } from 'ethers'
import { MIN_DISPLAY_VALUE, NULL_ADDRESS, WEI_PER_UNIT } from 'src/consts'
import { Balances } from 'src/features/balances/types'
import { CELO, cUSD, Token } from 'src/tokens'
import {
  areAmountsNearlyEqual,
  fromWei,
  fromWeiRounded,
  getAdjustedAmount,
  getAdjustedAmountFromBalances,
  range,
  toWei,
  validateAmount,
  validateAmountWithFees,
} from 'src/utils/amount'

function balance(amount: BigNumberish, token = CELO): Balances {
  return {
    tokenAddrToValue: { [token.address]: amount.toString() },
    lastUpdated: Date.now(),
  } as Balances
}

const fees = [
  {
    gasPrice: '333333333333',
    gasLimit: '30000',
    fee: toWei(0.1).toString(),
    feeToken: CELO.address,
  },
  {
    gasPrice: '333333333333',
    gasLimit: '60000',
    fee: toWei(0.2).toString(),
    feeToken: CELO.address,
  },
]

const nonStdToken: Token = {
  symbol: 'nonStdToken',
  name: 'nonStdToken',
  address: NULL_ADDRESS,
  chainId: 1,
  decimals: 6,
}

describe('range', () => {
  it('Creates ranges', () => {
    expect(range(3)).toEqual([0, 1, 2])
    expect(range(4, 1)).toEqual([1, 2, 3])
  })
})

describe('validateAmount', () => {
  it('Validates min', () => {
    expect(validateAmount(-1, CELO)).toBeTruthy()
    expect(validateAmount(0, CELO)).toBeTruthy()
    expect(validateAmount(10, CELO, null, null, 20)).toBeTruthy()
    expect(validateAmount(30, CELO, null, null, 20)).toBeFalsy()
  })
  it('Validates max', () => {
    expect(validateAmount('1000000000000000000', CELO, null, '500000000000000000')).toBeTruthy()
    expect(validateAmount('400000000000000000', CELO, null, '500000000000000000')).toBeFalsy()
    // Amounts nearly equal allowed
    expect(validateAmount('500000000000000001', CELO, null, '500000000000000000')).toBeFalsy()
  })
  it('Validates balances', () => {
    expect(validateAmount('1000000000000000000', CELO, balance('500000000000000000'))).toBeTruthy()
    expect(validateAmount('400000000000000000', CELO, balance('500000000000000000'))).toBeFalsy()
    // Amounts nearly equal allowed
    expect(validateAmount('500000000000000001', CELO, balance('500000000000000000'))).toBeFalsy()
  })
})

describe('validateAmountWithFees', () => {
  it('Requires fee', () => {
    expect(validateAmountWithFees(30, CELO, balance(30), undefined)).toBeTruthy()
  })
  it('Validates same fee currency', () => {
    expect(validateAmountWithFees(toWei(1), CELO, balance(toWei(2)), fees)).toBeFalsy()
    expect(validateAmountWithFees(toWei(1), CELO, balance(toWei(1)), fees)).toBeTruthy()
    expect(validateAmountWithFees(toWei(1), CELO, balance(toWei(1.2)), fees)).toBeTruthy()
    expect(validateAmountWithFees(toWei(1), CELO, balance(toWei(1.3)), fees)).toBeFalsy()
  })
  it('Validates diff fee currency', () => {
    expect(validateAmountWithFees(toWei(1), cUSD, balance(toWei(2)), fees)).toBeFalsy()
    expect(validateAmountWithFees(toWei(1), cUSD, balance(toWei(0.1)), fees)).toBeTruthy()
  })
})

describe('getAdjustedAmountFromBalances', () => {
  it('Adjusts price correctly', () => {
    expect(getAdjustedAmountFromBalances(toWei(1), cUSD, balance(toWei(2)), fees)).toEqual(toWei(1))
    expect(getAdjustedAmountFromBalances(toWei(1), cUSD, balance(toWei(1)), fees)).toEqual(toWei(1))
    expect(getAdjustedAmountFromBalances(toWei(1), CELO, balance(toWei(2)), fees)).toEqual(toWei(1))
    expect(getAdjustedAmountFromBalances(toWei(1), CELO, balance(toWei(1)), fees)).toEqual(
      toWei(0.7)
    )
  })
})

describe('getAdjustedAmount', () => {
  it('Adjusts price correctly', () => {
    expect(getAdjustedAmount(toWei(1), toWei(2), CELO)).toEqual(toWei(1))
    expect(getAdjustedAmount(toWei(1), toWei(1.0001), CELO)).toEqual(toWei(1.0001))
  })
})

describe('areAmountsNearlyEqual', () => {
  it('Checks standard tokens', () => {
    expect(areAmountsNearlyEqual(toWei(1), toWei(2), CELO)).toBeFalse()
    expect(areAmountsNearlyEqual(toWei(1), toWei(1), CELO)).toBeTrue()
    expect(areAmountsNearlyEqual(toWei(1), toWei(1 + MIN_DISPLAY_VALUE * 0.9), CELO)).toBeTrue()
    expect(areAmountsNearlyEqual(toWei(1), toWei(1 + MIN_DISPLAY_VALUE), CELO)).toBeFalse()
  })
  it('Checks non-standard tokens', () => {
    expect(areAmountsNearlyEqual(BigNumber.from('1000000'), '2000000', nonStdToken)).toBeFalse()
    expect(areAmountsNearlyEqual(BigNumber.from('1000000'), '1000000', nonStdToken)).toBeTrue()
    expect(areAmountsNearlyEqual(BigNumber.from('1000000'), '1000900', nonStdToken)).toBeTrue()
    expect(areAmountsNearlyEqual(BigNumber.from('1000000'), '1001000', nonStdToken)).toBeFalse()
  })
})

describe('fromWei', () => {
  it('Converts standard tokens', () => {
    expect(fromWei(undefined)).toEqual(0)
    expect(fromWei(WEI_PER_UNIT)).toEqual(1)
    expect(fromWei(1).toString()).toEqual('1e-18')
  })
  it('Converts non-standard tokens', () => {
    expect(fromWei(1000000, nonStdToken.decimals)).toEqual(1)
    expect(fromWei(1, nonStdToken.decimals)).toEqual(0.000001)
  })
})

describe('fromWeiRounded', () => {
  it('Converts standard tokens', () => {
    expect(fromWeiRounded(undefined)).toEqual('0')
    expect(fromWeiRounded(WEI_PER_UNIT)).toEqual('1.0')
    expect(fromWeiRounded(1)).toEqual('0')
    expect(fromWeiRounded(1, undefined, false)).toEqual('0.001')
  })
  it('Converts non-standard tokens', () => {
    expect(fromWeiRounded(1000000, nonStdToken.decimals)).toEqual('1.0')
    expect(fromWeiRounded(1, nonStdToken.decimals)).toEqual('0')
    expect(fromWeiRounded(1, nonStdToken.decimals, false)).toEqual('0.001')
  })
})

describe('toWei', () => {
  it('Converts standard tokens', () => {
    expect(toWei(undefined).toString()).toEqual('0')
    expect(toWei('0.000000000000000001').toString()).toEqual('1')
    expect(toWei('0.0000000000000000012345').toString()).toEqual('1')
    expect(toWei(1).toString()).toEqual(WEI_PER_UNIT)
  })
  it('Converts non-standard tokens', () => {
    expect(toWei(1, nonStdToken.decimals).toString()).toEqual('1000000')
    expect(toWei(0.000001, nonStdToken.decimals).toString()).toEqual('1')
    expect(toWei(0.00000156789, nonStdToken.decimals).toString()).toEqual('1')
  })
})
