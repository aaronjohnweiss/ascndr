import React from 'react'
import {Route} from "../../types/Route";
import {Data} from "react-redux-firebase";
import {prettyPrint} from "../../helpers/gradeUtils";
import {Project} from "../RoutesIndex";
import {pluralize} from "../../helpers/mathUtils";
import {RoutePicture} from "./RoutePicture";
import {IconContext} from "react-icons";
import {FaVolcano} from "react-icons/fa6";
import {defaultIconContext, iconColors} from "./iconStyle";

interface Props {
    routeKey: string,
    project: Project,
    routes: Data<Route>
}

export const ProjectCard = ({routeKey, project, routes}: Props) => {
    const route = routes[routeKey]

    return (
        route === undefined ? <>Unknown route</> :
            <>
                <p>
                    Climbed {route.name} ({prettyPrint(route.grade)}) for the first time! <br />
                    Projected for {project.sessionCount} {pluralize('session', project.sessionCount)}.
                </p>
                <RoutePicture route={route} />
            </>
    )
}

export const ProjectIcon = () =>
    <IconContext.Provider value={{...defaultIconContext, color: iconColors.success}}>
        <FaVolcano/>
    </IconContext.Provider>