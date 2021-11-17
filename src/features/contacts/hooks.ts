import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '../../app/rootReducer'
import { useAccountList } from '../wallet/hooks'
import { normalizeAddress, shortenAddress } from '../../utils/addresses'
import { trimToLength } from '../../utils/string'

export function useContactsAndAccountsSelect() {
  const contactMap = useSelector((s: RootState) => s.contacts.contacts)
  const accounts = useAccountList() || []
  return useMemo(
    () =>
      Object.values(contactMap)
        .concat(
          accounts
            .filter((a) => !contactMap[normalizeAddress(a.address)])
            .map((a) => ({ address: a.address, name: a.name }))
        )
        .sort((a, b) => (a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1))
        .map((c) => ({
          display: `${trimToLength(c.name, 25)} - ${shortenAddress(c.address, true)}`,
          value: c.address,
        })),
    [contactMap, accounts]
  )
}
