import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { signIn } from '../redux/actions';
import { FaGoogle } from 'react-icons/fa'
import { Button } from 'react-bootstrap';

const SignIn = ({signIn}) => {
    return (
        <Fragment>
            <h2>Sign in</h2>
            <h6 className='text-muted'>Welcome.</h6>
            <Button block href="#" className="social-signin" onClick={signIn}>
                <FaGoogle style={{marginTop: '-2px'}}/> Sign in with Google
            </Button>
        </Fragment>
    );
};

function mapStateToProps({ auth }) {
    return { auth };
}

export default connect(mapStateToProps, { signIn })(SignIn);