// @flow
import IconButton from '@material-ui/core/IconButton'
import { makeStyles } from '@material-ui/core/styles'
import Close from '@material-ui/icons/Close'
import { withSnackbar } from 'notistack'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import ArrowDown from '../assets/arrow-down.svg'

import { styles } from './style'

import CopyBtn from '~/components/CopyBtn'
import EtherscanBtn from '~/components/EtherscanBtn'
import Identicon from '~/components/Identicon'
import Block from '~/components/layout/Block'
import Button from '~/components/layout/Button'
import Col from '~/components/layout/Col'
import Hairline from '~/components/layout/Hairline'
import Img from '~/components/layout/Img'
import Paragraph from '~/components/layout/Paragraph'
import Row from '~/components/layout/Row'
import { getBountyPayoutContractAddr, getBountyTokenAddr } from '~/config/index'
import bountyPayoutAbi from '~/logic/bounty/bountyPayout.abi.js'
import { TX_NOTIFICATION_TYPES } from '~/logic/safe/transactions'
import { estimateTxGasCosts } from '~/logic/safe/transactions/gasNew'
import { formatAmount } from '~/logic/tokens/utils/formatAmount'
import { EMPTY_DATA } from '~/logic/wallets/ethTransactions'
import { getWeb3 } from '~/logic/wallets/getWeb3'
import SafeInfo from '~/routes/safe/components/Balances/SendModal/SafeInfo'
import { setImageToPlaceholder } from '~/routes/safe/components/Balances/utils'
import { extendedSafeTokensSelector } from '~/routes/safe/container/selector'
import createTransaction from '~/routes/safe/store/actions/createTransaction'
import { safeSelector } from '~/routes/safe/store/selectors'
import { sm } from '~/theme/variables'

type Props = {
  closeSnackbar: Function,
  enqueueSnackbar: Function,
  onClose: () => void,
  onPrev: () => void,
  tx: Object,
}

const useStyles = makeStyles(styles)

