// @flow
import IconButton from '@material-ui/core/IconButton'
import InputAdornment from '@material-ui/core/InputAdornment'
import { makeStyles } from '@material-ui/core/styles'
import Close from '@material-ui/icons/Close'
import ERC20Detailed from '@openzeppelin/contracts/build/contracts/ERC20Detailed.json'
import React, { useState } from 'react'
import { useSelector } from 'react-redux'

import { styles } from './style'

import CopyBtn from 'src/components/CopyBtn'
import EtherscanBtn from 'src/components/EtherscanBtn'
import Identicon from 'src/components/Identicon'
import { Checkbox } from '@gnosis.pm/safe-react-components'
import Field from 'src/components/forms/Field'
import GnoForm from 'src/components/forms/GnoForm'
import TextField from 'src/components/forms/TextField'
import { composeValidators, maxValue, minMaxLength, mustBeFloat, required } from 'src/components/forms/validator'
import Block from 'src/components/layout/Block'
import Button from 'src/components/layout/Button'
import Col from 'src/components/layout/Col'
import Hairline from 'src/components/layout/Hairline'
import Paragraph from 'src/components/layout/Paragraph'
import Row from 'src/components/layout/Row'
import { getBountyPayoutContractAddr, getBountyTokenAddr } from 'src/config/index'
import { getWeb3 } from 'src/logic/wallets/getWeb3'
import SafeInfo from 'src/routes/safe/components/Balances/SendModal/SafeInfo'
import AddressBookInput from 'src/routes/safe/components/Balances/SendModal/screens/AddressBookInput'
import { extendedSafeTokensSelector } from 'src/routes/safe/container/selector'
import { safeSelector } from 'src/routes/safe/store/selectors'

type Person = {
  address: string
  name: string
}

const useStyles = makeStyles(styles as any)

export const max32bytesSansGithubPrefix = (value: string) =>
  minMaxLength(1, 32)(value.replace('https://github.com/', ''))

