// @flow
import { withStyles } from '@material-ui/core/styles'
import React, { useState } from 'react'

import { getTxData } from './utils'

import CopyBtn from '~/components/CopyBtn'
import EtherscanBtn from '~/components/EtherscanBtn'
import EtherscanLink from '~/components/EtherscanLink'
import Block from '~/components/layout/Block'
import Bold from '~/components/layout/Bold'
import LinkWithRef from '~/components/layout/Link'
import Paragraph from '~/components/layout/Paragraph'
import { getBountyPayoutContractAddr } from '~/config/index'
import { getNameFromAddressBook } from '~/logic/addressBook/utils'
import bountyPayoutAbi from '~/logic/bounty/bountyPayout.abi.js'
import { SAFE_METHODS_NAMES } from '~/logic/contracts/methodIds'
import { shortVersionOf } from '~/logic/wallets/ethAddresses'
import { getWeb3 } from '~/logic/wallets/getWeb3'
import OwnerAddressTableCell from '~/routes/safe/components/Settings/ManageOwners/OwnerAddressTableCell'
import { getTxAmount } from '~/routes/safe/components/Transactions/TxsTable/columns'
import { type Transaction } from '~/routes/safe/store/models/transaction'
import { lg, md } from '~/theme/variables'

export const TRANSACTIONS_DESC_ADD_OWNER_TEST_ID = 'tx-description-add-owner'
export const TRANSACTIONS_DESC_REMOVE_OWNER_TEST_ID = 'tx-description-remove-owner'
export const TRANSACTIONS_DESC_CHANGE_THRESHOLD_TEST_ID = 'tx-description-change-threshold'
export const TRANSACTIONS_DESC_SEND_TEST_ID = 'tx-description-send'
export const TRANSACTIONS_DESC_CUSTOM_VALUE_TEST_ID = 'tx-description-custom-value'
export const TRANSACTIONS_DESC_CUSTOM_DATA_TEST_ID = 'tx-description-custom-data'
export const TRANSACTIONS_DESC_NO_DATA = 'tx-description-no-data'

export const styles = () => ({
  txDataContainer: {
    paddingTop: lg,
    paddingLeft: md,
    paddingBottom: md,
  },
  txData: {
    wordBreak: 'break-all',
  },
  txDataParagraph: {
    whiteSpace: 'normal',
  },
  linkTxData: {
    textDecoration: 'underline',
    cursor: 'pointer',
  },
})

type Props = {
  classes: Object,
  tx: Transaction,
}

type TransferDescProps = {
  amount: string,
  recipient: string,
}

type DescriptionDescProps = {
  action: string,
  addedOwner?: string,
  newThreshold?: string,
  removedOwner?: string,
}

type CustomDescProps = {
  amount: string,
  recipient: string,
  data: string,
  classes: Object,
}

type BountyPersonField = {
  label: string,
  value: string,
}

const TransferDescription = ({ amount = '', recipient }: TransferDescProps) => {
  const recipientName = getNameFromAddressBook(recipient)
  return (
    <Block data-testid={TRANSACTIONS_DESC_SEND_TEST_ID}>
      <Bold>Send {amount} to:</Bold>
      {recipientName ? (
        <OwnerAddressTableCell address={recipient} knownAddress showLinks userName={recipientName} />
      ) : (
        <EtherscanLink knownAddress={false} type="address" value={recipient} />
      )}
    </Block>
  )
}

const RemovedOwner = ({ removedOwner }: { removedOwner: string }) => {
  const ownerChangedName = getNameFromAddressBook(removedOwner)

  return (
    <Block data-testid={TRANSACTIONS_DESC_REMOVE_OWNER_TEST_ID}>
      <Bold>Remove owner:</Bold>
      {ownerChangedName ? (
        <OwnerAddressTableCell address={removedOwner} knownAddress showLinks userName={ownerChangedName} />
      ) : (
        <EtherscanLink knownAddress={false} type="address" value={removedOwner} />
      )}
    </Block>
  )
}

