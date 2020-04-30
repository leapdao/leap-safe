// @flow
import ClickAwayListener from '@material-ui/core/ClickAwayListener'
import Grow from '@material-ui/core/Grow'
import List from '@material-ui/core/List'
import Popper from '@material-ui/core/Popper'
import { withStyles } from '@material-ui/core/styles'
import * as React from 'react'
import { Link } from 'react-router-dom'

import NetworkLabel from './NetworkLabel'
import Provider from './Provider'
import SafeListHeader from './SafeListHeader'

import Spacer from '~/components/Spacer'
import openHoc, { type Open } from '~/components/hoc/OpenHoc'
import Col from '~/components/layout/Col'
import Divider from '~/components/layout/Divider'
import Img from '~/components/layout/Img'
import Row from '~/components/layout/Row'
import { border, headerHeight, md, screenSm, sm } from '~/theme/variables'

const logo = require('../assets/leap-safe.png')

type Props = Open & {
  classes: Object,
  providerDetails: React.Node,
  providerInfo: React.Node,
}

const styles = () => ({
  root: {
    backgroundColor: 'white',
    borderRadius: sm,
    boxShadow: '0 0 10px 0 rgba(33, 48, 77, 0.1)',
    marginTop: '11px',
    minWidth: '280px',
    padding: 0,
  },
  summary: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderBottom: `solid 2px ${border}`,
    boxShadow: '0 2px 4px 0 rgba(212, 212, 211, 0.59)',
    flexWrap: 'nowrap',
    height: headerHeight,
    position: 'fixed',
    width: '100%',
    zIndex: 1301,
  },
  logo: {
    flexBasis: '115px',
    flexShrink: '0',
    flexGrow: '0',
    maxWidth: '115px',
    padding: sm,
    [`@media (min-width: ${screenSm}px)`]: {
      maxWidth: 'none',
      paddingLeft: md,
      paddingRight: md,
    },
  },
  logoTitle: {
    fontSize: '11px',
    color: '#000',
    marginLeft: '2px',
    lineHeight: '11px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  popper: {
    zIndex: 2000,
  },
})

const Layout = openHoc(({ classes, clickAway, open, providerDetails, providerInfo, toggle }: Props) => (
  <Row className={classes.summary}>
    <Col className={classes.logo} middle="xs" start="xs">
      <Link style={{ textDecoration: 'none' }} to="/">
        <div style={{ display: 'flex' }}>
          <Img alt="LeapDAO Team Safe" height={32} src={logo} />
          <div className={classes.logoTitle}>
            <div style={{ fontWeight: 'bold' }}>LeapDAO Safe</div>
            <div>Multisig</div>
          </div>
        </div>
      </Link>
    </Col>
    <Divider />
    <SafeListHeader />
    <Divider />
    <NetworkLabel />
    <Spacer />
    <Provider info={providerInfo} open={open} toggle={toggle}>
      {(providerRef) => (
        <Popper
          anchorEl={providerRef.current}
          className={classes.popper}
          open={open}
          placement="bottom"
          popperOptions={{ positionFixed: true }}
        >
          {({ TransitionProps }) => (
            <Grow {...TransitionProps}>
              <>
                <ClickAwayListener mouseEvent="onClick" onClickAway={clickAway} touchEvent={false}>
                  <List className={classes.root} component="div">
                    {providerDetails}
                  </List>
                </ClickAwayListener>
              </>
            </Grow>
          )}
        </Popper>
      )}
    </Provider>
  </Row>
))

export default withStyles(styles)(Layout)
