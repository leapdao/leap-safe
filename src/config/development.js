// @flow
import { TX_SERVICE_HOST, SIGNATURES_VIA_METAMASK, RELAY_API_URL, BOUNTY_PAYOUT_ADDR } from '~/config/names'

const devConfig = {
  [TX_SERVICE_HOST]: 'https://safe-transaction.staging.gnosisdev.com/api/v1/',
  [SIGNATURES_VIA_METAMASK]: false,
  [RELAY_API_URL]: 'https://safe-relay.staging.gnosisdev.com/api/v1/',
  [BOUNTY_PAYOUT_ADDR]: '0x572d03fd45e85d5ca0bcd3679c99000d23a6b8f1',
}

export default devConfig
