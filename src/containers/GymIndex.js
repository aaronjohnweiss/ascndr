import React, { Component, Fragment } from 'react'
import Gym from '../components/Gym'
import { connect } from 'react-redux'
import { addGym } from '../redux/actions'
import Button from 'react-bootstrap/Button'
import NewGymModal from '../components/NewGymModal'

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
                {this.props.gyms.map((gym, index) => <Gym key={gym.id} name={gym.name}/>)}
                <Button variant='primary' onClick={this.showModal.bind(this)}>
                    Add Gym
                </Button>

                <NewGymModal show={this.state.showModal}
                             handleClose={this.hideModal.bind(this)}
                             handleSubmit={this.handleNewGym.bind(this)}/>
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
