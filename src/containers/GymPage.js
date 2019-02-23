import React, { Component } from 'react'
import { connect } from 'react-redux'

class GymPage extends Component {

    render() {
        const { gyms, match } = this.props
        const { id } = match.params

        const gym = gyms.find(gym => gym.id === parseInt(id))

        if (!gym) return 'Uh oh'

        return (
            <div>
                <h2>{gym.name}</h2>
                <p>Location: {gym.location}</p>
                <p>Height: {gym.height} ft</p>
                <h3>Routes</h3>
            </div>

        )
    }
}

const mapStateToProps = state => {
    return {
        gyms: state.gyms
    }
}

const mapDispatchToProps = dispatch => {
    return {
        //
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(GymPage)
