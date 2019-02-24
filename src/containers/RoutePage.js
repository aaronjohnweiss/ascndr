import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Col, Container, Row } from 'react-bootstrap'
import { Link } from 'react-router-dom'

class RoutePage extends Component {

    constructor() {
        super()
        this.state = {
            rotation: 0
        }
    }

    handleRotate() {
        this.setState({ rotation: this.state.rotation += 90 })
    }

    render() {
        const { match } = this.props
        const id = Number(match.params.id)

        const route = this.props.routes.find(route => route.id === id)
        const gym = this.props.gyms.find(gym => gym.id === route.gymId)

        if (!route) return 'Bad route'

        return (

            <Container>
                <Row>
                    <Col md='2'/>
                    <Col md='8'>
                        <h2>{route.name}
                            <small class='text-muted'>@ <Link to={`/gyms/${gym.id}`}>{gym.name}</Link></small>
                        </h2>
                        <h3>{route.grade}
                            <small>({route.color})</small>
                        </h3>
                        <img className='img-fluid' style={{ transform: `rotate(${this.state.rotation}deg)` }}
                             src={route.picture} onClick={this.handleRotate.bind(this)}/>
                        <p>{route.description}</p>
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
    return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(RoutePage)