const AddedOwner = ({ addedOwner }: { addedOwner: string }) => {
  const ownerChangedName = getNameFromAddressBook(addedOwner)

  return (
    <Block data-testid={TRANSACTIONS_DESC_ADD_OWNER_TEST_ID}>
      <Bold>Add owner:</Bold>
      {ownerChangedName ? (
        <OwnerAddressTableCell address={addedOwner} knownAddress showLinks userName={ownerChangedName} />
      ) : (
        <EtherscanLink knownAddress={false} type="address" value={addedOwner} />
      )}
    </Block>
  )
}

const NewThreshold = ({ newThreshold }: { newThreshold: string }) => (
  <Block data-testid={TRANSACTIONS_DESC_CHANGE_THRESHOLD_TEST_ID}>
    <Bold>Change required confirmations:</Bold>
    <Paragraph noMargin size="md">
      {newThreshold}
    </Paragraph>
  </Block>
)

const SettingsDescription = ({ action, addedOwner, newThreshold, removedOwner }: DescriptionDescProps) => {
  if (action === SAFE_METHODS_NAMES.REMOVE_OWNER && removedOwner && newThreshold) {
    return (
      <>
        <RemovedOwner removedOwner={removedOwner} />
        <NewThreshold newThreshold={newThreshold} />
      </>
    )
  }

  if (action === SAFE_METHODS_NAMES.CHANGE_THRESHOLD && newThreshold) {
    return <NewThreshold newThreshold={newThreshold} />
  }

  if (action === SAFE_METHODS_NAMES.ADD_OWNER_WITH_THRESHOLD && addedOwner && newThreshold) {
    return (
      <>
        <AddedOwner addedOwner={addedOwner} />
        <NewThreshold newThreshold={newThreshold} />
      </>
    )
  }

  if (action === SAFE_METHODS_NAMES.SWAP_OWNER && removedOwner && addedOwner) {
    return (
      <>
        <RemovedOwner removedOwner={removedOwner} />
        <AddedOwner addedOwner={addedOwner} />
      </>
    )
  }

  return (
    <Block data-testid={TRANSACTIONS_DESC_NO_DATA}>
      <Bold>No data available for current transaction</Bold>
    </Block>
  )
}

const CustomDescription = ({ amount = 0, classes, data, recipient }: CustomDescProps) => {
  const [showTxData, setShowTxData] = useState(false)
  const recipientName = getNameFromAddressBook(recipient)
  return (
    <>
      <Block data-testid={TRANSACTIONS_DESC_CUSTOM_VALUE_TEST_ID}>
        <Bold>Send {amount} to:</Bold>
        {recipientName ? (
          <OwnerAddressTableCell address={recipient} knownAddress showLinks userName={recipientName} />
        ) : (
          <EtherscanLink knownAddress={false} type="address" value={recipient} />
        )}
      </Block>
      <Block className={classes.txData} data-testid={TRANSACTIONS_DESC_CUSTOM_DATA_TEST_ID}>
        <Bold>Data (hex encoded):</Bold>
        <Paragraph className={classes.txDataParagraph} noMargin size="md">
          {showTxData ? (
            <>
              {data}{' '}
              <LinkWithRef
                aria-label="Hide details of the transaction"
                className={classes.linkTxData}
                onClick={() => setShowTxData(false)}
                rel="noopener noreferrer"
                target="_blank"
              >
                Show Less
              </LinkWithRef>
            </>
          ) : (
            <>
              {shortVersionOf(data, 20)}{' '}
              <LinkWithRef
                aria-label="Show details of the transaction"
                className={classes.linkTxData}
                onClick={() => setShowTxData(true)}
                rel="noopener noreferrer"
                target="_blank"
              >
                Show More
              </LinkWithRef>
            </>
          )}
        </Paragraph>
      </Block>
    </>
  )
}

const web3 = getWeb3()

