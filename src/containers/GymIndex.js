import React, {Component, Fragment} from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import Button from 'react-bootstrap/Button'
import EntityModal from '../components/EntityModal'
import {gymFields} from '../templates/gymFields'
import Gym from '../components/Gym'
import {firebaseConnect, isLoaded} from 'react-redux-firebase'
import {getGymsForUser, getLatestSession, getSessionsForGym, getSessionsForUser} from '../helpers/filterUtils';

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

    handleNewGym(gym) {
        this.props.firebase.push('gyms', {...gym, owner: this.props.auth.uid})

        this.hideGymModal()
    }

    render() {
        const { auth: { uid }, users, gyms, sessions } = this.props

        if (!isLoaded(gyms, users)) return 'Loading'

        const gymsForUser = getGymsForUser(gyms, users, uid)
        const sessionsForUser = getSessionsForUser(sessions, uid);
        // Sort gyms according to latest sessions
        gymsForUser.sort((gymA, gymB) => getLatestTimeForGym(gymB, sessionsForUser) - getLatestTimeForGym(gymA, sessionsForUser))

        return (
            <Fragment>
                {gymsForUser.map((gym) => <Gym gym={gym} key={gym.key} sessions={getSessionsForGym(sessionsForUser, gym)}/>)}
                <br/>
                <div className="d-grid d-block mb-4">
                    <Button variant='primary' onClick={this.showGymModal}>
                        Add Gym
                    </Button>
                </div>
                <EntityModal show={this.state.showGymModal}
                             handleClose={this.hideGymModal}
                             handleSubmit={this.handleNewGym}
                             fields={gymFields}/>
            </Fragment>
        )
    }
}

const mapStateToProps = state => {
    return {
        users: state.firebase.ordered.users,
        gyms: state.firebase.ordered.gyms,
        sessions: state.firebase.ordered.sessions,
        auth: state.auth
    }
}

export default compose(
    firebaseConnect([
        { path: 'gyms' },
        { path: 'users' },
        { path: 'sessions' }
    ]),
    connect(mapStateToProps)
)(GymIndex)
