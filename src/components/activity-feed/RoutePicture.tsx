import React from 'react'
import {Route} from "../../types/Route";
import {BAD_IMAGE} from "../../containers/RoutePage";
import {Image} from "react-bootstrap";

export const RoutePicture = ({route}: {route?: Route}) => route && route.picture && !BAD_IMAGE.includes(route.picture) &&
<Image fluid className='d-block mx-auto' src={route.picture}/> || <></>