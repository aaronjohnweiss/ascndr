import React, { Component } from 'react'
import { Card } from 'react-bootstrap'
import { Link } from 'react-router-dom'

class Gym extends Component {
    render() {
        let gym = this.props.gym
        const key = gym.key
        gym = gym.value

        return (
            <Card>
                <Card.Body>
                    <Card.Title>
                        <Link key={key} to={`/gyms/${key}`}>
                            {gym.name}
                        </Link>
                    </Card.Title>
                    <Card.Subtitle className='mb-2 text-muted'>
                        {gym.location}
                    </Card.Subtitle>

                </Card.Body>
            </Card>
        )
    }
}

export default Gym