const PayoutBounty = ({ initialValues, onClose, onNext }) => {
  const classes = useStyles()
  const { address: safeAddress, ethBalance } = useSelector(safeSelector)
  const activeTokens = useSelector(extendedSafeTokensSelector)
  const bountyTokenAddress = getBountyTokenAddr()
  const txToken = activeTokens.find((t) => t.address === bountyTokenAddress)

  const [selectedGardener, setSelectedGardener] = useState<Person | null>({
    address: '',
    name: '',
  })
  const [selectedWorker, setSelectedWorker] = useState<Person | null>({
    address: '',
    name: '',
  })

  const [selectedReviewer, setSelectedReviewer] = useState<Person | null>({
    address: '',
    name: '',
  })

  const [pristine, setPristine] = useState<boolean>(true)
  const [showWorkerField, setShowWorkerField] = useState<boolean>(false)
  const [showReviewerField, setShowReviewerField] = useState<boolean>(false)
  const [allowance, setAllowance] = useState<boolean>(false)

  const bountyAddress = getBountyPayoutContractAddr()

  React.useEffect(() => {
    const web3 = getWeb3()
    const token = new web3.eth.Contract(ERC20Detailed.abi as any, txToken.address)
    token.methods.allowance(safeAddress, bountyAddress).call().then(setAllowance)
  }, [bountyAddress, safeAddress, txToken.address])

  React.useMemo(() => {
    if (selectedGardener === null && pristine) {
      setPristine(false)
    }
  }, [selectedGardener, pristine])

  const handleSubmit = (values) => {
    if (validate(values)) {
      onNext({ ...values, showWorkerField, showReviewerField })
    }
  }

  const formMutators = {
    setGardenerAddress: (args, state, utils) => {
      utils.changeValue(state, 'gardenerAddress', () => args[0])
    },
    setWorkerAddress: (args, state, utils) => {
      utils.changeValue(state, 'workerAddress', () => args[0])
    },
    setReviewerAddress: (args, state, utils) => {
      utils.changeValue(state, 'reviewerAddress', () => args[0])
    },
  }

  const validate = (values) => {
    if (!showWorkerField && !showReviewerField) return false

    if (!values.bountyLink) return false

    if (!values.gardenerAddress || !values.gardenerAmount) return false

    if (showWorkerField) {
      if (!values.workerAddress || !values.workerAmount) return false
    }

    if (showReviewerField) {
      if (!values.reviewerAddress || !values.reviewerAmount) return false
    }

    return true
  }

  if (!txToken) {
    return (
      <div style={{ padding: '2rem' }}>
        <h2>Bounty token is not enabled</h2>
        <p>Please enable token {bountyTokenAddress} for the safe.</p>
      </div>
    )
  }

  return (
    <>
      <Row align="center" className={classes.heading} grow>
        <Paragraph className={classes.manage} noMargin weight="bolder">
          Payout Bounty
        </Paragraph>
        <Paragraph className={classes.annotation}>1 of 2</Paragraph>
        <IconButton disableRipple onClick={onClose}>
          <Close className={classes.closeIcon} />
        </IconButton>
      </Row>
      <Hairline />
      <GnoForm formMutators={formMutators} initialValues={initialValues} onSubmit={handleSubmit}>
        {(...args) => {
          const mutators = args[3]
          const { values } = args[2]

          const isValid = validate(values)

          return (
            <>
              <Block className={classes.formContainer}>
                <SafeInfo />
                <Row margin="md">
                  <Col>
                    <Field
                      component={TextField}
                      name="bountyLink"
                      placeholder="Link to bounty ticket"
                      text="Link to bounty ticket"
                      type="text"
                      validate={composeValidators(required, max32bytesSansGithubPrefix)}
                    />
                  </Col>
                </Row>
                <Row margin="md">
                  <Col className="sectionName" xs={9}>
                    <Block justify="left">
                      <Field
                        className={classes.checkbox}
                        component={Checkbox}
                        disabled={parseFloat(ethBalance) < 0.1 || !allowance}
                        name="withRefund"
                        type="checkbox"
                      />
                      <Paragraph className={classes.checkboxLabel} size="md" weight="bolder">
                        Refund execution tx fee (needs at least 0.1Ξ in the Safe)
                      </Paragraph>
                    </Block>
                  </Col>
                </Row>
                <Row margin="md">
                  <Col className="sectionName" xs={3}>
                    Gardener
                  </Col>
                  <Col center="xs" layout="column" xs={9}>
                    <Hairline />
                  </Col>
                </Row>
                {selectedGardener && selectedGardener.address ? (
                  <div
                    onKeyDown={(e) => {
                      if (e.keyCode !== 9) {
                        setSelectedGardener(null)
                      }
                    }}
                    role="listbox"
                    tabIndex={0}
                  >
                    <Row align="center" margin="md">
                      <Col xs={1}>
                        <Identicon address={selectedGardener.address} diameter={32} />
                      </Col>
                      <Col layout="column" xs={11}>
                        <Block justify="left">
                          <Block>
                            <Paragraph
                              className={classes.selectAddress}
                              noMargin
                              onClick={() => setSelectedGardener(null)}
                              weight="bolder"
                            >
                              {selectedGardener.name}
                            </Paragraph>
                            <Paragraph
                              className={classes.selectAddress}
                              noMargin
                              onClick={() => setSelectedGardener(null)}
                              weight="bolder"
                            >
                              {selectedGardener.address}
                            </Paragraph>
                          </Block>
                          <CopyBtn content={selectedGardener.address} />
                          <EtherscanBtn type="address" value={selectedGardener.address} />
                        </Block>
                      </Col>
                    </Row>
                  </div>
                ) : (
                  <>
                    <Row margin="md">
                      <Col>
                        <AddressBookInput
                          fieldMutator={mutators.setGardenerAddress}
                          label="Address"
                          pristine={pristine}
                          setIsValidAddress={() => true}
                          setSelectedEntry={setSelectedGardener}
                        />
                      </Col>
                    </Row>
                  </>
                )}
                <Row margin="md">
                  <Col xs={5}>
                    <Field
                      className={classes.addressInput}
                      component={TextField}
                      inputAdornment={{
                        endAdornment: <InputAdornment position="end">DAI</InputAdornment>,
                      }}
                      name="gardenerAmount"
                      placeholder="Amount"
                      text="Amount"
                      type="text"
                      validate={composeValidators(required, mustBeFloat, maxValue(txToken.balance))}
                    />
                  </Col>
                  <Col xs={7}>
                    <Block justify="left">
                      <Field className={classes.checkbox} component={Checkbox} name="gardenerIsRep" type="checkbox" />
                      <Paragraph className={classes.checkboxLabel} size="md" weight="bolder">
                        Reputation only
                      </Paragraph>
                    </Block>
                  </Col>
                </Row>
                <Row margin="md">
                  <Col className="sectionName" onClick={() => setShowWorkerField(!showWorkerField)} xs={3}>
                    {!showWorkerField ? '+ Add worker' : 'Worker'}
                  </Col>
                  <Col center="xs" layout="column" xs={9}>
                    <Hairline />
                  </Col>
                </Row>
                {showWorkerField && (
                  <>
                    {selectedWorker && selectedWorker.address ? (
                      <div
                        onKeyDown={(e) => {
                          if (e.keyCode !== 9) {
                            setSelectedWorker(null)
                          }
                        }}
                        role="listbox"
                        tabIndex={0}
                      >
                        <Row align="center" margin="md">
                          <Col xs={1}>
                            <Identicon address={selectedWorker.address} diameter={32} />
                          </Col>
                          <Col layout="column" xs={11}>
                            <Block justify="left">
                              <Block>
                                <Paragraph
                                  className={classes.selectAddress}
                                  noMargin
                                  onClick={() => setSelectedWorker(null)}
                                  weight="bolder"
                                >
                                  {selectedWorker.name}
                                </Paragraph>
                                <Paragraph
                                  className={classes.selectAddress}
                                  noMargin
                                  onClick={() => setSelectedWorker(null)}
                                  weight="bolder"
                                >
                                  {selectedWorker.address}
                                </Paragraph>
                              </Block>
                              <CopyBtn content={selectedWorker.address} />
                              <EtherscanBtn type="address" value={selectedWorker.address} />
                            </Block>
                          </Col>
                        </Row>
                      </div>
                    ) : (
                      <>
                        <Row margin="md">
                          <Col>
                            <AddressBookInput
                              fieldMutator={mutators.setWorkerAddress}
                              label="Address"
                              pristine={pristine}
                              setIsValidAddress={() => true}
                              setSelectedEntry={setSelectedWorker}
                            />
                          </Col>
                        </Row>
                      </>
                    )}
                    <Row margin="md">
                      <Col xs={5}>
                        <Field
                          className={classes.addressInput}
                          component={TextField}
                          inputAdornment={{
                            endAdornment: <InputAdornment position="end">DAI</InputAdornment>,
                          }}
                          name="workerAmount"
                          placeholder="Amount"
                          text="Amount"
                          type="text"
                          validate={composeValidators(required, mustBeFloat, maxValue(txToken.balance))}
                        />
                      </Col>
                      <Col xs={7}>
                        <Block justify="left">
                          <Field className={classes.checkbox} component={Checkbox} name="workerIsRep" type="checkbox" />
                          <Paragraph className={classes.checkboxLabel} size="md" weight="bolder">
                            Reputation only
                          </Paragraph>
                        </Block>
                      </Col>
                    </Row>
                  </>
                )}
                <Row margin="md">
                  <Col className="sectionName" onClick={() => setShowReviewerField(!showReviewerField)} xs={3}>
                    {!showReviewerField ? '+ Add reviewer' : 'Reviewer'}
                  </Col>
                  <Col center="xs" layout="column" xs={9}>
                    <Hairline />
                  </Col>
                </Row>
                {showReviewerField && (
                  <>
                    {selectedReviewer && selectedReviewer.address ? (
                      <div
                        onKeyDown={(e) => {
                          if (e.keyCode !== 9) {
                            setSelectedReviewer(null)
                          }
                        }}
                        role="listbox"
                        tabIndex={0}
                      >
                        <Row align="center" margin="md">
                          <Col xs={1}>
                            <Identicon address={selectedReviewer.address} diameter={32} />
                          </Col>
                          <Col layout="column" xs={11}>
                            <Block justify="left">
                              <Block>
                                <Paragraph
                                  className={classes.selectAddress}
                                  noMargin
                                  onClick={() => setSelectedReviewer(null)}
                                  weight="bolder"
                                >
                                  {selectedReviewer.name}
                                </Paragraph>
                                <Paragraph
                                  className={classes.selectAddress}
                                  noMargin
                                  onClick={() => setSelectedReviewer(null)}
                                  weight="bolder"
                                >
                                  {selectedReviewer.address}
                                </Paragraph>
                              </Block>
                              <CopyBtn content={selectedReviewer.address} />
                              <EtherscanBtn type="address" value={selectedReviewer.address} />
                            </Block>
                          </Col>
                        </Row>
                      </div>
                    ) : (
                      <>
                        <Row margin="md">
                          <Col>
                            <AddressBookInput
                              fieldMutator={mutators.setReviewerAddress}
                              label="Address"
                              pristine={pristine}
                              setIsValidAddress={() => true}
                              setSelectedEntry={setSelectedReviewer}
                            />
                          </Col>
                        </Row>
                      </>
                    )}
                    <Row margin="md">
                      <Col xs={5}>
                        <Field
                          className={classes.addressInput}
                          component={TextField}
                          inputAdornment={{
                            endAdornment: <InputAdornment position="end">DAI</InputAdornment>,
                          }}
                          name="reviewerAmount"
                          placeholder="Amount"
                          text="Amount"
                          type="text"
                          validate={composeValidators(required, mustBeFloat, maxValue(txToken.balance))}
                        />
                      </Col>
                      <Col xs={7}>
                        <Block justify="left">
                          <Field
                            className={classes.checkbox}
                            component={Checkbox}
                            name="reviewerIsRep"
                            type="checkbox"
                          />
                          <Paragraph className={classes.checkboxLabel} size="md" weight="bolder">
                            Reputation only
                          </Paragraph>
                        </Block>
                      </Col>
                    </Row>
                  </>
                )}
              </Block>
              <Hairline />
              <Row align="center" className={classes.buttonRow}>
                <Button minWidth={140} onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  className={classes.submitButton}
                  color="primary"
                  data-testid="review-tx-btn"
                  disabled={!isValid}
                  minWidth={140}
                  type="submit"
                  variant="contained"
                >
                  Review
                </Button>
              </Row>
            </>
          )
        }}
      </GnoForm>
    </>
  )
}

export default PayoutBounty
