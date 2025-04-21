import { Col, Nav, Navbar } from 'react-bootstrap'
import React from 'react'
import { NAV_LINKS, NavBarItem } from './navLinks'
import { Link, useLocation } from 'react-router-dom'
import * as H from 'history'
import { isIos, isInStandaloneMode } from '../../helpers/iosUtils'
import QuickAddMenu from '../QuickAddMenu'

interface IconProps {
  item: NavBarItem
  location: H.Location
}
export const isActive = ({ location, item }: IconProps) =>
  location &&
  (item.href === '/'
    ? location.pathname == item.href // Home should just match on '/'
    : [item.href, ...(item.subPages || [])].some(href => location.pathname.startsWith(href)))

const IconLink = ({ item, location }: IconProps) => (
  <Nav.Link
    as={Link}
    active={isActive({ location, item })}
    to={item.href}
    className="d-flex flex-column align-items-center"
  >
    <item.icon size={24} />
    <>{item.text}</>
  </Nav.Link>
)

export const BottomNavbar = () => {
  const location = useLocation()

  const addIOSPadding:boolean = isIos() && isInStandaloneMode();

  return (
    <div className={'bottom-navbar'}>
      { location.pathname == "/" && <QuickAddMenu addIOSPadding={addIOSPadding} /> }
      <Navbar
        variant="light"
        data-bs-theme="light"
        bg="light"
        className={`px-4 ${ addIOSPadding ? 'pb-4 pt-2' : 'py-2'} border-top border-2`}
      >
        <Col>
          <IconLink location={location} item={NAV_LINKS.HOME} />
        </Col>
        <Col>
          <IconLink location={location} item={NAV_LINKS.GYMS} />
        </Col>
        <Col>
          <IconLink location={location} item={NAV_LINKS.WORKOUTS} />
        </Col>
        <Col>
          <IconLink location={location} item={NAV_LINKS.STATS} />
        </Col>
      </Navbar>
    </div>
  )
}
export default BottomNavbar
