import React from 'react'
import Features from '../components/Features'
import { Link } from 'react-router-dom'
import { Button } from 'react-bootstrap';

const GenericHome = () => {
    return (
        <>
            <h2>Climbing, tracked.</h2>
            <p>Welcome to ASCNDr. This is a small application designed to help record indoor climbing routes and
                sessions.</p>
            <Features />
            <Link to={'/login'}>
                <Button block>Get Started</Button>
            </Link>
            <br />
        </>
    )
}

export default GenericHome;