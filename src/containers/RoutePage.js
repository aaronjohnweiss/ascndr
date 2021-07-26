import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Button, Col, Container, Row } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import ConfirmCancelButton from '../components/ConfirmCancelButton'
import axios from 'axios'
import EntityModal from '../components/EntityModal'
import { routeUpdateFields } from '../templates/routeFields'
import { firebaseConnect, getVal, isLoaded } from 'react-redux-firebase'
import { compose } from 'redux'
import { prettyPrint } from '../helpers/gradeUtils'

export const PENDING_IMAGE = 'PENDING';
export const FAILED_IMAGE = 'FAILED';

export const uploadImage = (routeRef, picture) => {
    // Post to imgur
    const pictureData = new FormData()
    pictureData.set('album', process.env.REACT_APP_ALBUM_ID)
    pictureData.append('image', picture)
    const headers = {
        'Authorization': 'Client-ID ' + process.env.REACT_APP_CLIENT_ID,
        'Content-Type': 'multipart/form-data'
    }

    axios.post('https://api.imgur.com/3/image', pictureData, {headers: headers})
        .then(resp => {
            routeRef.update({picture: resp.data.data.link});
        })
        .catch(err => {
            if (err && err.response) console.log(err.response);
            else console.log(err);
            routeRef.update({picture: FAILED_IMAGE});
        });
}

class RoutePage extends Component {

    constructor(props) {
        super(props)
        this.state = {
            rotation: 0,
            showModal: false
        }

        this.updateRoute = this.updateRoute.bind(this)
        this.showModal = this.showModal.bind(this)
        this.hideModal = this.hideModal.bind(this)
        this.retireRoute = this.retireRoute.bind(this)
        this.handleRotate = this.handleRotate.bind(this)
        this.handleEditedRoute = this.handleEditedRoute.bind(this)
    }

    updateRoute(route) {
        this.props.firebase.update(`routes/${this.props.match.params.id}`, route)
    }

    showModal() {
        this.setState({ showModal: true })
    }

    hideModal() {
        this.setState({ showModal: false })
    }

    handleRotate() {
        this.setState({ rotation: this.state.rotation + 90 })
    }

    retireRoute() {
        const route = Object.assign({}, this.props.route)

        route.isRetired = true

        this.updateRoute(route)
    }

    handleEditedRoute(route) {
        if (route && route.picture && route.picture instanceof File) {


            this.hideModal()
            this.props.firebase.update(`routes/${this.props.match.params.id}`, {...route, picture: PENDING_IMAGE})
                .then(() => uploadImage(this.props.firebase.ref(`routes/${this.props.match.params.id}`), route.picture))
                .catch(err => {
                    console.log(err);
                })
        } else {
            this.updateRoute({ ...route })
            this.hideModal()
        }
    }

    render() {

        const { route, gyms } = this.props
        if (!isLoaded(route, gyms)) return 'Loading'
        if (!route) return 'Uh oh'

        const gym = gyms.find(gym => gym.key === route.gymId)

        const renderEditModal = () =>
            <EntityModal show={this.state.showModal}
                         handleClose={this.hideModal}
                         handleSubmit={this.handleEditedRoute}
                         fields={routeUpdateFields}
                         title='Edit route'
                         initialValues={{ ...route }}/>

        let RouteImageComponent;
        if (route.picture === FAILED_IMAGE) {
            RouteImageComponent = <p>(Image upload failed)</p>;
        } else if (route.picture === PENDING_IMAGE) {
            RouteImageComponent = <p>(Image upload in progress)</p>
        } else {
            RouteImageComponent = <img className='img-fluid' alt='' style={{transform: `rotate(${this.state.rotation}deg)`}}
                              src={route.picture} onClick={this.handleRotate} />;
        }

        return (
            <Container>
                <Row>
                    <Col md='2'/>
                    <Col md='8'>
                        <Row>
                            <Col xs={10}>
                                <h2>{route.name}
                                    <small className='text-muted'> @ <Link
                                        to={`/gyms/${route.gymId}`}>{gym.value.name}</Link>
                                    </small>
                                </h2>
                            </Col>
                            <Col xs={2}>
                                <Button onClick={this.showModal} style={{ float: 'right' }}>Edit</Button>
                            </Col>
                        </Row>
                        <h3>{prettyPrint(route.grade) + ' '}
                            <small>({route.color})</small>
                        </h3>
                        {route.isRetired && <h4>Retired</h4>}
                        {RouteImageComponent}
                        <p>{route.description}</p>
                        {!route.isRetired && (
                            <ConfirmCancelButton handleConfirm={this.retireRoute}
                                                 modalTitle='Retire route?'
                                                 modalBody='Retiring this route will prevent it from being added to any sessions.'
                                                 buttonText='Retire route'
                                                 buttonProps={{ variant: 'danger'}}
                                                 buttonBlock={true} />
                        )}
                        {this.state.showModal && renderEditModal()}
                    </Col>
                    <Col md='2'/>
                </Row>
            </Container>
        )
    }
}

const mapStateToProps = (state, props) => {
    return {
        route: getVal(state.firebase, `data/routes/${props.match.params.id}`),
        gyms: state.firebase.ordered.gyms
    }
}

export default compose(
    firebaseConnect([
        { path: 'routes' },
        { path: 'gyms' }
    ]),
    connect(mapStateToProps)
)(RoutePage)
