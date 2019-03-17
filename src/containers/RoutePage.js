import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Button, Col, Container, Row } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import ConfirmCancelButton from '../components/ConfirmCancelButton'
import { updateRoute } from '../redux/actions'
import axios from 'axios'
import EntityModal from '../components/EntityModal'
import { routeUpdateFields } from '../templates/routeFields'

class RoutePage extends Component {

    constructor(props) {
        super(props)
        this.state = {
            rotation: 0,
            showModal: false
        }

        this.showModal = this.showModal.bind(this)
        this.hideModal = this.hideModal.bind(this)
        this.getRoute = this.getRoute.bind(this)
        this.retireRoute = this.retireRoute.bind(this)
        this.handleRotate = this.handleRotate.bind(this)
        this.handleEditedRoute = this.handleEditedRoute.bind(this)
    }

    showModal() {
        this.setState({ showModal: true })
    }

    hideModal() {
        this.setState({ showModal: false })
    }

    getRoute() {
        return this.props.routes.find(route => route.id === Number(this.props.match.params.id))
    }

    handleRotate() {
        this.setState({ rotation: this.state.rotation + 90 })
    }

    retireRoute() {
        const route = Object.assign({}, this.getRoute())

        route.isRetired = true

        this.props.updateRoute(route)
    }

    handleEditedRoute(route) {
        if (route && route.picture && route.picture instanceof File) {
            // Post to imgur
            const pictureData = new FormData()
            pictureData.set('album', process.env.REACT_APP_ALBUM_ID)
            pictureData.append('image', route.picture)
            const headers = {
                'Authorization': 'Client-ID ' + process.env.REACT_APP_CLIENT_ID,
                'Content-Type': 'multipart/form-data'
            }

            axios.post('https://api.imgur.com/3/image', pictureData, { headers: headers })
                .then(resp => {
                    this.props.updateRoute({
                        ...route,
                        picture: resp.data.data.link,
                    })
                    this.hideModal()
                }).catch(err => {
                console.log(err.response)
            })
        } else {
            this.props.updateRoute({ ...route })
            this.hideModal()
        }
    }

    render() {

        const route = this.getRoute()
        if (!route) return 'Uh oh'

        const gym = this.props.gyms.find(gym => gym.id === route.gymId)

        const renderEditModal = () =>
            <EntityModal show={this.state.showModal}
                         handleClose={this.hideModal}
                         handleSubmit={this.handleEditedRoute}
                         fields={routeUpdateFields}
                         title='Edit route'
                         initialValues={{ ...route }}/>

        return (
            <Container>
                <Row>
                    <Col md='2'/>
                    <Col md='8'>
                        <Row>
                            <Col xs={10}>
                                <h2>{route.name}
                                    <small className='text-muted'> @ <Link to={`/gyms/${gym.id}`}>{gym.name}</Link>
                                    </small>
                                </h2>
                            </Col>
                            <Col xs={2}>
                                <Button onClick={this.showModal} style={{ float: 'right' }}>Edit</Button>
                            </Col>
                        </Row>
                        <h3>{route.grade}
                            <small>({route.color})</small>
                        </h3>
                        {route.isRetired && <h4>Retired</h4>}
                        <img className='img-fluid' style={{ transform: `rotate(${this.state.rotation}deg)` }}
                             src={route.picture} onClick={this.handleRotate}/>
                        <p>{route.description}</p>
                        {!route.isRetired && (
                            <ConfirmCancelButton handleConfirm={this.retireRoute}
                                                 modalTitle='Retire route?'
                                                 modalBody='Retiring this route will prevent it from being added to any sessions.'
                                                 buttonText='Retire route'
                                                 buttonProps={{ variant: 'danger', block: true }}/>
                        )}
                        {this.state.showModal && renderEditModal()}
                    </Col>
                    <Col md='2'/>
                </Row>
            </Container>
        )
    }
}

const mapStateToProps = state => {
    return {
        gyms: state.gyms,
        routes: state.routes
    }
}

const mapDispatchToProps = dispatch => {
    return {
        updateRoute: (route) => {
            dispatch(updateRoute(route))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(RoutePage)
