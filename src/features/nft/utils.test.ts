import { formatIpfsUrl } from 'src/features/nft/utils'

describe('Formats IPFS Urls', () => {
  it('Formats valid https urls', () => {
    expect(
      formatIpfsUrl('https://ipfs.io/ipfs/QmSt48MQaRL5Qr6CjwAnXHJ3cDtA9EodMs9F7ooKziytva/1969.json')
    ).toEqual(
      'https://cloudflare-ipfs.com/ipfs/QmSt48MQaRL5Qr6CjwAnXHJ3cDtA9EodMs9F7ooKziytva/1969.json'
    )

    expect(
      formatIpfsUrl(
        'https://womxnofcelo.mypinata.cloud/ipfs/QmWQrQrDpTyLWk76qZwNYf4NQSSmKsCRSeVKuH4oAMJa25/710.json'
      )
    ).toEqual(
      'https://cloudflare-ipfs.com/ipfs/QmWQrQrDpTyLWk76qZwNYf4NQSSmKsCRSeVKuH4oAMJa25/710.json'
    )

    expect(
      formatIpfsUrl(
        'https://cloudflare-ipfs.com/ipfs/QmWQrQrDpTyLWk76qZwNYf4NQSSmKsCRSeVKuH4oAMJa25/710.json'
      )
    ).toEqual(
      'https://cloudflare-ipfs.com/ipfs/QmWQrQrDpTyLWk76qZwNYf4NQSSmKsCRSeVKuH4oAMJa25/710.json'
    )

    expect(formatIpfsUrl('https://womxnofcelo.mypinata.cloud/ipfs/ABC1230912390/123.png')).toEqual(
      'https://cloudflare-ipfs.com/ipfs/ABC1230912390/123.png'
    )

    expect(formatIpfsUrl('https://womxnofcelo.mypinata.cloud/ipfs/0/0.svg')).toEqual(
      'https://cloudflare-ipfs.com/ipfs/0/0.svg'
    )

    expect(
      formatIpfsUrl(
        'https://cloudflare-ipfs.com/ipfs/QmTAxUKr89RFcTUqFirXADNtrkVmQWTuHgPQAbkmCubw5t/askdfj9.png'
      )
    ).toEqual(
      'https://cloudflare-ipfs.com/ipfs/QmTAxUKr89RFcTUqFirXADNtrkVmQWTuHgPQAbkmCubw5t/askdfj9.png'
    )
  })

  it('Formats valid ipfs protocol urls', () => {
    expect(formatIpfsUrl('ipfs://foo/bar.json')).toEqual(
      'https://cloudflare-ipfs.com/ipfs/foo/bar.json'
    )
    expect(formatIpfsUrl('ipfs://Qme97ifAexrMDfjE3DZRMasWhe7D276uYsCGonyprSA2MJ/4242.png')).toEqual(
      'https://cloudflare-ipfs.com/ipfs/Qme97ifAexrMDfjE3DZRMasWhe7D276uYsCGonyprSA2MJ/4242.png'
    )
  })

  it('Ignores invalid urls', () => {
    expect(formatIpfsUrl('')).toBeNull()
    expect(
      formatIpfsUrl(
        'https://cloudflare-ipfs.com/ipfs/QmTAxUKr89RFcTUqFirXADNtrkVmQWTuHgPQAbkmCubw5t/710.mp4'
      )
    ).toBeNull()

    expect(
      formatIpfsUrl(
        'https://cloudflare-ipfs.com/ipfs/Qmf4SjPj66qMwWsN34e35tjya6BA5a7abA8B2ct9DaizSC/'
      )
    ).toBeNull()

    expect(formatIpfsUrl('ipfs://foo')).toBeNull()

    expect(formatIpfsUrl('Foobar')).toBeNull()
  })
})
