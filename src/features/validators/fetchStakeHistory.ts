import { BigNumber, Contract } from 'ethers'
import { appSelect } from 'src/app/appSelect'
import { getContract } from 'src/blockchain/contracts'
import { CeloContract, config } from 'src/config'
import { STAKE_EVENTS_STALE_TIME } from 'src/consts'
import { StakeEvent, StakeEventType } from 'src/features/validators/types'
import { addStakeEvents } from 'src/features/validators/validatorsSlice'
import { selectVoterAccountAddress } from 'src/features/wallet/hooks'
import {
  areAddressesEqual,
  ensureLeading0x,
  isValidAddress,
  trimLeading0x,
} from 'src/utils/addresses'
import {
  BlockscoutTransactionLog,
  queryBlockscout,
  validateBlockscoutLog,
} from 'src/utils/blockscout'
import { logger } from 'src/utils/logger'
import { createMonitoredSaga } from 'src/utils/saga'
import { isStale } from 'src/utils/time'
import { call, put } from 'typed-redux-saga'

//ValidatorGroupVoteActivated(address,address,uint256,uint256)
const VOTE_ACTIVATED_TOPIC_0 = '0x45aac85f38083b18efe2d441a65b9c1ae177c78307cb5a5d4aec8f7dbcaeabfe'
//ValidatorGroupActiveVoteRevoked(address,address,uint256,uint256)
const VOTE_REVOKED_TOPIC_0 = '0xae7458f8697a680da6be36406ea0b8f40164915ac9cc40c0dad05a2ff6e8c6a8'

function* fetchStakeHistory() {
  const { lastUpdatedTime, lastBlockNumber } = yield* appSelect(
    (state) => state.validators.stakeEvents
  )
  const voterAccountAddress = yield* call(selectVoterAccountAddress)

  if (!isStale(lastUpdatedTime, STAKE_EVENTS_STALE_TIME)) return

  const { newEvents, newBlockNumber } = yield* call(
    fetchStakeEvents,
    voterAccountAddress,
    lastBlockNumber
  )

  yield* put(
    addStakeEvents({
      events: newEvents,
      lastUpdatedTime: Date.now(),
      lastBlockNumber: newBlockNumber,
    })
  )
}

export const {
  name: fetchStakeHistorySagaName,
  wrappedSaga: fetchStakeHistorySaga,
  reducer: fetchStakeHistoryReducer,
  actions: fetchStakeHistoryActions,
} = createMonitoredSaga(fetchStakeHistory, 'fetchStakeHistory')

async function fetchStakeEvents(accountAddress: Address, lastBlockNumber: number | null) {
  const electionContract = getContract(CeloContract.Election)
  const electionAddress = electionContract.address
  const fromBlock = lastBlockNumber ? lastBlockNumber + 1 : 5 // Not using block 0 here because of Blockscout bug with incorrect txs in low blocks
  const topic1 = getPaddedAddress(accountAddress).toLowerCase()
  const baseUrl = `${config.blockscoutUrl}/api?module=logs&action=getLogs&fromBlock=${fromBlock}&toBlock=latest&address=${electionAddress}&topic1=${topic1}&topic0_1_opr=and`
  const activateLogsUrl = `${baseUrl}&topic0=${VOTE_ACTIVATED_TOPIC_0}`
  const revokeLogsUrl = `${baseUrl}&topic0=${VOTE_REVOKED_TOPIC_0}`
  const activeTxLogs = await queryBlockscout<Array<BlockscoutTransactionLog>>(activateLogsUrl)
  const revokeTxLogs = await queryBlockscout<Array<BlockscoutTransactionLog>>(revokeLogsUrl)
  const activateEvents = parseBlockscoutStakeLogs(
    activeTxLogs,
    electionContract,
    accountAddress,
    fromBlock,
    StakeEventType.Activate
  )
  const revokeEvents = parseBlockscoutStakeLogs(
    revokeTxLogs,
    electionContract,
    accountAddress,
    fromBlock,
    StakeEventType.Revoke
  )
  const newEvents = activateEvents.concat(revokeEvents).sort((a, b) => a.timestamp - b.timestamp)
  let maxNewBlockNumber = fromBlock
  newEvents.forEach((e) => (maxNewBlockNumber = Math.max(maxNewBlockNumber, e.blockNumber)))
  return { newEvents, newBlockNumber: maxNewBlockNumber }
}

function parseBlockscoutStakeLogs(
  logs: Array<BlockscoutTransactionLog>,
  electionContract: Contract,
  accountAddress: Address,
  minBlock: number,
  type: StakeEventType
): StakeEvent[] {
  const logDescriptionName =
    type === StakeEventType.Activate
      ? 'ValidatorGroupVoteActivated'
      : 'ValidatorGroupActiveVoteRevoked'
  const topic0 = type === StakeEventType.Activate ? VOTE_ACTIVATED_TOPIC_0 : VOTE_REVOKED_TOPIC_0
  const stakeEvents: StakeEvent[] = []

  for (const log of logs) {
    try {
      validateBlockscoutLog(log, topic0, minBlock)

      const filteredTopics = log.topics.filter((t) => !!t)
      const logDescription = electionContract.interface.parseLog({
        topics: filteredTopics,
        data: log.data,
      })

      if (logDescription.name !== logDescriptionName) {
        throw new Error(`Unexpected log name: ${logDescription.name}`)
      }

      const { account, group, value, units } = logDescription.args

      if (!areAddressesEqual(account, accountAddress)) {
        throw new Error(`Unexpected account address: ${account}`)
      }
      if (!isValidAddress(group)) {
        throw new Error(`Invalid group address: ${group}`)
      }

      const valueParsed = BigNumber.from(value)
      if (valueParsed.lte(0)) {
        throw new Error(`Invalid value: ${value}`)
      }

      const unitsParsed = BigNumber.from(units)
      if (unitsParsed.lte(0)) {
        throw new Error(`Invalid units: ${units}`)
      }

      const timestamp = BigNumber.from(ensureLeading0x(log.timeStamp)).mul(1000)
      if (timestamp.lte(0) || timestamp.gt(Date.now() + 600000)) {
        throw new Error(`Invalid timestamp: ${log.timeStamp}`)
      }

      const blockNumber = BigNumber.from(ensureLeading0x(log.blockNumber))
      if (blockNumber.lt(0)) {
        throw new Error(`Invalid block number: ${log.blockNumber}`)
      }

      stakeEvents.push({
        type,
        group,
        value: valueParsed.toString(),
        units: unitsParsed.toString(),
        blockNumber: blockNumber.toNumber(),
        timestamp: timestamp.toNumber(),
        txHash: log.transactionHash,
      })
    } catch (error) {
      logger.warn('Unable to parse stake log, will skip', error)
    }
  }
  return stakeEvents
}

function getPaddedAddress(address: Address) {
  return ensureLeading0x(trimLeading0x(address).padStart(64, '0'))
}