const funcSigs = ['payoutNoReviewer', 'payoutReviewedDelivery', 'payout'].reduce((acc, funcName) => {
  const funcAbi = bountyPayoutAbi.find((e) => e.name === funcName)
  const funcSig = web3.eth.abi.encodeFunctionSignature(funcAbi)
  acc[funcSig] = funcAbi
  return acc
}, {})

const decodePayoutAmount = (param) => {
  const val = web3.utils.toBN(param.substring(42), 16)
  const roundValue = val.div(web3.utils.toBN(String(10 ** 16))).toNumber() / 100
  const isRepOnly = val.toString().slice(-1) === '1'
  const unit = isRepOnly ? 'reputation points' : 'DAI'
  return `${roundValue} ${unit}`
}

const BountyPerson = ({ label, value }: BountyPersonField) => {
  const addr = web3.utils.toChecksumAddress(value.substring(0, 42))
  const recipientName = getNameFromAddressBook(addr)

  return (
    <div>
      <div style={{ fontWeight: 'bold' }}>{label}:</div>
      <div>Value: {decodePayoutAmount(value)}</div>
      <div>
        {recipientName ? (
          <div style={{ display: 'flex' }}>
            Address: {recipientName}
            <div style={{ display: 'flex', marginLeft: '0.5rem' }}>
              <CopyBtn content={addr} />
              <EtherscanBtn type="address" value={addr} />
            </div>
          </div>
        ) : (
          <EtherscanLink knownAddress={false} type="address" value={addr} />
        )}
      </div>
    </div>
  )
}

const BountyTxDescription = ({ classes, data }: CustomDescProps) => {
  const funcSig = data.substring(0, 10)
  const rawParams = data.slice(10)
  const { inputs } = funcSigs[funcSig]
  const params = web3.eth.abi.decodeParameters(inputs, `0x${rawParams}`)
  return (
    <>
      <Block className={classes.txData} data-testid={TRANSACTIONS_DESC_CUSTOM_DATA_TEST_ID}>
        <Bold>Bounty payout:</Bold>
        <Paragraph className={classes.txDataParagraph} noMargin size="md">
          {params._bountyId && (
            <p>
              Bounty:{' '}
              <a href={'https://github.com/leapdao/' + web3.utils.hexToAscii(params._bountyId)}>
                {web3.utils.hexToAscii(params._bountyId)}
              </a>
            </p>
          )}

          {params._gardener && <BountyPerson label="Gardener" value={params._gardener} />}
          {params._worker && <BountyPerson label="Worker" value={params._worker} />}
          {params._reviewer && <BountyPerson label="Reviewer" value={params._reviewer} />}
        </Paragraph>
      </Block>
    </>
  )
}

const TxDescription = ({ classes, tx }: Props) => {
  const {
    action,
    addedOwner,
    cancellationTx,
    creationTx,
    customTx,
    data,
    modifySettingsTx,
    newThreshold,
    recipient,
    removedOwner,
    upgradeTx,
  } = getTxData(tx)
  const amount = getTxAmount(tx, false)
  const bountyPayoutAddr = getBountyPayoutContractAddr()
  return (
    <Block className={classes.txDataContainer}>
      {modifySettingsTx && action && (
        <SettingsDescription
          action={action}
          addedOwner={addedOwner}
          newThreshold={newThreshold}
          removedOwner={removedOwner}
        />
      )}
      {recipient === bountyPayoutAddr ? (
        <BountyTxDescription classes={classes} data={data} />
      ) : (
        <>
          {!upgradeTx && customTx && (
            <CustomDescription amount={amount} classes={classes} data={data} recipient={recipient} />
          )}
          {upgradeTx && <div>{data}</div>}
          {!cancellationTx && !modifySettingsTx && !customTx && !creationTx && !upgradeTx && (
            <TransferDescription amount={amount} recipient={recipient} />
          )}
        </>
      )}
    </Block>
  )
}

export default withStyles(styles)(TxDescription)
