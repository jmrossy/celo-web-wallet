import { CeloProvider } from '@celo-tools/celo-ethers-wrapper'
import { Contract, PopulatedTransaction, utils } from 'ethers'
import { FunctionFragment } from 'ethers/lib/utils'
import { getProvider } from 'src/blockchain/provider'
import { logger } from 'src/utils/logger'
import { chunk } from 'src/utils/string'

interface JsonRpcRequest {
  jsonrpc: string
  id: number
  method: string
  params: any
}

interface JsonRpcResult {
  jsonrpc: string
  id: number
  result?: string
  error?: { code?: number; data?: any; message?: string }
}

// Ethers.js doesn't natively support JSON RPC batch call
// This uses Ethers utilities to manually form a request array, send it, and parse the result
// Callers must still create tx requests and decode results using the contract interface
// Based on https://github.com/ethers-io/ethers.js/blob/master/packages/providers/src.ts/json-rpc-provider.ts
export async function batchCall(
  callArgsList: Array<any>,
  contract: Contract,
  functionName: string,
  maxChunkSize: number
) {
  const functionFragment = contract.interface.getFunction(functionName)
  const contractFunction = contract.populateTransaction[functionName]

  let results: any = []
  const chunks = chunk(callArgsList, maxChunkSize)
  for (const chunk of chunks) {
    const txRequestPromises = chunk.map((args) => contractFunction(args))
    const txRequests = await Promise.all(txRequestPromises)
    const encodedResults = await executeBatchCall(txRequests)
    const decodedResults = decodeResults(encodedResults, contract, functionFragment)
    results = results.concat(decodedResults)
  }

  return results
}

async function executeBatchCall(txRequests: PopulatedTransaction[]) {
  const provider = getProvider()
  try {
    const requests: JsonRpcRequest[] = txRequests.map((tx) => {
      const hexlified = CeloProvider.hexlifyTransaction(tx, { from: true })
      return {
        method: 'eth_call',
        params: [hexlified, 'latest'],
        id: provider._nextId++,
        jsonrpc: '2.0',
      }
    })

    const result: string[] = await utils.fetchJson(
      provider.connection,
      JSON.stringify(requests),
      getPayloadResult
    )

    if (!result || result.length !== txRequests.length) {
      throw new Error('Result size / request size mismatch')
    }

    const hexlifiedResults = result.map((r) => utils.hexlify(r))
    return hexlifiedResults
  } catch (error) {
    logger.error('Failed to perform batch call', error)
    throw new Error('Batch call failed')
  }
}

function getPayloadResult(payload: JsonRpcResult[]) {
  if (!payload || !payload.length) {
    throw new Error('Empty JSON RPC payload')
  }

  return payload.map((p) => {
    if (p.error) {
      const error: any = new Error(p.error.message)
      error.code = p.error.code
      error.data = p.error.data
      throw error
    }
    if (p.result) {
      return p.result
    }
    throw new Error('No error and no result in JSON RPC payload')
  })
}

function decodeResults(encodedResults: string[], contract: Contract, fragment: FunctionFragment) {
  const decodedResults = []
  for (const enc of encodedResults) {
    const decoded = contract.interface.decodeFunctionResult(fragment, enc)
    if (Array.isArray(decoded) && fragment.outputs?.length === 1 && decoded.length === 1) {
      decodedResults.push(decoded[0])
    } else {
      decodedResults.push(decoded)
    }
  }
  return decodedResults
}
