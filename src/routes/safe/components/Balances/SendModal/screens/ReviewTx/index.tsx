import IconButton from '@material-ui/core/IconButton'
import { makeStyles } from '@material-ui/core/styles'
import Close from '@material-ui/icons/Close'
import { BigNumber } from 'bignumber.js'
import { withSnackbar } from 'notistack'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import ArrowDown from '../assets/arrow-down.svg'

import { styles } from './style'

import CopyBtn from 'src/components/CopyBtn'
import EtherscanBtn from 'src/components/EtherscanBtn'
import Identicon from 'src/components/Identicon'
import Block from 'src/components/layout/Block'
import Button from 'src/components/layout/Button'
import Col from 'src/components/layout/Col'
import Hairline from 'src/components/layout/Hairline'
import Img from 'src/components/layout/Img'
import Paragraph from 'src/components/layout/Paragraph'
import Row from 'src/components/layout/Row'
import { TX_NOTIFICATION_TYPES } from 'src/logic/safe/transactions'
import { estimateTxGasCosts } from 'src/logic/safe/transactions/gasNew'
import { getHumanFriendlyToken } from 'src/logic/tokens/store/actions/fetchTokens'
import { formatAmount } from 'src/logic/tokens/utils/formatAmount'
import { ETH_ADDRESS } from 'src/logic/tokens/utils/tokenHelpers'
import { EMPTY_DATA } from 'src/logic/wallets/ethTransactions'
import { getWeb3 } from 'src/logic/wallets/getWeb3'
import SafeInfo from 'src/routes/safe/components/Balances/SendModal/SafeInfo'
import { setImageToPlaceholder } from 'src/routes/safe/components/Balances/utils'
import { extendedSafeTokensSelector } from 'src/routes/safe/container/selector'
import createTransaction from 'src/routes/safe/store/actions/createTransaction'
import { safeSelector } from 'src/routes/safe/store/selectors'
import { sm } from 'src/theme/variables'

const useStyles = makeStyles(styles as any)

const ReviewTx = ({ closeSnackbar, enqueueSnackbar, onClose, onPrev, tx }) => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const { address: safeAddress } = useSelector(safeSelector)
  const tokens = useSelector(extendedSafeTokensSelector)
  const [gasCosts, setGasCosts] = useState('< 0.001')
  const [data, setData] = useState('')

  const txToken = tokens.find((token) => token.address === tx.token)
  const isSendingETH = txToken.address === ETH_ADDRESS
  const txRecipient = isSendingETH ? tx.recipientAddress : txToken.address

  useEffect(() => {
    let isCurrent = true

    const estimateGas = async () => {
      const { fromWei, toBN } = getWeb3().utils

      let txData = EMPTY_DATA

      if (!isSendingETH) {
        const StandardToken = await getHumanFriendlyToken()
        const tokenInstance = await StandardToken.at(txToken.address)
        const decimals = await tokenInstance.decimals()
        const txAmount = new BigNumber(tx.amount).times(10 ** decimals.toNumber()).toString()

        txData = tokenInstance.contract.methods.transfer(tx.recipientAddress, txAmount).encodeABI()
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
  }, [isSendingETH, safeAddress, tx.amount, tx.recipientAddress, txRecipient, txToken.address])

  const submitTx = async () => {
    const web3 = getWeb3()
    // txAmount should be 0 if we send tokens
    // the real value is encoded in txData and will be used by the contract
    // if txAmount > 0 it would send ETH from the Safe
    const txAmount = isSendingETH ? web3.utils.toWei(tx.amount, 'ether') : '0'

    dispatch(
      createTransaction({
        safeAddress,
        to: txRecipient,
        valueInWei: txAmount,
        txData: data,
        notifiedTransaction: TX_NOTIFICATION_TYPES.STANDARD_TX,
        enqueueSnackbar,
        closeSnackbar,
      } as any),
    )
    onClose()
  }

  return (
    <>
      <Row align="center" className={classes.heading} grow>
        <Paragraph className={classes.headingText} noMargin weight="bolder">
          Send Funds
        </Paragraph>
        <Paragraph className={classes.annotation}>2 of 2</Paragraph>
        <IconButton disableRipple onClick={onClose}>
          <Close className={classes.closeIcon} />
        </IconButton>
      </Row>
      <Hairline />
      <Block className={classes.container}>
        <SafeInfo />
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
            Recipient
          </Paragraph>
        </Row>
        <Row align="center" margin="md">
          <Col xs={1}>
            <Identicon address={tx.recipientAddress} diameter={32} />
          </Col>
          <Col layout="column" xs={11}>
            <Block justify="left">
              <Paragraph className={classes.address} noMargin weight="bolder">
                {tx.recipientAddress}
              </Paragraph>
              <CopyBtn content={tx.recipientAddress} />
              <EtherscanBtn type="address" value={tx.recipientAddress} />
            </Block>
          </Col>
        </Row>
        <Row margin="xs">
          <Paragraph color="disabled" noMargin size="md" style={{ letterSpacing: '-0.5px' }}>
            Amount
          </Paragraph>
        </Row>
        <Row align="center" margin="md">
          <Img alt={txToken.name} height={28} onError={setImageToPlaceholder} src={txToken.logoUri} />
          <Paragraph className={classes.amount} noMargin size="md">
            {tx.amount} {txToken.symbol}
          </Paragraph>
        </Row>
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

export default withSnackbar(ReviewTx)
