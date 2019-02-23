import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { addGym } from '../redux/actions'
import Button from 'react-bootstrap/Button'
import NewEntityModal from '../components/NewEntityModal'
import { Link } from 'react-router-dom'
import { gymFields } from '../templates/gymFields'
import Gym from '../components/Gym'
import Col from 'react-bootstrap/Col'

class GymIndex extends Component {
    constructor(props) {
        super(props)

        this.state = {
            showModal: false
        }
    }

    showModal() {
        this.setState({ showModal: true })
    }

    hideModal() {
        this.setState({ showModal: false })
    }

    handleNewGym(gym) {
        this.props.addGym(gym)
        this.hideModal()
    }

    render() {
        return (
            <Fragment>
                <Col>
                    {this.props.gyms.map((gym) => <Gym {...gym} />)}
                    <br/>
                    <Button variant='primary' block={true} onClick={this.showModal.bind(this)}>
                        Add Gym
                    </Button>

                <NewEntityModal show={this.state.showModal}
                                handleClose={this.hideModal.bind(this)}
                                handleSubmit={this.handleNewGym.bind(this)}
                                fields={gymFields}/>
                </Col>
            </Fragment>
        )
    }
}

const mapStateToProps = state => {
    return {
        gyms: state.gyms
    }
}

const mapDispatchToProps = dispatch => {
    return {
        addGym: (gym) => {
            dispatch(addGym(gym))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(GymIndex)
