import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import Button from 'react-bootstrap/Button'
import EntityModal from '../components/EntityModal'
import { Link } from 'react-router-dom'
import { ListGroup } from 'react-bootstrap'
import { groupFields } from '../templates/groupFields'
import { compose } from 'redux'
import { firebaseConnect, isEmpty, isLoaded } from 'react-redux-firebase'

class GroupIndex extends Component {
    constructor(props) {
        super(props)

        this.state = {
            showModal: false
        }

        this.showModal = this.showModal.bind(this)
        this.hideModal = this.hideModal.bind(this)
        this.handleNewGroup = this.handleNewGroup.bind(this)
    }

    showModal() {
        this.setState({ showModal: true })
    }

    hideModal() {
        this.setState({ showModal: false })
    }

    handleNewGroup(group) {
        this.props.firebase.push('groups', { ...group, users: [this.props.auth.uid] })
        this.hideModal()
    }

    render() {
        const { auth: { uid }, groups } = this.props

        if (!isLoaded(groups)) return 'Loading'

        const groupsForUser = isEmpty(groups) ? [] : groups.filter(group => group.value.users.includes(uid))
        return (
            <Fragment>
                <p>Your uid: <b>{uid}</b></p>
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
                <Button variant='primary' block={true} onClick={this.showModal}>
                    Add Group
                </Button>

                <EntityModal show={this.state.showModal}
                             handleClose={this.hideModal}
                             handleSubmit={this.handleNewGroup}
                             fields={groupFields}/>
            </Fragment>
        )
    }
}

const mapStateToProps = state => {
    return {
        groups: state.firebase.ordered.groups,
        auth: state.auth
    }
}

export default compose(
    firebaseConnect([
        { path: 'groups' }
    ]),
    connect(mapStateToProps)
)(GroupIndex)