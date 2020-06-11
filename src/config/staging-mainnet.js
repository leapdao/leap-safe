// @flow
import stagingConfig from './staging'
import { TX_SERVICE_HOST, RELAY_API_URL, BOUNTY_PAYOUT_ADDR, BOUNTY_TOKEN_ADDR } from '~/config/names'

const stagingMainnetConfig = {
  ...stagingConfig,
  [TX_SERVICE_HOST]: 'https://safe-transaction.mainnet.staging.gnosisdev.com/api/v1/',
  [RELAY_API_URL]: 'https://safe-relay.mainnet.staging.gnosisdev.com/api/v1/',
  [BOUNTY_PAYOUT_ADDR]: '0x600932fC01B906967a98d4D13C779C64347755b5',
  [BOUNTY_TOKEN_ADDR]: '0x6B175474E89094C44Da98b954EedeAC495271d0F' // DAI
}

export default stagingMainnetConfig