const ReviewPayoutBounty = ({ closeSnackbar, enqueueSnackbar, onClose, onPrev, tx }: Props) => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const { address: safeAddress, ethBalance, name: safeName } = useSelector(safeSelector)
  const tokens = useSelector(extendedSafeTokensSelector)
  const [gasCosts, setGasCosts] = useState<string>('< 0.001')
  const [data, setData] = useState('')

  const bountyTokenAddr = getBountyTokenAddr()
  const txToken = tokens.find((token) => token.address === bountyTokenAddr)
  const isSendingETH = false
  // if no refund, use old version of bounty payout contract (mainnet hardcoded)
  const txRecipient = tx.withRefund ? getBountyPayoutContractAddr() : '0x572d03FD45E85d5ca0BCd3679c99000D23A6b8f1'

  useEffect(() => {
    let isCurrent = true

    const estimateGas = async () => {
      const web3 = getWeb3()
      const { asciiToHex, fromWei, padLeft, toBN, toHex } = web3.utils

      let txData = EMPTY_DATA

      const bountyContract = new web3.eth.Contract(bountyPayoutAbi, txRecipient)

      const bountyId = asciiToHex(tx.bountyLink.replace('https://github.com/leapdao', ''))

      const stripHexPrefix = (v) => v.replace('0x', '')

      const _getInput = (_address, _amount, _isRepOnly) => {
        const _amountBN = toBN(_amount * 10 ** 18)
        const _amountHex = padLeft(
          stripHexPrefix(toHex(_isRepOnly ? _amountBN.add(toBN(1)).toString() : _amountBN.toString())),
          24,
        )
        return `0x${stripHexPrefix(_address)}${_amountHex}`
      }

      const gardenerInput = _getInput(tx.gardenerAddress, tx.gardenerAmount, tx.gardenerIsRep)
      let workerInput, reviewerInput
      if (tx.showWorkerField) {
        workerInput = _getInput(tx.workerAddress, tx.workerAmount, tx.workerIsRep)
      }
      if (tx.showReviewerField) {
        reviewerInput = _getInput(tx.reviewerAddress, tx.reviewerAmount, tx.reviewerIsRep)
      }

      if (tx.showWorkerField && tx.showReviewerField) {
        txData = bountyContract.methods.payout(gardenerInput, workerInput, reviewerInput, bountyId).encodeABI
      } else if (tx.showWorkerField) {
        txData = bountyContract.methods.payoutNoReviewer(gardenerInput, workerInput, bountyId).encodeABI
      } else if (tx.showReviewerField) {
        txData = bountyContract.methods.payoutReviewedDelivery(gardenerInput, reviewerInput, bountyId).encodeABI
      }

      const estimatedGasCosts = await estimateTxGasCosts(safeAddress, txRecipient, txData)
      const gasCostsAsEth = fromWei(toBN(estimatedGasCosts), 'ether')
      const formattedGasCosts = formatAmount(gasCostsAsEth)

      if (isCurrent) {
        setGasCosts(formattedGasCosts)
        setData(txData)
      }
    }

    estimateGas()

    return () => {
      isCurrent = false
    }
  }, [])

  const submitTx = async () => {
    const web3 = getWeb3()
    // txAmount should be 0 if we send tokens
    // the real value is encoded in txData and will be used by the contract
    // if txAmount > 0 it would send ETH from the Safe
    const txAmount = isSendingETH
      ? web3.utils.toWei(tx.amount, 'ether')
      : tx.withRefund
      ? web3.utils.toWei('0.1', 'ether')
      : '0'

    dispatch(
      createTransaction({
        safeAddress,
        to: txRecipient,
        valueInWei: txAmount,
        txData: data,
        notifiedTransaction: TX_NOTIFICATION_TYPES.STANDARD_TX,
        enqueueSnackbar,
        closeSnackbar,
      }),
    )
    onClose()
  }

  return (
    <>
      <Row align="center" className={classes.heading} grow>
        <Paragraph className={classes.headingText} noMargin weight="bolder">
          Payout Bounty
        </Paragraph>
        <Paragraph className={classes.annotation}>2 of 2</Paragraph>
        <IconButton disableRipple onClick={onClose}>
          <Close className={classes.closeIcon} />
        </IconButton>
      </Row>
      <Hairline />
      <Block className={classes.container}>
        <SafeInfo ethBalance={ethBalance} primaryToken={txToken} safeAddress={safeAddress} safeName={safeName} />
        <Row margin="md">
          <Col xs={1}>
            <img alt="Arrow Down" src={ArrowDown} style={{ marginLeft: sm }} />
          </Col>
          <Col center="xs" layout="column" xs={11}>
            <Hairline />
          </Col>
        </Row>
        <Row margin="xs">
          <Paragraph color="disabled" noMargin size="md" style={{ letterSpacing: '-0.5px' }}>
            Gardener
          </Paragraph>
        </Row>
        <Row align="center" margin="md">
          <Col xs={1}>
            <Identicon address={tx.gardenerAddress} diameter={32} />
          </Col>
          <Col layout="column" xs={11}>
            <Block justify="left">
              <Paragraph className={classes.address} noMargin weight="bolder">
                {tx.gardenerAddress}
              </Paragraph>
              <CopyBtn content={tx.gardenerAddress} />
              <EtherscanBtn type="address" value={tx.gardenerAddress} />
            </Block>
          </Col>
        </Row>
        <Row margin="xs">
          <Paragraph color="disabled" noMargin size="md" style={{ letterSpacing: '-0.5px' }}>
            Gardener Amount
          </Paragraph>
        </Row>
        <Row align="center" margin="md">
          {!tx.gardenerIsRep && (
            <Img alt={txToken.name} height={28} onError={setImageToPlaceholder} src={txToken.logoUri} />
          )}
          <Paragraph className={classes.amount} noMargin size="md">
            {tx.gardenerAmount} {tx.gardenerIsRep ? 'reputation points' : txToken.symbol}
          </Paragraph>
        </Row>
        {tx.showWorkerField && (
          <>
            <Row margin="xs">
              <Paragraph color="disabled" noMargin size="md" style={{ letterSpacing: '-0.5px' }}>
                Worker
              </Paragraph>
            </Row>
            <Row align="center" margin="md">
              <Col xs={1}>
                <Identicon address={tx.workerAddress} diameter={32} />
              </Col>
              <Col layout="column" xs={11}>
                <Block justify="left">
                  <Paragraph className={classes.address} noMargin weight="bolder">
                    {tx.workerAddress}
                  </Paragraph>
                  <CopyBtn content={tx.workerAddress} />
                  <EtherscanBtn type="address" value={tx.workerAddress} />
                </Block>
              </Col>
            </Row>
            <Row margin="xs">
              <Paragraph color="disabled" noMargin size="md" style={{ letterSpacing: '-0.5px' }}>
                Worker Amount
              </Paragraph>
            </Row>
            <Row align="center" margin="md">
              {!tx.workerIsRep && (
                <Img alt={txToken.name} height={28} onError={setImageToPlaceholder} src={txToken.logoUri} />
              )}
              <Paragraph className={classes.amount} noMargin size="md">
                {tx.workerAmount} {tx.workerIsRep ? 'reputation points' : txToken.symbol}
              </Paragraph>
            </Row>
          </>
        )}
        {tx.showReviewerField && (
          <>
            <Row margin="xs">
              <Paragraph color="disabled" noMargin size="md" style={{ letterSpacing: '-0.5px' }}>
                Reviewer
              </Paragraph>
            </Row>
            <Row align="center" margin="md">
              <Col xs={1}>
                <Identicon address={tx.reviewerAddress} diameter={32} />
              </Col>
              <Col layout="column" xs={11}>
                <Block justify="left">
                  <Paragraph className={classes.address} noMargin weight="bolder">
                    {tx.reviewerAddress}
                  </Paragraph>
                  <CopyBtn content={tx.reviewerAddress} />
                  <EtherscanBtn type="address" value={tx.reviewerAddress} />
                </Block>
              </Col>
            </Row>
            <Row margin="xs">
              <Paragraph color="disabled" noMargin size="md" style={{ letterSpacing: '-0.5px' }}>
                Reviewer Amount
              </Paragraph>
            </Row>
            <Row align="center" margin="md">
              {!tx.reviewerIsRep && (
                <Img alt={txToken.name} height={28} onError={setImageToPlaceholder} src={txToken.logoUri} />
              )}
              <Paragraph className={classes.amount} noMargin size="md">
                {tx.reviewerAmount} {tx.reviewerIsRep ? 'reputation points' : txToken.symbol}
              </Paragraph>
            </Row>
          </>
        )}
        <Row>
          <Paragraph>
            {`You're about to create a transaction and will have to confirm it with your currently connected wallet. Make sure you have ${gasCosts} (fee price) ETH in this wallet to fund this confirmation.`}
          </Paragraph>
        </Row>
      </Block>
      <Hairline style={{ position: 'absolute', bottom: 85 }} />
      <Row align="center" className={classes.buttonRow}>
        <Button minWidth={140} onClick={onPrev}>
          Back
        </Button>
        <Button
          className={classes.submitButton}
          color="primary"
          data-testid="submit-tx-btn"
          disabled={!data}
          minWidth={140}
          onClick={submitTx}
          type="submit"
          variant="contained"
        >
          Submit
        </Button>
      </Row>
    </>
  )
}

export default withSnackbar(ReviewPayoutBounty)
