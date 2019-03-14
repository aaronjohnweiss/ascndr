import React, {Component, Fragment} from "react";
import { connect } from "react-redux";
import { signIn } from "../redux/actions";
import {FaGoogle} from 'react-icons/fa'
import {Button} from "react-bootstrap";

class SignIn extends Component {

    componentWillUpdate(nextProps) {
        if (nextProps.auth) {
            this.context.router.history.push("/app");
        }
    }

    render() {
        return (
            <Fragment>
                <h2>Sign in</h2>
                <h6 className='text-muted'>Welcome.</h6>
                <Button block href="#" className="social-signin" onClick={this.props.signIn}>
                    <FaGoogle style={{marginTop: '-2px'}}/> Sign in with Google
                </Button>
            </Fragment>
        );
    }
}

function mapStateToProps({ auth }) {
    return { auth };
}

export default connect(mapStateToProps, { signIn })(SignIn);