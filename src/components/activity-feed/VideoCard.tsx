import React from 'react'
import { Route, RouteVideo } from '../../types/Route'
import { Data } from 'react-redux-firebase'
import { prettyPrint } from '../../helpers/gradeUtils'
import { Gym } from '../../types/Gym'
import { RoutePicture } from './RoutePicture'

interface Props {
  routeKey: string
  video: RouteVideo
  routes: Data<Route>
  gyms: Data<Gym>
}

export const VideoCardBody = ({ routeKey, video, routes, gyms }: Props) => {
  const route = routes[routeKey]
  const gym = route && gyms[route.gymId]
  const gymName = gym && gym.name
  const gymLocation = gym && gym.location

  return route === undefined ? (
    <>Unknown route</>
  ) : (
    <>
      <p>
        Climbed {route.name} ({prettyPrint(route.grade)}) - <b>{gymName}</b>
        {gymLocation && ` in ${gymLocation}`}
      </p>
      <a href={video.url} target="_blank" rel="noopener noreferrer">
        <RoutePicture route={route} />
        <div className="text-center">Watch video</div>
      </a>
    </>
  )
}
