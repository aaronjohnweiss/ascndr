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
            <div className="d-grid d-block">
                <Button href="#" className="social-signin" onClick={signIn}>
                    <FaGoogle style={{marginTop: '-2px'}}/> Sign in with Google
                </Button>
            </div>
        </Fragment>
    );
};

function mapStateToProps({ auth }) {
    return { auth };
}

export default connect(mapStateToProps, { signIn })(SignIn);