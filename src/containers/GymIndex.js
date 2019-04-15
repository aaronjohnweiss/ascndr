import React, { Component, Fragment } from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import Button from 'react-bootstrap/Button'
import EntityModal from '../components/EntityModal'
import { gymFields } from '../templates/gymFields'
import Gym from '../components/Gym'
import ListModal from '../components/ListModal'
import { firebaseConnect, isEmpty, isLoaded } from 'react-redux-firebase'

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
        this.hideGymModal()
        this.showGroupModal()
    }

    handleNewGym(groupId) {
        const { newGym } = this.state
        newGym.groupId = groupId
        this.props.firebase.push('gyms', newGym)
        this.hideGroupModal()
    }

    render() {
        const { auth: { uid }, groups, gyms } = this.props

        if (!isLoaded(gyms, groups)) return 'Loading'

        const groupsForUser = isEmpty(groups) ? [] : groups.filter(group => group.value.users.includes(uid))
        const groupIds = groupsForUser.map(group => group.key)
        const gymsForGroups = isEmpty(gyms) ? [] : gyms.filter(gym => groupIds.includes(gym.value.groupId))

        const groupFormOptions = groupsForUser.map(({ key, value }) => ({ id: key, label: value.name }))

        return (
            <Fragment>
                {gymsForGroups.map((gym) => <Gym gym={gym} key={gym.key}/>)}
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
        groups: state.firebase.ordered.groups,
        gyms: state.firebase.ordered.gyms,
        auth: state.auth
    }
}

export default compose(
    firebaseConnect([
        { path: 'gyms' },
        { path: 'groups' }
    ]),
    connect(mapStateToProps)
)(GymIndex)
