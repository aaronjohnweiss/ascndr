import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { addGroup } from '../redux/actions'
import Button from 'react-bootstrap/Button'
import EntityModal from '../components/EntityModal'
import { Link } from 'react-router-dom'
import { ListGroup } from 'react-bootstrap'
import { groupFields } from '../templates/groupFields'

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
        this.props.addGroup({...group, users: [this.props.auth.uid]})
        this.hideModal()
    }

    render() {
        console.log(this.props.auth)
        const { uid } = this.props.auth

        const groups = this.props.groups.filter(group => group.users.includes(uid))
        return (
            <Fragment>
                <p>Your uid: <b>{uid}</b></p>
                <ListGroup>
                    {groups.map(group => (
                        <Link to={`/groups/${group.id}`} style={{ textDecoration: 'none' }} key={group.id}>
                            <ListGroup.Item action>
                                {group.name}
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
        groups: state.groups,
        auth: state.auth
    }
}

const mapDispatchToProps = dispatch => {
    return {
        addGroup: (group) => {
            dispatch(addGroup(group))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(GroupIndex)
