interface BlockscoutResponse<R> {
  status: string
  result: R
  message: string
}

export async function queryBlockscout<P>(url: string) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Fetch response not okay: ${response.status}`)
  }
  const json = (await response.json()) as BlockscoutResponse<P>

  if (!json.result) {
    const responseText = await response.text()
    throw new Error(`Invalid result format: ${responseText}`)
  }

  return json.result
}

export interface BlockscoutTransactionLog {
  transactionIndex: string
  transactionHash: string
  topics: Array<string>
  timeStamp: string
  logIndex: string
  gatewayFeeRecipient: string
  gatewayFee: string
  gasUsed: string
  gasPrice: string
  feeCurrency: string
  data: string
  blockNumber: string
  address: string
}

export function validateBlockscoutLog(log: BlockscoutTransactionLog, topic0?: string) {
  if (!log) throw new Error('Log is nullish')
  if (!log.transactionHash) throw new Error('Log has no tx hash')
  if (!log.topics || !log.topics.length) throw new Error('Log has no topics')
  if (!log.topics || !log.topics.length) throw new Error('Log has no topics')
  if (topic0 && log.topics[0]?.toLowerCase() !== topic0) throw new Error('Log topic is incorrect')
  if (!log.data) throw new Error('Log has no data to parse')
  if (!log.timeStamp) throw new Error('Log has no timestamp')
}
