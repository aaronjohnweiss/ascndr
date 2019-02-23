import React, { Component } from 'react'
import { Card } from 'react-bootstrap'
import { Link } from 'react-router-dom'

class Gym extends Component {
    render() {
        return (

            <Card>
                <Card.Body>
                    <Card.Title>
                        <Link key={this.props.id} to={`/gyms/${this.props.id}`}>
                            {this.props.name}
                        </Link>
                    </Card.Title>
                    <Card.Subtitle className='mb-2 text-muted'>
                        {this.props.location}
                    </Card.Subtitle>
                    <Card.Text>

                    </Card.Text>
                </Card.Body>
                <Card.Footer>
                    <small className='text-muted'> Average Wall Height: {this.props.height} ft.</small>
                </Card.Footer>
            </Card>
        )
    }
}

export default Gym