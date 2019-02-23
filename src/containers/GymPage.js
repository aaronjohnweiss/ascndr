import React, { Component } from 'react'
import { connect } from 'react-redux'

class GymPage extends Component {

    render() {
        const { gyms, match } = this.props
        const id = Number(match.params.id)

        const gym = gyms.find(gym => gym.id === id)

        if (!gym) return 'Uh oh'

        // Filter to only routes for this gym
        const routes = this.props.routes.filter(route => route.gymId === id)

        return (
            <div>
                <h2>{gym.name}</h2>
                <p>Location: {gym.location}</p>
                <p>Height: {gym.height} ft</p>
                <h3>Routes</h3>
                {routes.map(route => (
                    <p>{route.name}</p>
                ))}
            </div>

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
        //
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(GymPage)
