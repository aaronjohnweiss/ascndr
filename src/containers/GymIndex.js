import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { addGym } from '../redux/actions'
import Button from 'react-bootstrap/Button'
import EntityModal from '../components/EntityModal'
import { gymFields } from '../templates/gymFields'
import Gym from '../components/Gym'
import ListModal from '../components/ListModal'

class GymIndex extends Component {
    constructor(props) {
        super(props)

        this.state = {
            showGroupModal: false,
            showGymModal: false
        }

        this.showGroupModal = this.showGroupModal.bind(this)
        this.hideGroupModal = this.hideGroupModal.bind(this)
        this.showGymModal = this.showGymModal.bind(this)
        this.hideGymModal = this.hideGymModal.bind(this)
        this.transitionModals = this.transitionModals.bind(this)
        this.handleNewGym = this.handleNewGym.bind(this)
    }

    showGroupModal() {
        this.setState({ showGroupModal: true })
    }

    hideGroupModal() {
        this.setState({ showGroupModal: false })
        this.setState({ newGym: undefined })
    }

    showGymModal() {
        this.setState({ showGymModal: true })
    }

    hideGymModal() {
        this.setState({ showGymModal: false })
    }

    transitionModals(gym) {
        // Store in the state and then show next modal
        this.setState({ newGym: gym })

        // Not giving enough time for gym modal to close causes scroll bug
        // Hacky solution, needs proper promise / callback solution
        this.hideGymModal()
        setTimeout(() => {
            this.showGroupModal()
        }, 250);
    }

    handleNewGym(groupId) {
        const { newGym } = this.state
        newGym.groupId = groupId
        this.props.addGym(newGym)
        this.hideGroupModal()
    }

    render() {

        const { uid } = this.props.auth
        const groups = this.props.groups.filter(group => group.users.includes(uid))
        const groupIds = groups.map(group => group.id)
        const gyms = this.props.gyms.filter(gym => groupIds.includes(gym.groupId))

        const groupFormOptions = groups.map(({ id, name }) => ({ id, label: name }))

        return (
            <Fragment>
                {gyms.map((gym) => <Gym {...gym} key={gym.id}/>)}
                <br/>
                <Button variant='primary' block={true} onClick={this.showGymModal}>
                    Add Gym
                </Button>

                <EntityModal show={this.state.showGymModal}
                             handleClose={this.hideGymModal}
                             handleSubmit={this.transitionModals}
                             fields={gymFields}
                             submitText='Next'/>

                <ListModal show={this.state.showGroupModal}
                           handleClose={this.hideGroupModal}
                           title='Select group for new gym'
                           listContent={groupFormOptions}
                           handleSubmit={this.handleNewGym}
                />
            </Fragment>
        )
    }
}

const mapStateToProps = state => {
    return {
        groups: state.groups,
        gyms: state.gyms,
        auth: state.auth
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
