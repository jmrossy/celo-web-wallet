import { formatIpfsUrl } from 'src/features/nft/utils'

describe('Formats IPFS Urls', () => {
  it('Formats valid urls', () => {
    const url1 = formatIpfsUrl(
      'https://ipfs.io/ipfs/QmSt48MQaRL5Qr6CjwAnXHJ3cDtA9EodMs9F7ooKziytva/1969.json'
    )
    expect(url1).toEqual(
      'https://cloudflare-ipfs.com/ipfs/QmSt48MQaRL5Qr6CjwAnXHJ3cDtA9EodMs9F7ooKziytva/1969.json'
    )
    const url2 = formatIpfsUrl(
      'https://womxnofcelo.mypinata.cloud/ipfs/QmWQrQrDpTyLWk76qZwNYf4NQSSmKsCRSeVKuH4oAMJa25/710.json'
    )
    expect(url2).toEqual(
      'https://cloudflare-ipfs.com/ipfs/QmWQrQrDpTyLWk76qZwNYf4NQSSmKsCRSeVKuH4oAMJa25/710.json'
    )
    const url3 = formatIpfsUrl(
      'https://cloudflare-ipfs.com/ipfs/QmWQrQrDpTyLWk76qZwNYf4NQSSmKsCRSeVKuH4oAMJa25/710.json'
    )
    expect(url3).toEqual(
      'https://cloudflare-ipfs.com/ipfs/QmWQrQrDpTyLWk76qZwNYf4NQSSmKsCRSeVKuH4oAMJa25/710.json'
    )
  })

  it('Ignores invalid urls', () => {
    expect(formatIpfsUrl('')).toBeNull()
    expect(
      formatIpfsUrl(
        'https://cloudflare-ipfs.com/ipfs/QmTAxUKr89RFcTUqFirXADNtrkVmQWTuHgPQAbkmCubw5t/710.png'
      )
    ).toBeNull()
    expect(
      formatIpfsUrl(
        'https://cloudflare-ipfs.com/ipfs/Qmf4SjPj66qMwWsN34e35tjya6BA5a7abA8B2ct9DaizSC/'
      )
    ).toBeNull()
    expect(formatIpfsUrl('Foobar')).toBeNull()
  })
})
