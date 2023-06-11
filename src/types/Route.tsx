import {Grade} from "./Grade";

export interface RouteVideo {
    uid: string,
    url: string,
    date: number
}
export interface Route {
    color?: string
    description?: string
    grade: Grade
    gymId: string
    isRetired: boolean
    name: string
    setter?: string
    picture?: string
    videos?: RouteVideo[]
}