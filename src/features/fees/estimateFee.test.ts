import { resolveTokenPreferenceOrder } from 'src/features/fees/feeTokenOrder'
import { CELO, cEUR, cUSD, NativeTokenId } from 'src/tokens'

describe('resolveCurrencyPreferenceOrder', () => {
  function getBaseBalances() {
    return {
      tokens: {
        CELO: {
          ...CELO,
          value: '0',
        },
        cUSD: {
          ...cUSD,
          value: '0',
        },
        cEUR: {
          ...cEUR,
          value: '0',
        },
      },
      lockedCelo: {
        locked: '0',
        pendingBlocked: '0',
        pendingFree: '0',
      },
      lastUpdated: null,
    }
  }

  it('Chooses correct order with no preferences', () => {
    const order = resolveTokenPreferenceOrder(getBaseBalances())
    expect(order).toEqual([NativeTokenId.CELO, NativeTokenId.cUSD, NativeTokenId.cEUR])
  })

  it('Chooses correct order with preferences', () => {
    const order1 = resolveTokenPreferenceOrder(
      getBaseBalances(),
      NativeTokenId.cEUR,
      NativeTokenId.cUSD
    )
    expect(order1).toEqual([NativeTokenId.cEUR, NativeTokenId.cUSD, NativeTokenId.CELO])
    const order2 = resolveTokenPreferenceOrder(
      getBaseBalances(),
      NativeTokenId.cUSD,
      NativeTokenId.cUSD
    )
    expect(order2).toEqual([NativeTokenId.cUSD, NativeTokenId.cEUR, NativeTokenId.CELO])
    const order3 = resolveTokenPreferenceOrder(getBaseBalances(), NativeTokenId.cUSD)
    expect(order3).toEqual([NativeTokenId.cUSD, NativeTokenId.cEUR, NativeTokenId.CELO])
    const order4 = resolveTokenPreferenceOrder(
      getBaseBalances(),
      NativeTokenId.cUSD,
      NativeTokenId.CELO
    )
    expect(order4).toEqual([NativeTokenId.cUSD, NativeTokenId.CELO, NativeTokenId.cEUR])
  })

  it('Chooses correct order with balances', () => {
    const balances1 = getBaseBalances()
    balances1.tokens.CELO.value = '100'
    const order1 = resolveTokenPreferenceOrder(balances1)
    expect(order1).toEqual([NativeTokenId.CELO, NativeTokenId.cUSD, NativeTokenId.cEUR])
    const balances2 = getBaseBalances()
    balances2.tokens.cEUR.value = '100'
    const order2 = resolveTokenPreferenceOrder(balances2, NativeTokenId.cUSD, NativeTokenId.cEUR)
    expect(order2).toEqual([NativeTokenId.cEUR, NativeTokenId.cUSD, NativeTokenId.CELO])
    const balances3 = getBaseBalances()
    balances3.tokens.cUSD.value = '200'
    balances3.tokens.CELO.value = '100'
    const order3 = resolveTokenPreferenceOrder(balances3, NativeTokenId.cEUR)
    expect(order3).toEqual([NativeTokenId.cUSD, NativeTokenId.CELO, NativeTokenId.cEUR])
    const balances4 = getBaseBalances()
    balances4.tokens.cUSD.value = '100'
    balances4.tokens.cEUR.value = '100'
    balances4.tokens.CELO.value = '100'
    const order4 = resolveTokenPreferenceOrder(balances4, NativeTokenId.CELO, NativeTokenId.cUSD)
    expect(order4).toEqual([NativeTokenId.CELO, NativeTokenId.cUSD, NativeTokenId.cEUR])
  })
})
