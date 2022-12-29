import React, {Component, Fragment} from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import Button from 'react-bootstrap/Button'
import EntityModal from '../components/EntityModal'
import {gymFields} from '../templates/gymFields'
import Gym from '../components/Gym'
import ListModal from '../components/ListModal'
import {firebaseConnect, isLoaded} from 'react-redux-firebase'
import {
    getGroupsForUser,
    getGymsForGroups,
    getLatestSession,
    getSessionsForGym,
    getSessionsForUser
} from '../helpers/filterUtils';
import {Link} from 'react-router-dom';

const getLatestTimeForGym = (gym, sessions) => {
    const latest = getLatestSession(getSessionsForGym(sessions, gym));
    return latest ? latest.value.startTime : 0;
}

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
        this.props.firebase.push('gyms', newGym)
        this.hideGroupModal()
    }

    render() {
        const { auth: { uid }, groups, gyms, sessions } = this.props

        if (!isLoaded(gyms, groups)) return 'Loading'

        const groupsForUser = getGroupsForUser(groups, uid);
        const gymsForGroups = getGymsForGroups(gyms, groupsForUser);
        const sessionsForUser = getSessionsForUser(sessions, uid);
        // Sort gyms according to latest sessions
        gymsForGroups.sort((gymA, gymB) => getLatestTimeForGym(gymB, sessionsForUser) - getLatestTimeForGym(gymA, sessionsForUser))

        const groupFormOptions = groupsForUser.map(({ key, value }) => ({ id: key, label: value.name }))

        if (!groupsForUser || !groupsForUser.length) {
            return (
                <>
                    <p>
                        Gyms must be associated with a group, but you are not currently part of any groups.
                    </p>
                    <p>
                        <Link to='/user'>Click here</Link> to manage your user; either create a group,
                        or share your uid with someone to have them add you to a group.
                    </p>
            </>
            )
        }
        return (
            <Fragment>
                {gymsForGroups.map((gym) => <Gym gym={gym} key={gym.key} sessions={getSessionsForGym(sessionsForUser, gym)}/>)}
                <br/>
                <div className="d-grid d-block mb-4">
                    <Button variant='primary' onClick={this.showGymModal}>
                        Add Gym
                    </Button>
                </div>
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
        sessions: state.firebase.ordered.sessions,
        auth: state.auth
    }
}

export default compose(
    firebaseConnect([
        { path: 'gyms' },
        { path: 'groups' },
        { path: 'sessions' }
    ]),
    connect(mapStateToProps)
)(GymIndex)
