import bountyPayoutAbi from 'src/logic/bounty/bountyPayout.abi'
import { getWeb3 } from 'src/logic/wallets/getWeb3'

const web3 = getWeb3()

const funcSigs = ['payoutNoReviewer', 'payoutReviewedDelivery', 'payout'].reduce((acc, funcName) => {
  const funcAbi = bountyPayoutAbi.find((e) => e.name === funcName)
  const funcSig = web3.eth.abi.encodeFunctionSignature(funcAbi)
  acc[funcSig] = funcAbi
  return acc
}, {})

const decodeAddr = (param) => web3.utils.toChecksumAddress(param.substring(0, 42))

const decodePayoutAmount = (param) => {
  const val = web3.utils.toBN(param.substring(42), 16)
  const isRepOnly = val.toString().slice(-1) === '1'
  const unit = isRepOnly ? 'reputation points' : 'DAI'
  return {
    value: val,
    isRepOnly,
    unit,
  }
}

const decodeParams = (params) => {
  const funcSig = params.substring(0, 10)
  const rawParams = params.slice(10)
  const { inputs } = funcSigs[funcSig]
  const decodedParams = web3.eth.abi.decodeParameters(inputs, `0x${rawParams}`)

  const bountyData = {}
  bountyData.bountyLink = 'https://github.com/' + web3.utils.hexToAscii(decodedParams._bountyId)
  const { toBN } = web3.utils
  let value = toBN(0)
  if (decodedParams._gardener) {
    bountyData.gardener = {
      addr: decodeAddr(decodedParams._gardener),
      amount: decodePayoutAmount(decodedParams._gardener),
    }
    if (!bountyData.gardener.amount.isRepOnly) {
      value = value.add(toBN(bountyData.gardener.amount.value))
    }
  }
  if (decodedParams._worker) {
    bountyData.worker = {
      addr: decodeAddr(decodedParams._worker),
      amount: decodePayoutAmount(decodedParams._worker),
    }
    if (!bountyData.worker.amount.isRepOnly) {
      value = value.add(toBN(bountyData.worker.amount.value))
    }
  }
  if (decodedParams._reviewer) {
    bountyData.reviewer = {
      addr: decodeAddr(decodedParams._reviewer),
      amount: decodePayoutAmount(decodedParams._reviewer),
    }
    if (!bountyData.reviewer.amount.isRepOnly) {
      value = value.add(toBN(bountyData.reviewer.amount.value))
    }
  }

  bountyData.value = value.toString()
  return bountyData
}

const formatValue = (value) => value.div(web3.utils.toBN(String(10 ** 16))).toNumber() / 100

export default {
  decodeParams,
  formatValue,
}
