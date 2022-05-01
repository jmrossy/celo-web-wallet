import { IPFS_PROVIDER_BASEURL } from 'src/consts'
import { logger } from 'src/utils/logger'

// E.g Matches https://ipfs.io/ipfs/foobar/1969.json
// And returns foobar/1969.json in capture group 1
const IPFS_URL_REGEX =
  /\/ipfs\/([a-zA-Z0-9]+\/[a-zA-Z0-9]+\.(json|png|svg|jpg|jepg|gif|webp|avif))$/

// E.g Matches ipfs://foobar/4242.png
// And returns foobar/4242.png in capture group 1
const IPFS_PROTOCOL_RE =
  /^ipfs:\/\/(?:ipfs\/)?([a-zA-Z0-9]+\/[a-zA-Z0-9]+\.(json|png|svg|jpg|jepg|gif|webp|avif))$/

// Parse an IPFS link to extract the relevant parts and
// append them to the IPFS_PROVIDER_BASEURL
export function formatIpfsUrl(url: string) {
  try {
    if (!url) {
      logger.debug('Empty url given to formatIpfsUrl')
      return null
    }
    const parsed = new URL(url)
    const path = parsed.pathname

    // Try url regex first
    let matches = path.match(IPFS_URL_REGEX)
    if (matches && matches?.length >= 2) {
      return IPFS_PROVIDER_BASEURL + matches[1]
    }

    // Otherwise try protocol regex
    matches = url.match(IPFS_PROTOCOL_RE)
    if (matches && matches?.length >= 2) {
      return IPFS_PROVIDER_BASEURL + matches[1]
    }

    logger.debug('Cannot format invalid ipfs url', url)
    return null
  } catch (error) {
    logger.warn('Unable to format ipfs url', error, url)
    return null
  }
}

const JSON_EXT_REGEX = /\.(?:json)$/
const IMAGE_EXT_REGEX = /\.(?:png|svg|jpg|jepg|gif|webp|avif)$/
const VIDEO_EXT_REGEX = /\.(?:mp4|mov|webm|ogv)$/

export enum UrlExtensionType {
  unknown = 'unknown',
  json = 'json',
  image = 'image',
  video = 'video',
}

// Guess a file type from the extension used in a URL
export function getUrlExtensionType(url: string): UrlExtensionType {
  if (JSON_EXT_REGEX.test(url)) return UrlExtensionType.json
  if (IMAGE_EXT_REGEX.test(url)) return UrlExtensionType.image
  if (VIDEO_EXT_REGEX.test(url)) return UrlExtensionType.video
  return UrlExtensionType.unknown
}
