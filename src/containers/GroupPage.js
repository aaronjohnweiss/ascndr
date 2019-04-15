import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { Button, ListGroup } from 'react-bootstrap'
import EntityModal from '../components/EntityModal'
import { updateGroupFields } from '../templates/groupFields'
import ConfirmCancelButton from '../components/ConfirmCancelButton'
import { firebaseConnect, getVal, isLoaded } from 'react-redux-firebase'
import { compose } from 'redux'

class GroupPage extends Component {
    constructor(props) {
        super(props)

        this.state = {
            showModal: false
        }
        this.showModal = this.showModal.bind(this)
        this.hideModal = this.hideModal.bind(this)
        this.addGroupMember = this.addGroupMember.bind(this)
        this.removeGroupMember = this.removeGroupMember.bind(this)
    }

    showModal() {
        this.setState({ showModal: true })
    }

    hideModal() {
        this.setState({ showModal: false })
    }

    addGroupMember({ uid }) {
        let group = Object.assign({}, this.props.group)
        group.users = [...group.users, uid]

        this.props.firebase.update(`groups/${this.props.match.params.id}`, group)
        this.hideModal()
    }

    removeGroupMember(uid) {
        let group = Object.assign({}, this.props.group)
        group.users = [...group.users].filter(user => user !== uid)

        this.props.firebase.update(`groups/${this.props.match.params.id}`, group)
    }

    render() {
        const { auth: { uid }, group } = this.props

        if (!isLoaded(group)) return 'Loading'
        if (!group) return 'Uh oh'

        const users = [...group.users]

        const newUserModal = () =>
            <EntityModal show={this.state.showModal}
                         handleClose={this.hideModal}
                         handleSubmit={this.addGroupMember}
                         fields={updateGroupFields}
                         title='Add User'
            />
        return (
            <Fragment>
                <h2>{group.name}</h2>
                <h3>Members</h3>

                <ListGroup>
                    {users.map(user =>
                        <ListGroup.Item key={user} style={{ lineHeight: '38px' }}>
                            {user} <ConfirmCancelButton handleConfirm={() => this.removeGroupMember(user)}
                                                        modalTitle='Remove User'
                                                        modalBody={`Remove user ${user} from the group?`}
                                                        buttonText='Remove'
                                                        buttonProps={{ style: { float: 'right' } }}/>
                        </ListGroup.Item>
                    )}
                </ListGroup>

                <br/>
                <Button variant='primary' block={true} onClick={this.showModal}>
                    Add Member
                </Button>

                {this.state.showModal && newUserModal()}
            </Fragment>
        )
    }
}

const mapStateToProps = (state, props) => {
    return {
        group: getVal(state.firebase, `data/groups/${props.match.params.id}`),
        auth: state.auth
    }
}

export default compose(
    firebaseConnect([
        { path: 'groups' },
    ]),
    connect(mapStateToProps)
)(GroupPage)
