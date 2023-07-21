import React from 'react'
import { Optional } from '../../redux/selectors/types'
import { SessionCardBody, SessionIcon } from './SessionCard'
import { toObj } from '../../helpers/objectConverters'
import { MilestoneCardBody, MilestoneIcon } from './MilestoneCard'
import { WorkoutCardBody } from './WorkoutCard'
import { VideoCardBody } from './VideoCard'
import { ProjectCardBody, ProjectIcon } from './ProjectCard'
import assertNever from 'assert-never'
import { Card, Col, Container, Row } from 'react-bootstrap'
import { findUser } from '../../helpers/filterUtils'
import { preciseTimeFromNow } from '../../helpers/dateUtils'
import { FeedItem } from '../../helpers/activityFeedBuilder'
import { OrderedList } from '../../types/Firebase'
import { Gym } from '../../types/Gym'
import { Session } from '../../types/Session'
import { User } from '../../types/User'
import { Route } from '../../types/Route'
import { Workout } from '../../types/Workout'
import { LinkContainer } from 'react-router-bootstrap'

interface Props {
  feedItem: FeedItem
  uid: string
  gyms: OrderedList<Gym>
  sessions: OrderedList<Session>
  users: OrderedList<User>
  routes: OrderedList<Route>
  workouts: OrderedList<Workout>
}
const FeedItemCard = ({ feedItem, uid, gyms, users, routes }: Props) => {
  let cardContent: JSX.Element
  let cardIcon: Optional<JSX.Element>
  switch (feedItem.data._type) {
    case 'session':
      cardContent = (
        <SessionCardBody session={feedItem.data.value} gyms={toObj(gyms)} routes={toObj(routes)} />
      )
      cardIcon = <SessionIcon session={feedItem.data.value} />
      break
    case 'milestone':
      cardContent = <MilestoneCardBody milestone={feedItem.data.value} />
      cardIcon = <MilestoneIcon />
      break
    case 'workout':
      cardContent = <WorkoutCardBody workout={feedItem.data.value} />
      break
    case 'video':
      cardContent = (
        <VideoCardBody
          routeKey={feedItem.data.value.routeKey}
          video={feedItem.data.value.video}
          routes={toObj(routes)}
          gyms={toObj(gyms)}
        />
      )
      break
    case 'project':
      cardContent = (
        <ProjectCardBody
          routeKey={feedItem.data.value.routeKey}
          project={feedItem.data.value.project}
          routes={toObj(routes)}
        />
      )
      cardIcon = <ProjectIcon />
      break
    default:
      assertNever(feedItem.data)
  }
  const card = (
    <Card>
      <Card.Body>
        <Container>
          <Row>
            <Col xs={10}>
              <Card.Title className={'w-100'}>
                {uid === feedItem.uid ? 'You' : findUser(users, feedItem.uid).name}
              </Card.Title>
              <Card.Subtitle>{preciseTimeFromNow(feedItem.date)}</Card.Subtitle>
            </Col>
            {cardIcon !== undefined && (
              <Col xs={2} className={'d-flex flex-row justify-content-end'}>
                {cardIcon}
              </Col>
            )}
          </Row>
        </Container>
        <Card.Text as={'div'}>{cardContent}</Card.Text>
      </Card.Body>
    </Card>
  )
  return feedItem.link !== undefined ? (
    <LinkContainer to={feedItem.link} className="link-card">
      {card}
    </LinkContainer>
  ) : (
    card
  )
}

export default FeedItemCard
