import React from 'react'
import {Card} from 'react-bootstrap'

const Workout = ({workout}) => (
        <Card>
            <Card.Body>
                <Card.Title>
                    {new Date(workout.startTime).toDateString()}
                </Card.Title>
                <Card.Subtitle className="mb-2 text-muted">
                    Intensity: {workout.intensity}
                </Card.Subtitle>
                <Card.Text>
                    {workout.categories.join(', ')}
                </Card.Text>
            </Card.Body>
        </Card>
    )

export default Workout