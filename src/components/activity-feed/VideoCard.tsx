import React from 'react'
import {Route, RouteVideo} from "../../types/Route";
import {Data} from "react-redux-firebase";
import {prettyPrint} from "../../helpers/gradeUtils";
import {Gym} from "../../types/Gym";
import {BAD_IMAGE} from "../../containers/RoutePage";
import {Image} from "react-bootstrap";

interface Props {
    routeKey: string,
    video: RouteVideo,
    routes: Data<Route>
    gyms: Data<Gym>
}

export const VideoCard = ({routeKey, video, routes, gyms}: Props) => {
    const route = routes[routeKey]
    const gym = route && gyms[route.gymId]
    const gymName = gym && gym.name
    const gymLocation = gym && gym.location

    return (
        route === undefined ? <>Unknown route</> :
            <>
                <p>
                    Climbed {route.name} ({prettyPrint(route.grade)}) - <b>{gymName}</b>
                    {gymLocation && ` in ${gymLocation}`}
                </p>
                <a href={video.url} target='_blank' rel="noopener noreferrer">
                    {route && route.picture && !BAD_IMAGE.includes(route.picture) &&
                        <Image fluid className='d-block mx-auto' src={route.picture}/>}
                    <div className='text-center'>Watch video</div>
                </a>
            </>
    )
}
