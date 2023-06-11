import {ListGroup, Offcanvas} from "react-bootstrap";
import React from "react";
import {useAppSelector} from "../redux/index"

export const Sidebar = ({show, onHide}) => {
    const auth = useAppSelector(state => state.auth)

    const listItems = auth ? loggedInItems({auth}) : loggedOutItems()
    return (
        <Offcanvas show={show} onHide={onHide} className="settings-offcanvas">
            <Offcanvas.Header closeButton>Navigation</Offcanvas.Header>
            <Offcanvas.Body className="px-0">
                <ListGroup variant="flush">
                    {
                        listItems.map(({href, text}, idx) => (
                            <ListGroup.Item action href={href} key={idx}>{text}</ListGroup.Item>)
                        )
                    }
                </ListGroup>
            </Offcanvas.Body>
        </Offcanvas>
    );
}

const loggedOutItems = () => [
    {
        href: '/login',
        text: 'Sign in',
    }
]

const loggedInItems = ({auth}) => [
    {
        href: '/',
        text: 'Home',
    },
    {
        href: '/gyms',
        text: 'Gyms',
    },
    {
        href: '/workouts',
        text: 'Workouts',
    },
    {
        href: `/stats?uids=${auth.uid}`,
        text: 'Stats',
    },
    {
        href: '/routeGallery',
        text: 'Routes'
    },
    {
        href: '/user',
        text: 'User Settings',
    },
]

export default Sidebar