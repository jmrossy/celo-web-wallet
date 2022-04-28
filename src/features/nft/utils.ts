import { IPFS_PROVIDER_BASEURL } from 'src/consts'
import { logger } from 'src/utils/logger'

// E.g Matches https://ipfs.io/ipfs/foobar/1969.json
// And returns foobar/1969.json in capture group 1
const IPFS_REGEX = /\/ipfs\/([a-zA-Z0-9]+\/[a-zA-Z0-9]+\.json)/

// Parse an IPFS link to extract the relevant parts and
// append them to the IPFS_PROVIDER_BASEURL
export function formatIpfsUrl(url: string) {
  try {
    if (!url) return null
    const parsed = new URL(url)
    const path = parsed.pathname
    const matches = path.match(IPFS_REGEX)
    if (!matches || matches.length < 2) return null
    else return IPFS_PROVIDER_BASEURL + matches[1]
  } catch (error) {
    logger.warn('Unable to format ipfs url', error, url)
    return null
  }
}

// const IMAGE_EXT_RE = /\.(?:png|svg|jpg|jepg|gif|webp|jxl|avif)$/
// const VIDEO_EXT_RE = /\.(?:mp4|mov|webm|ogv)$/

// // Guess a file type from the extension used in a URL
// export function urlExtensionType(url: string): NftMetadata["imageType"] {
//   if (IMAGE_EXT_RE.test(url)) return "image"
//   if (VIDEO_EXT_RE.test(url)) return "video"
//   return "unknown"
// }
