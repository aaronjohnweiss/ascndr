import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import Button from 'react-bootstrap/Button'
import EntityModal from '../components/EntityModal'
import { Link } from 'react-router-dom'
import { ListGroup } from 'react-bootstrap'
import { groupFields, userFields } from '../templates/groupFields'
import { compose } from 'redux'
import { firebaseConnect, isEmpty, isLoaded } from 'react-redux-firebase'

class GroupIndex extends Component {
    constructor(props) {
        super(props)

        this.state = {
            showGroupModal: false,
            showUserModal: false
        }

        this.showGroupModal = this.showGroupModal.bind(this)
        this.hideGroupModal = this.hideGroupModal.bind(this)
        this.handleNewGroup = this.handleNewGroup.bind(this)

        this.showUserModal = this.showUserModal.bind(this)
        this.hideUserModal = this.hideUserModal.bind(this)
        this.handleUserUpdate = this.handleUserUpdate.bind(this)
    }

    showGroupModal() {
        this.setState({ showGroupModal: true })
    }

    hideGroupModal() {
        this.setState({ showGroupModal: false })
    }

    handleNewGroup(group) {
        this.props.firebase.push('groups', { ...group, users: [this.props.auth.uid] })
        this.hideGroupModal()
    }

    showUserModal() {
        this.setState({ showUserModal: true })
    }

    hideUserModal() {
        this.setState({ showUserModal: false })
    }

    handleUserUpdate(user) {
        const { auth: { uid }, users } = this.props;
        const userInfo = isEmpty(users) ? undefined : users.find(user => user.value.uid === uid);

        const data = {uid, ...user};
        if (userInfo) {
            const userId = userInfo.key;
            this.props.firebase.update(`users/${userId}`, data);
        } else {
            this.props.firebase.push('users', data);
        }
        this.hideUserModal();
    }

    render() {
        const { auth: { uid }, groups, users, all } = this.props

        if (!isLoaded(groups) || !isLoaded(users)) return 'Loading'

        const groupsForUser = isEmpty(groups) ? [] : groups.filter(group => group.value.users.includes(uid))

        const userInfo = isEmpty(users) ? undefined : users.find(user => user.value.uid === uid)

        const userName = userInfo && userInfo.value.name || uid;

        return (
            <Fragment>
                <p>Your uid: <b>{uid}</b></p>
                <p>Your display name: <b>{userName}</b> <Button onClick={this.showUserModal}>Edit</Button></p>
                <ListGroup>
                    {groupsForUser.map(group => (
                        <Link to={`/groups/${group.key}`} style={{ textDecoration: 'none' }} key={group.key}>
                            <ListGroup.Item action>
                                {group.value.name}
                            </ListGroup.Item>
                        </Link>
                    ))}
                </ListGroup>
                <br/>
                <Button variant='primary' block={true} onClick={this.showGroupModal}>
                    Add Group
                </Button>

                <EntityModal show={this.state.showGroupModal}
                             handleClose={this.hideGroupModal}
                             handleSubmit={this.handleNewGroup}
                             fields={groupFields}/>

                 <EntityModal show={this.state.showUserModal}
                              handleClose={this.hideUserModal}
                              handleSubmit={this.handleUserUpdate}
                              fields={userFields}
                              initialValues={{...userInfo.value}}/>
            </Fragment>
        )
    }
}

const mapStateToProps = state => {
    return {
        groups: state.firebase.ordered.groups,
        users: state.firebase.ordered.users,
        auth: state.auth
    }
}

export default compose(
    firebaseConnect([
        { path: 'groups' },
        { path: 'users' }
    ]),
    connect(mapStateToProps)
)(GroupIndex)