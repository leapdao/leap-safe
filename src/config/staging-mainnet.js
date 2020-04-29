// @flow
import stagingConfig from './staging'
import { TX_SERVICE_HOST, RELAY_API_URL, BOUNTY_PAYOUT_ADDR, BOUNTY_TOKEN_ADDR } from '~/config/names'

const stagingMainnetConfig = {
  ...stagingConfig,
  [TX_SERVICE_HOST]: 'https://safe-transaction.mainnet.staging.gnosisdev.com/api/v1/',
  [RELAY_API_URL]: 'https://safe-relay.mainnet.staging.gnosisdev.com/api/v1/',
  [BOUNTY_PAYOUT_ADDR]: '0x572d03fd45e85d5ca0bcd3679c99000d23a6b8f1',
  [BOUNTY_TOKEN_ADDR]: '0x6b175474e89094c44da98b954eedeac495271d0f' // DAI
}

export default stagingMainnetConfig
