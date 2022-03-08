import { providers } from 'ethers'
import { useEffect, useState } from 'react'
import { getProvider } from 'src/blockchain/provider'
import { config } from 'src/config'
import { ALCHEMY_UNSTOPPABLE_BASEURL } from 'src/consts'
import { isValidAddress } from 'src/utils/addresses'
import { useDebounce } from 'src/utils/debounce'
import { logger } from 'src/utils/logger'
import { fetchWithTimeout } from 'src/utils/timeout'

export enum DomainNameType {
  ENS = 'ens',
  NOMSPACE = 'nomspace',
  UNSTOPPABLE = 'unstoppable',
}

const ENS_REGEX = /^([a-zA-Z0-9]+(-[a-zA-Z0-9]+)*\.)+eth$/
const NOMSPACE_REGEX = /^([a-zA-Z0-9]+(-[a-zA-Z0-9]+)*\.)+nom$/
const UNSTOPPABLE_REGEX =
  /^([a-zA-Z0-9-]+\.)+(zil|crypto|nft|blockchain|bitcoin|coin|wallet|888|dao|x)$/

const resolutionCache: Record<DomainNameType, Record<string, Address | null>> = {
  [DomainNameType.ENS]: {},
  [DomainNameType.NOMSPACE]: {},
  [DomainNameType.UNSTOPPABLE]: {},
}

export function findDomainNameType(value: string) {
  if (!value || value.length < 3) return null
  if (NOMSPACE_REGEX.test(value)) return DomainNameType.NOMSPACE
  if (ENS_REGEX.test(value)) return DomainNameType.ENS
  if (UNSTOPPABLE_REGEX.test(value)) return DomainNameType.UNSTOPPABLE
  return null
}

export function useDomainResolver(value: string) {
  const { debouncedValue, isDebouncing } = useDebounce(value)
  const [resolvedAddress, setResolvedAddress] = useState<string | null>(null)
  const [isResolving, setIsResolving] = useState<boolean>(false)
  const [isError, setIsError] = useState<boolean>(false)

  useEffect(() => {
    if (isDebouncing) return

    const domainType = findDomainNameType(debouncedValue)
    if (!domainType) {
      setResolvedAddress(null)
      setIsResolving(false)
      setIsError(false)
      return
    }

    // Note, null means resolved to nothing but lookup was successful
    if (resolutionCache[domainType][debouncedValue] !== undefined) {
      setResolvedAddress(resolutionCache[domainType][debouncedValue])
      setIsResolving(false)
      setIsError(false)
      return
    }

    setResolvedAddress(null)
    setIsResolving(true)
    setIsError(false)

    resolveDomainName(debouncedValue, domainType)
      .then((address: Address | null) => {
        resolutionCache[domainType][debouncedValue] = address
        setResolvedAddress(address)
        setIsResolving(false)
        setIsError(false)
      })
      .catch(() => {
        setResolvedAddress(null)
        setIsResolving(false)
        setIsError(true)
      })
  }, [debouncedValue, isDebouncing])

  return {
    result: resolvedAddress,
    loading: isDebouncing || isResolving,
    error: isError,
  }
}

async function resolveDomainName(value: string, type: DomainNameType): Promise<Address | null> {
  try {
    let address: Address | null = null
    if (type === DomainNameType.ENS) {
      address = await resolveEnsName(value)
    } else if (type === DomainNameType.NOMSPACE) {
      address = await resolveNomspaceName(value)
    } else if (type === DomainNameType.UNSTOPPABLE) {
      address = await resolveUnstoppableName(value)
    } else {
      throw new Error(`Unsupported domain name type ${type}`)
    }
    return address
  } catch (error) {
    logger.error('Error resolving domain name', error, value, type)
    throw new Error('Error resolving domain name')
  }
}

async function resolveEnsName(value: string) {
  logger.debug('Attempting to resolve ens domain', value)
  const apiKey = config.alchemyApiKey
  if (!apiKey) throw new Error('Alchemy API key is missing')
  // Homestead is what Ethers calls Eth Mainnet
  const ethProvider = new providers.AlchemyProvider('homestead', apiKey)
  const resolver = await ethProvider.getResolver(value)
  if (!resolver) return null
  const coinType = config.ensCoinTypeValue
  if (!coinType) return null
  // TODO this throws error due to unknown coin type
  const address = await resolver.getAddress(coinType)
  if (address && isValidAddress(address)) return address
  else return null
}

async function resolveNomspaceName(value: string) {
  logger.debug('Attempting to resolve nomspace domain', value)
  const provider = getProvider()
  const address = await provider.resolveName(value)
  if (address && isValidAddress(address)) return address
  else return null
}

interface UnstoppableResponse {
  records: Record<string, Address>
  meta: Record<string, string>
}

async function resolveUnstoppableName(value: string) {
  logger.debug('Attempting to resolve unstoppable domain', value)
  const url = `${ALCHEMY_UNSTOPPABLE_BASEURL}${value}`
  const apiKey = config.alchemyApiKey
  if (!apiKey) throw new Error('Alchemy API key is missing')
  const response = await fetchWithTimeout(
    url,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    },
    2000
  )
  if (!response.ok) {
    throw new Error(`Fetch response not okay: ${response.status}`)
  }

  const json = (await response.json()) as UnstoppableResponse
  if (!json.records) {
    const responseText = await response.text()
    throw new Error(`Invalid result format: ${responseText}`)
  }

  const address = json.records['crypto.CELO.address']
  if (isValidAddress(address)) return address
  else return null
}
