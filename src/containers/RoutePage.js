import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Col, Container, Row } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import ConfirmCancelButton from '../components/ConfirmCancelButton'
import { updateRoute } from '../redux/actions'

class RoutePage extends Component {

    constructor(props) {
        super(props)
        this.state = {
            rotation: 0
        }

        this.getRoute = this.getRoute.bind(this)
        this.retireRoute = this.retireRoute.bind(this)
        this.handleRotate = this.handleRotate.bind(this)
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

    render() {

        const route = this.getRoute()
        if (!route) return 'Uh oh'

        const gym = this.props.gyms.find(gym => gym.id === route.gymId)

        return (
            <Container>
                <Row>
                    <Col md='2'/>
                    <Col md='8'>
                        <h2>{route.name}
                            <small className='text-muted'> @ <Link to={`/gyms/${gym.id}`}>{gym.name}</Link></small>
                        </h2>
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
