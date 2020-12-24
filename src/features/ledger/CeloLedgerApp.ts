import EthLedgerApp from '@ledgerhq/hw-app-eth'
import { decode, encode } from 'rlp'
import { config } from 'src/config'

// From https://github.com/LedgerHQ/ledgerjs/blob/master/packages/hw-app-eth/src/utils.js
function splitPath(path: string): number[] {
  if (!path) {
    throw new Error('No derivation path provided')
  }

  if (path.substr(0, 2) === 'm/') {
    path = path.substring(2)
  }

  const result: number[] = []
  const components = path.split('/')
  components.forEach((element) => {
    let number = parseInt(element, 10)
    if (isNaN(number)) {
      throw new Error('Invalid derivation path segment')
    }
    if (element.length > 1 && element[element.length - 1] === "'") {
      number += 0x80000000
    }
    result.push(number)
  })
  return result
}

// From https://github.com/LedgerHQ/ledgerjs/blob/master/packages/hw-app-eth/src/utils.js
function foreach<T, A>(arr: T[], callback: (arr: T, index: number) => Promise<A>): Promise<A[]> {
  function iterate(index: number, array: T[], result: any): Promise<A[]> {
    if (index >= array.length) {
      return result
    } else
      return callback(array[index], index).then(function (res) {
        result.push(res)
        return iterate(index + 1, array, result)
      })
  }
  return Promise.resolve().then(() => iterate(0, arr, []))
}

export class CeloLedgerApp extends EthLedgerApp {
  constructor(transport: any) {
    super(transport)
  }

  /**
   * Mostly copied from https://github.com/LedgerHQ/ledgerjs/blob/master/packages/hw-app-eth/src/Eth.js
   * Need to override for compatibility with Celo fields
   * Also adds EIP 155 support directly in
   */
  signTransaction(
    path: string,
    rawTxHex: string
  ): Promise<{
    s: string
    v: string
    r: string
  }> {
    const paths = splitPath(path)
    const rawTx = Buffer.from(rawTxHex, 'hex')
    const toSend = []
    let offset = 0
    let response: any

    const rlpTx = decode(rawTx)
    let rlpOffset = 0
    if (rlpTx.length > 6) {
      const rlpVrs = encode(rlpTx.slice(-3))
      rlpOffset = rawTx.length - (rlpVrs.length - 1)
    }

    while (offset !== rawTx.length) {
      const maxChunkSize = offset === 0 ? 150 - 1 - paths.length * 4 : 150
      let chunkSize = offset + maxChunkSize > rawTx.length ? rawTx.length - offset : maxChunkSize
      if (rlpOffset != 0 && offset + chunkSize == rlpOffset) {
        // Make sure that the chunk doesn't end right on the EIP 155 marker if set
        chunkSize--
      }
      const buffer = Buffer.alloc(offset === 0 ? 1 + paths.length * 4 + chunkSize : chunkSize)
      if (offset === 0) {
        buffer[0] = paths.length
        paths.forEach((element, index) => {
          buffer.writeUInt32BE(element, 1 + 4 * index)
        })
        rawTx.copy(buffer, 1 + 4 * paths.length, offset, offset + chunkSize)
      } else {
        rawTx.copy(buffer, 0, offset, offset + chunkSize)
      }
      toSend.push(buffer)
      offset += chunkSize
    }

    return foreach(toSend, (data, i) =>
      this.transport
        .send(0xe0, 0x04, i === 0 ? 0x00 : 0x80, 0x00, data)
        .then((apduResponse: any) => {
          response = apduResponse
        })
    ).then(
      () => {
        const v = response.slice(0, 1).toString('hex')
        const r = response.slice(1, 1 + 32).toString('hex')
        const s = response.slice(1 + 32, 1 + 32 + 32).toString('hex')

        // EIP155 support. check/recalc signature v value.
        const sigV = parseInt(v, 16)
        let eip155V = config.chainId * 2 + 35
        if (sigV !== eip155V && (sigV & eip155V) !== sigV) {
          eip155V += 1 // add signature v bit.
        }
        return { v: eip155V.toString(16), r, s }
      },
      (e) => {
        throw e
      }
    )
  }
}
