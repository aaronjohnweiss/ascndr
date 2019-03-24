import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { Button, ListGroup } from 'react-bootstrap'
import EntityModal from '../components/EntityModal'
import { updateGroup } from '../redux/actions'
import { updateGroupFields } from '../templates/groupFields'
import ConfirmCancelButton from '../components/ConfirmCancelButton'

class GroupPage extends Component {
    constructor(props) {
        super(props)

        this.state = {
            showModal: false
        }
        this.getGroup = this.getGroup.bind(this)
        this.showModal = this.showModal.bind(this)
        this.hideModal = this.hideModal.bind(this)
        this.addGroupMember = this.addGroupMember.bind(this)
        this.removeGroupMember = this.removeGroupMember.bind(this)
    }

    getGroup() {
        return this.props.groups.find(group => group.id === Number(this.props.match.params.id))
    }

    showModal() {
        this.setState({ showModal: true })
    }

    hideModal() {
        this.setState({ showModal: false })
    }

    addGroupMember({ uid }) {
        let group = Object.assign({}, this.getGroup())
        group.users = [...group.users, uid]

        this.props.updateGroup(group)
        this.hideModal()
    }

    removeGroupMember(uid) {
        let group = Object.assign({}, this.getGroup())
        group.users = [...group.users].filter(user => user !== uid)

        this.props.updateGroup(group)
    }

    render() {
        const group = this.getGroup()
        if (!group) return 'Uh oh'

        const { uid } = this.props.auth

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


const mapStateToProps = state => {
    return {
        groups: state.groups,
        auth: state.auth
    }
}

const mapDispatchToProps = dispatch => {
    return {
        updateGroup: (gym) => {
            dispatch(updateGroup(gym))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(GroupPage)
