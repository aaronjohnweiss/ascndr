import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { Button, Col, ListGroup, Row } from 'react-bootstrap'
import EntityModal from '../components/EntityModal'
import { updateGroupFields } from '../templates/groupFields'
import ConfirmCancelButton from '../components/ConfirmCancelButton'
import { firebaseConnect, getVal, isLoaded } from 'react-redux-firebase'
import { compose } from 'redux'
import resolveUsers from '../helpers/resolveUsers'

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
        const { group, users } = this.props;

        if (!isLoaded(group) || !isLoaded(users)) return 'Loading';
        if (!group) return 'Uh oh';

        const usersForGroup = resolveUsers(users, group.users);

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
                    {usersForGroup.map(user =>
                        <ListGroup.Item key={user.uid}>
                            <Row className="m-0 align-items-center">
                                <Col className="text-truncate">
                                    {user.name}
                                </Col>
                                <Col xs="auto">
                             <ConfirmCancelButton handleConfirm={() => this.removeGroupMember(user.uid)}
                                                        modalTitle='Remove User'
                                                        modalBody={`Remove user ${user.name} from the group?`}
                                                        buttonText='Remove'
                                                        buttonBlock={true}
                             />
                                </Col>
                            </Row>
                        </ListGroup.Item>
                    )}
                </ListGroup>

                <br/>
                <div className="d-grid d-block">
                    <Button variant='primary' onClick={this.showModal}>
                        Add Member
                    </Button>
                </div>
                {this.state.showModal && newUserModal()}
            </Fragment>
        )
    }
}

const mapStateToProps = (state, props) => {
    return {
        group: getVal(state.firebase, `data/groups/${props.match.params.id}`),
        users: state.firebase.data.users,
        auth: state.auth
    }
}

export default compose(
    firebaseConnect([
        { path: 'groups' },
        { path: 'users' }
    ]),
    connect(mapStateToProps)
)(GroupPage)
