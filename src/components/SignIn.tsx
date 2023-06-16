import React, {Fragment} from 'react';
import {signIn} from '../redux/actions';
import {FaGoogle} from 'react-icons/fa'
import {Button} from 'react-bootstrap';
import {useHistory} from "react-router";
import {useAppSelector} from "../redux";

const SignIn = () => {
    const history = useHistory()
    const auth = useAppSelector(state => state.auth)

    if (auth) {

        history.push('/')
    }

    return (
        <Fragment>
            <h2>Sign in</h2>
            <h6 className='text-muted'>Welcome.</h6>
            <div className="d-grid d-block">
                <Button href="#" className="social-signin" onClick={signIn}>
                    <FaGoogle style={{marginTop: '-2px'}}/> Sign in with Google
                </Button>
            </div>
        </Fragment>
    );
};

export default SignIn