import {ListGroup, Offcanvas} from "react-bootstrap";
import React from "react";
import {connect} from "react-redux";

export const Sidebar = ({show, onHide, auth}) => {
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
        href: '/groups',
        text: 'User Settings',
    },
]

const mapStateToProps = state => {
    return {
        auth: state.auth
    }
}

export default connect(mapStateToProps)(Sidebar)