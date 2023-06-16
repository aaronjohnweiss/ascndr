import {Grade} from "./Grade";


export type PartialCount = Record<number, number>
export interface RouteCount<KeyType> {
    count: number
    key: KeyType
    partials: PartialCount
}

export interface Session {
    uid: string
    gymId: string
    startTime: number
    endTime?: number
    customRoutes: RouteCount<string>[]
    standardRoutes: RouteCount<Grade>[]
}

export type FirebaseSession = Pick<Session, 'uid' | 'gymId' | 'startTime'> & Partial<Session>

export const defaultSession = (part: FirebaseSession): Session => ({
    customRoutes: [],
    standardRoutes: [],
    ...part
})
