import { GOVERNANCE_GITHUB_BASEURL } from 'src/consts'
import { Proposal } from 'src/features/governance/types'
import { logger } from 'src/utils/logger'

// Putting these in a seperate file to faciliate testing for now
export async function fetchProposalDescription(proposal: Proposal) {
  try {
    if (!proposal || !proposal.url) throw new Error('No url provided')
    const parsed = new URL(proposal.url)
    if (parsed.protocol !== 'https:') throw new Error('Invalid url protocol')

    if (parsed.hostname === 'github.com') {
      const description = await fetchProposalDescriptionFromGithub(parsed)
      if (!description) throw new Error('No description found')
      return description
    } else {
      throw new Error('Only github based urls currently supported')
    }
  } catch (error) {
    logger.error('Failed to retrieve proposal description', error)
    return `Proposal #${proposal.id}`
  }
}

async function fetchProposalDescriptionFromGithub(url: URL) {
  // TODO hardcoding things here for now but may need more flexible retrieval logic eventually
  const urlPath = url.pathname
  const pathRegex = /CGPs\/(.*)/
  const pathMatches = urlPath.match(pathRegex)
  if (pathMatches?.length !== 2) throw new Error('Unable to extract proposal number')

  const proposalRawUrl = `${GOVERNANCE_GITHUB_BASEURL}${pathMatches[1]}`
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
  const lines = text.split(/\r?\n/)
  if (lines[0] === '---') {
    return parseNewProposalFormat(lines)
  } else {
    return parseOldProposalFormat(lines[0])
  }
}

function parseOldProposalFormat(line: string) {
  const descriptionRegex = /(.*): (.*)/
  const desciptionMatches = line.match(descriptionRegex)
  if (desciptionMatches?.length !== 3) throw new Error('Unable to extract proposal description')
  return desciptionMatches[2].trim().replace(/(`|#)/gi, '')
}

function parseNewProposalFormat(lines: string[]) {
  for (let i = 0; i < 15; i++) {
    const line = lines[i]
    const descriptionRegex = /title: (.*)/
    const desciptionMatches = line.match(descriptionRegex)
    if (desciptionMatches?.length !== 2) continue
    return desciptionMatches[1].trim().replace(/(`|#)/gi, '')
  }
  throw new Error('Unable to extract proposal description')
}
