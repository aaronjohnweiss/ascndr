import {Grade} from "./Grade";

export interface Route {
    color?: string
    description?: string
    grade?: Grade
    gymId: string
    isRetired: boolean
    name: string
    picture?: string
}