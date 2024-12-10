import { ListGroup, Offcanvas } from 'react-bootstrap'
import React from 'react'
import { useAppSelector } from '../../redux'
import { LinkContainer } from 'react-router-bootstrap'
import { NAV_LINKS } from './navLinks'

export const Sidebar = ({ show, onHide }) => {
  const auth = useAppSelector(state => state.auth)

  const listItems = auth ? LOGGED_IN_ITEMS : LOGGED_OUT_ITEMS
  return (
    <Offcanvas show={show} onHide={onHide} className="settings-offcanvas">
      <Offcanvas.Header closeButton>Navigation</Offcanvas.Header>
      <Offcanvas.Body className="px-0">
        <ListGroup variant="flush">
          {listItems.map(({ href, text }, idx) => (
            <LinkContainer to={href} key={idx} isActive={() => false}>
              <ListGroup.Item action onClick={onHide}>
                {text}
              </ListGroup.Item>
            </LinkContainer>
          ))}
        </ListGroup>
      </Offcanvas.Body>
    </Offcanvas>
  )
}

const LOGGED_OUT_ITEMS = [NAV_LINKS.LOGIN]

const LOGGED_IN_ITEMS = [
  NAV_LINKS.HOME,
  NAV_LINKS.GYMS,
  NAV_LINKS.WORKOUTS,
  NAV_LINKS.STATS,
  NAV_LINKS.ROUTES,
  NAV_LINKS.USER,
]

export default Sidebar
