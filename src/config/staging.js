// @flow
import { TX_SERVICE_HOST, SIGNATURES_VIA_METAMASK, RELAY_API_URL, BOUNTY_PAYOUT_ADDR, BOUNTY_TOKEN_ADDR } from '~/config/names'

const stagingConfig = {
  [TX_SERVICE_HOST]: 'https://safe-transaction.staging.gnosisdev.com/api/v1/',
  [SIGNATURES_VIA_METAMASK]: false,
  [RELAY_API_URL]: 'https://safe-relay.staging.gnosisdev.com/api/v1/',
  [BOUNTY_PAYOUT_ADDR]: '0x8F36E3d1235d3CA958Dce31af1afE75E451dFcD2',
  [BOUNTY_TOKEN_ADDR]: '0xD2D0F8a6ADfF16C2098101087f9548465EC96C98' // tLEAP
}

export default stagingConfig
