/* eslint-disable no-undef */
import 'src/polyfills/buffer'
import { GetAndVerify } from 'eth-proof'
import { logger } from 'src/utils/logger'
import { getProvider } from 'src/blockchain/provider'
import RLP from 'rlp'

// const { decode, KECCAK256_RLP_ARRAY, KECCAK256_NULL } = require('eth-util-lite')
// const EthObject = require('../node_modules/eth-object/src/ethObject.js')

import { mappingAt } from 'eth-util-lite'

const MAX_TRANSITIONS = 143
const EPOCH_DURATION = 17280
const MIN_CIP22_EPOCH = 393
const SERVER_URL = 'https://plumo-prover.kobi.one'
const RPC_URL = 'https://plumo-prover-rpc.kobi.one'
const VK =
  'b4ce8d33facb4588b0e2e7fafaeac69f236e50a44c09d6b5adf42529c4c6a1947cbf57ae89453140b91a5b225d789873e90866ac16eb650dbaeb52751dbab90e894acd2a8e150e7ce5303cda33effaa8c4021558650eda5b6b2670065c99f080a9a19792e79e3948f4f8ea22f9b50de209ff989442d807c9acd4a221d8be99e4a811d456fdc36916b062611968cc9dd6ca2db50296206c16a9cf9bfa436fb2a9e9099246136a249aef17029e626762bac9376f90d20592ae482ace7819610c001c5f02cd94c130a85b99bfe14fcf1064b054adc2fb6ee900d708d23ccb4869cebab6e100a3173396c7e770ace9cabbc558eb9ff0f1c34e7368a23dab5d1cb4266d0f89131020064c5f11a7c5aa5310d6f960d6692ea852c816b8d9413213100140ed4458bb48e2a165e9e136ee3221538b8f12a6a6632d8ba45c68d96f87e044425e3aa4d6a3f5f4f9fe8c7fd75926cdd710875f475d5af28cf4e5f0a356b4528448d004fc4cd6f8ec93399ee2a26dea6d24fc8ef2eefec83426c1e8c67dc38003000000000000007153b507f7b885d74fa3398dc022e615b92d3783deed85e995ac7305250761a65fa3373c5286b00b335ac7a6cc474b6f1d135114c93660f40a76872f4191760c2ed3a13336887564c738f2476d3cd3329a3e3901df5169f5d4e731ea830307808a5e2fce811973ac499dfa830b36c59e51537926c52309d4217b5c047e9ab312b97e7e8536e42de18849c425b51341865844bfb13d5edf97c3df9b9bc1f29fd40a2123f280dc92544c4aa61a03df306cb8da9a268b67751cc900dd120f2c9c80cf950eb9481886709b275fc1f503d49762048f6000583757d57aeabb4d1d1dd7d46978b97cb676324913864644828f80ee3eb56cff68c87ba62d9223bbf617c0d7389982c0bab0cad0020642050b89f35998736c90e8ce2c6be2b458b63b7b80'

const PROOF_CACHE = {}

function convert(Uint8Arr) {
  var length = Uint8Arr.length

  let buffer = Buffer.from(Uint8Arr)
  var result = buffer.readUIntBE(0, length)

  return result
}
function convertResponseToProof(resp) {
  return {
    proofs: [resp.response.proof],
    epochs: [resp.response.first_epoch, resp.response.last_epoch],
    vk: VK,
  }
}


async function fetchAndVerify(plumo, startEpoch, endEpoch) {
    return (fetch(`${SERVER_URL}/proof_get`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          start_epoch: startEpoch,
          end_epoch: endEpoch,
        }),
      })
    )
    .then((resp) => resp.json())
    .then((resp) => {
      logger.info(
        `Verifying Plumo proof for epochs ${resp.response.first_epoch_index} to ${
          resp.response.last_epoch_index
        } (up until block ${resp.response.last_epoch_index * 17280})...`
      )
      const validatorSet = plumo.plumo_verify(convertResponseToProof(resp));
      PROOF_CACHE[startEpoch] = {};
      PROOF_CACHE[startEpoch][endEpoch] = { verified: true };

      return validatorSet;
    });
}

