import {Grade} from "./Grade";

export interface RouteCount<KeyType> {
    count: number
    key: KeyType
    partials: Record<number, number>
}

export interface Session {
    uid: string
    gymId: string
    startTime: number
    endTime?: number
    customRoutes: RouteCount<string>[]
    standardRoutes: RouteCount<Grade>[]
}

