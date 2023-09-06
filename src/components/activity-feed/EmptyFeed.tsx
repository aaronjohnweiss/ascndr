import React from 'react'
import { Card, Col, Container, Row } from 'react-bootstrap'
import { Link } from 'react-router-dom'

export const EmptyFeed = () => {
  return (
    <Container id={'activity-feed-empty'}>
      <Row>
        <Col xs={12}>
          <Card className="empty">
            <h3 className="lead text-center">Activity Feed</h3>
            <p>
              Sorry, there are no records available. To populate your activity feed, you have the
              option to:
            </p>
            <ul>
              <li>
                Visit your <Link to="/gyms">Gyms</Link> to create a home for your climbing sessions
              </li>
              <li>
                Visit your <Link to="/workouts">Workouts</Link> to log a workout.
              </li>
              <li>
                Visit your <Link to="/user">User Settings</Link> to add friends and view their
                activity!
              </li>
            </ul>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}
