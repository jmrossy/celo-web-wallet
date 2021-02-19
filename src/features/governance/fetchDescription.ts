import { logger } from 'src/utils/logger'

// Putting these in a seperate file to faciliate testing for now
export async function fetchProposalDescription(url: string) {
  try {
    if (!url) throw new Error('No url provided')
    const parsed = new URL(url)
    if (parsed.protocol !== 'https:') throw new Error('Invalid url protocol')

    if (parsed.hostname === 'github.com') {
      return fetchProposalDescriptionFromGithub(parsed)
    } else {
      throw new Error('Only github based urls currently supported')
    }
  } catch (error) {
    logger.error('Failed to retrieve proposal description', error)
    return null
  }
}

async function fetchProposalDescriptionFromGithub(url: URL) {
  // TODO hardcoding things here for now but may need more flexible retrieval logic eventually
  const urlPath = url.pathname
  const pathRegex = /\/celo-org\/celo-proposals\/blob\/master\/CGPs\/(.*)/
  const pathMatches = urlPath.match(pathRegex)
  if (pathMatches?.length !== 2) throw new Error('Unable to extract proposal number')

  const proposalRawUrl = `https://api.github.com/repos/celo-org/celo-proposals/contents/CGPs/${pathMatches[1]}`
  const response = await fetch(proposalRawUrl, {
    headers: {
      Accept: 'application/vnd.github.3.raw',
    },
  })
  if (!response.ok) {
    throw new Error(`Fetch response not okay: ${response.status}`)
  }

  // TODO find a way to read just the first line if possible, don't actually need the whole file
  const text = await response.text()
  const descriptionRegex = /(.*): (.*)/
  const desciptionMatches = text.match(descriptionRegex)
  if (desciptionMatches?.length !== 3) throw new Error('Unable to extract proposal description')
  return desciptionMatches[2].trim().replace(/(`|#)/gi, '')
}