// TODO use address instead of hardcoded account
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function fetchCeloBalanceVerified(address, tokenAddress) {
  logger.info('Attempting to fetch verified CELO balance')
  try {
    const plumo = await import('./plumo/index')

    const provider = getProvider()
    const block = await provider.getBlock('latest')
    if (!block) throw new Error('Failed to retrieve latest block')
    logger.debug(JSON.stringify(block))
    const blockNumber = block.number
    logger.debug(`Got block ${blockNumber}...`)

    const currentEpoch = Math.floor(blockNumber / EPOCH_DURATION)
    const numProofs = Math.ceil((currentEpoch - MIN_CIP22_EPOCH) / MAX_TRANSITIONS)

    for (let i = 0; i < numProofs - 1; i++) {
      const startEpoch = MIN_CIP22_EPOCH + MAX_TRANSITIONS * i;
      const endEpoch = MIN_CIP22_EPOCH + MAX_TRANSITIONS * (i + 1);
      if (PROOF_CACHE[startEpoch] && PROOF_CACHE[startEpoch][endEpoch] && PROOF_CACHE[startEpoch][endEpoch]['verified']) {
        continue;
      } else if (PROOF_CACHE[startEpoch] && PROOF_CACHE[startEpoch][endEpoch] && PROOF_CACHE[startEpoch][endEpoch]['pending']) {
        await PROOF_CACHE[startEpoch][endEpoch]['pending'];
        continue;
      }
      const future = fetchAndVerify(plumo, startEpoch, endEpoch)
      PROOF_CACHE[startEpoch] = {};
      PROOF_CACHE[startEpoch][endEpoch] = { pending: future };
      await future;
    }

    const lastEpoch = MIN_CIP22_EPOCH + MAX_TRANSITIONS * (numProofs - 1);
    let validatorSet;
    if (PROOF_CACHE[lastEpoch] && PROOF_CACHE[lastEpoch][currentEpoch] && PROOF_CACHE[lastEpoch][currentEpoch]['validatorSet']) {
      validatorSet = PROOF_CACHE[lastEpoch][currentEpoch]['validatorSet'];
    } else if (PROOF_CACHE[lastEpoch] && PROOF_CACHE[lastEpoch][currentEpoch] && PROOF_CACHE[lastEpoch][currentEpoch]['pending']) {
      validatorSet = await PROOF_CACHE[lastEpoch][currentEpoch]['pending'];
    } else {
      const plumoProofFuture = fetchAndVerify(plumo, lastEpoch, currentEpoch)
      PROOF_CACHE[lastEpoch] = {};
      PROOF_CACHE[lastEpoch][currentEpoch] = { pending: plumoProofFuture };
      validatorSet = await plumoProofFuture;
      PROOF_CACHE[lastEpoch] = {}
      PROOF_CACHE[lastEpoch][currentEpoch] = { verified: true, validatorSet }
    }
    logger.debug('validator set', validatorSet)

    const decoded = RLP.decode('0x' + block.extraData.slice(66))
    const [bitmap, aggregatedSeal, round] = decoded[4]
    const toHexString = (bytes) =>
      bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '')

    logger.debug(toHexString(bitmap), toHexString(aggregatedSeal), toHexString(round))

    const message = block.hash.slice(2) + toHexString(round) + '02'
    logger.debug('message: ' + message)
    logger.info(
      `Verifying signature on block ${blockNumber} using the validator set from the Plumo proof...`
    )
    plumo.block_verify({
      bitmap: toHexString(bitmap),
      seal: toHexString(aggregatedSeal),
      validators: validatorSet.last,
      message,
    })
    logger.info(`Getting account merkle proofs for account ${address}...`)
    const getAndVerify = new GetAndVerify(RPC_URL)
    const blockHashThatITrust = block.hash
    const untrustedAccount = address

    if (!tokenAddress) {
      let resp = await getAndVerify.accountAgainstBlockHash(untrustedAccount, blockHashThatITrust)
      const balance = convert(resp.balance)
      logger.info(`Done! Balance is ${balance}`)
      return balance
    } else {
      let position = mappingAt('0x5', address);
      let tokenResp = await getAndVerify.storageAgainstBlockHash(tokenAddress, position, blockHashThatITrust)
      let balance = convert(tokenResp)
      if (!balance) {
        balance = 0;
      }
      logger.info(`Done! Balance is ${balance}`)
      return balance
    }
  } catch (error) {
    logger.error('Error fetching verified CELO balance', error)
    throw new Error('Plumo failure')
  }
}
