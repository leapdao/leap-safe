// @flow
import IconButton from '@material-ui/core/IconButton'
import InputAdornment from '@material-ui/core/InputAdornment'
import { makeStyles } from '@material-ui/core/styles'
import Close from '@material-ui/icons/Close'
import React, { useState } from 'react'
import { useSelector } from 'react-redux'

import { styles } from './style'

import CopyBtn from '~/components/CopyBtn'
import EtherscanBtn from '~/components/EtherscanBtn'
import Identicon from '~/components/Identicon'
import Checkbox from '~/components/forms/Checkbox'
import Field from '~/components/forms/Field'
import GnoForm from '~/components/forms/GnoForm'
import TextField from '~/components/forms/TextField'
import { composeValidators, maxValue, mustBeFloat } from '~/components/forms/validator'
import Block from '~/components/layout/Block'
import Button from '~/components/layout/Button'
import Col from '~/components/layout/Col'
import Hairline from '~/components/layout/Hairline'
import Paragraph from '~/components/layout/Paragraph'
import Row from '~/components/layout/Row'
import { getBountyTokenAddr } from '~/config/index'
import SafeInfo from '~/routes/safe/components/Balances/SendModal/SafeInfo'
import AddressBookInput from '~/routes/safe/components/Balances/SendModal/screens/AddressBookInput'
import { extendedSafeTokensSelector } from '~/routes/safe/container/selector'
import { safeSelector } from '~/routes/safe/store/selectors'

type Props = {
  initialValues: Object,
  onClose: () => void,
  onNext: (any) => void,
}

const useStyles = makeStyles(styles)

const PayoutBounty = ({ initialValues, onClose, onNext }: Props) => {
  const classes = useStyles()
  const { address: safeAddress, ethBalance, name: safeName } = useSelector(safeSelector)
  const activeTokens = useSelector(extendedSafeTokensSelector)
  const bountyTokenAddress = getBountyTokenAddr()
  const txToken = activeTokens.find((t) => t.address === bountyTokenAddress)
  const [selectedGardener, setSelectedGardener] = useState<Object | null>({
    address: '',
    name: '',
  })
  const [selectedWorker, setSelectedWorker] = useState<Object | null>({
    address: '',
    name: '',
  })

  const [selectedReviewer, setSelectedReviewer] = useState<Object | null>({
    address: '',
    name: '',
  })

  const [pristine, setPristine] = useState<boolean>(true)
  const [, setIsValidAddress] = useState<boolean>(true)
  const [showWorkerField, setShowWorkerField] = useState<boolean>(false)
  const [showReviewerField, setShowReviewerField] = useState<boolean>(false)

  React.useMemo(() => {
    if (selectedGardener === null && pristine) {
      setPristine(false)
    }
  }, [selectedGardener, pristine])

  const handleSubmit = (values) => {
    if (isValidForm) {
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

  const isValidForm = () => {
    return (
      selectedWorker &&
      selectedWorker.address &&
      selectedReviewer &&
      selectedReviewer.address &&
      selectedGardener &&
      selectedGardener.address
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

          const shouldDisableSubmitButton = !isValidForm

          return (
            <>
              <Block className={classes.formContainer}>
                <SafeInfo
                  ethBalance={ethBalance}
                  primaryToken={txToken}
                  safeAddress={safeAddress}
                  safeName={safeName}
                />
                <Row margin="md">
                  <Col>
                    <Field
                      component={TextField}
                      name="bountyLink"
                      placeholder="Link to bounty ticket"
                      text="Link to bounty ticket"
                      type="text"
                    />
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
                    tabIndex="0"
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
                          isCustomTx
                          label="Address"
                          pristine={pristine}
                          setIsValidAddress={setIsValidAddress}
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
                      validate={composeValidators(mustBeFloat, maxValue(txToken.balance))}
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
                        tabIndex="0"
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
                              isCustomTx
                              label="Address"
                              pristine={pristine}
                              setIsValidAddress={setIsValidAddress}
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
                          validate={composeValidators(mustBeFloat, maxValue(txToken.balance))}
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
                        tabIndex="0"
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
                              isCustomTx
                              label="Address"
                              pristine={pristine}
                              setIsValidAddress={setIsValidAddress}
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
                          validate={composeValidators(mustBeFloat, maxValue(txToken.balance))}
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
                  disabled={shouldDisableSubmitButton}
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
