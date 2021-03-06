import { TX_SERVICE_HOST, SIGNATURES_VIA_METAMASK, RELAY_API_URL, SAFE_APPS_URL, BOUNTY_PAYOUT_ADDR, BOUNTY_TOKEN_ADDR } from 'src/config/names'

const testConfig = {
  [TX_SERVICE_HOST]: 'http://localhost:8000/api/v1/',
  [SIGNATURES_VIA_METAMASK]: false,
  [RELAY_API_URL]: 'https://safe-relay.staging.gnosisdev.com/api/v1',
  [SAFE_APPS_URL]: 'http://localhost:3002/',  
  [BOUNTY_PAYOUT_ADDR]: '0x4C6E6726276a14C2C9997605648F7Ae591BCa500',
  [BOUNTY_TOKEN_ADDR]: '0xD2D0F8a6ADfF16C2098101087f9548465EC96C98' // tLEAP
}

export default testConfig
