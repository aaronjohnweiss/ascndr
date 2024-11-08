import { Col, Nav, Navbar } from 'react-bootstrap'
import React from 'react'
import { NAV_LINKS, NavBarItem } from './navLinks'
import { Link, useLocation } from 'react-router-dom'
import * as H from 'history'

const isActive = (location, item) =>
  location &&
  (item.href === '/'
    ? location.pathname == item.href //Home should just match on '/'
    : [item.href, ...(item.subPages || [])].some(href => location.pathname.startsWith(href)))

const IconLink = ({ item, location }: { item: NavBarItem; location: H.Location<any> }) => (
  <Nav.Link
    as={Link}
    active={isActive(location, item)}
    to={item.href}
    className="d-flex flex-column align-items-center"
  >
    <item.icon size={24} />
    <>{item.text}</>
  </Nav.Link>
)

export const BottomNavbar = () => {
  const location = useLocation()

  console.log(location)

  return (
    <Navbar
      fixed="bottom"
      variant="light"
      data-bs-theme="light"
      bg="light"
      className="px-4 py-2 border-top border-2"
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
  )
}
export default BottomNavbar
