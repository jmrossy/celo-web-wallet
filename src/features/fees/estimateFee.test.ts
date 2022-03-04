import { TokenBalances } from 'src/features/balances/types'
import { resolveTokenPreferenceOrder } from 'src/features/fees/feeTokenOrder'
import { CELO, cEUR, cREAL, cUSD, NativeTokens, Token } from 'src/tokens'

describe('resolveCurrencyPreferenceOrder', () => {
  function getBaseBalances() {
    return NativeTokens.reduce<TokenBalances>((result, token: Token) => {
      result[token.address] = { ...token, value: '0' }
      return result
    }, {})
  }

  it('Chooses correct order with no preferences', () => {
    const order = resolveTokenPreferenceOrder(getBaseBalances())
    expect(order).toEqual([CELO.address, cUSD.address, cEUR.address, cREAL.address])
  })

  it('Chooses correct order with preferences', () => {
    const order1 = resolveTokenPreferenceOrder(getBaseBalances(), cEUR.address, cUSD.address)
    expect(order1).toEqual([cEUR.address, cUSD.address, CELO.address, cREAL.address])
    const order2 = resolveTokenPreferenceOrder(getBaseBalances(), cUSD.address, cUSD.address)
    expect(order2).toEqual([cUSD.address, CELO.address, cEUR.address, cREAL.address])
    const order3 = resolveTokenPreferenceOrder(getBaseBalances(), cUSD.address)
    expect(order3).toEqual([cUSD.address, CELO.address, cEUR.address, cREAL.address])
    const order4 = resolveTokenPreferenceOrder(getBaseBalances(), cUSD.address, cREAL.address)
    expect(order4).toEqual([cUSD.address, cREAL.address, CELO.address, cEUR.address])
  })

  it('Chooses correct order with balances', () => {
    const balances1 = getBaseBalances()
    balances1[CELO.address].value = '100'
    const order1 = resolveTokenPreferenceOrder(balances1)
    expect(order1).toEqual([CELO.address, cUSD.address, cEUR.address, cREAL.address])
    const balances2 = getBaseBalances()
    balances2[cEUR.address].value = '100'
    const order2 = resolveTokenPreferenceOrder(balances2, cUSD.address, cEUR.address)
    expect(order2).toEqual([cEUR.address, cUSD.address, CELO.address, cREAL.address])
    const balances3 = getBaseBalances()
    balances3[cUSD.address].value = '200'
    balances3[CELO.address].value = '100'
    const order3 = resolveTokenPreferenceOrder(balances3, cEUR.address)
    expect(order3).toEqual([cUSD.address, CELO.address, cEUR.address, cREAL.address])
    const balances4 = getBaseBalances()
    balances4[cUSD.address].value = '100'
    balances4[cEUR.address].value = '100'
    balances4[CELO.address].value = '100'
    const order4 = resolveTokenPreferenceOrder(balances4, CELO.address, cUSD.address)
    expect(order4).toEqual([CELO.address, cUSD.address, cEUR.address, cREAL.address])
  })
})
