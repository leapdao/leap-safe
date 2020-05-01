// @flow
import prodConfig from './production'
import { TX_SERVICE_HOST, RELAY_API_URL, BOUNTY_PAYOUT_ADDR, BOUNTY_TOKEN_ADDR } from '~/config/names'

const prodMainnetConfig = {
  ...prodConfig,
  [TX_SERVICE_HOST]: 'https://safe-transaction.mainnet.gnosis.io/api/v1/',
  [RELAY_API_URL]: 'https://safe-relay.gnosis.io/api/v1/',
  [BOUNTY_PAYOUT_ADDR]: '0x572d03FD45E85d5ca0BCd3679c99000D23A6b8f1',
  [BOUNTY_TOKEN_ADDR]: '0x6B175474E89094C44Da98b954EedeAC495271d0F' // DAI
}

export default prodMainnetConfig
