export interface Hiatus {
    endDate: number
    startDate: number
}

export const CalendarMode = {
    USER_ONLY: 'User only',
    FRIENDS: 'Include friends',
} as const

export interface ActivityCalendarPreferences {
    friends: string[]
    includeWorkouts: boolean
    mode: typeof CalendarMode[keyof typeof CalendarMode]
    splitWorkouts: boolean
}

export interface UserPreferences {
    activityCalendar: ActivityCalendarPreferences
}

export interface User {
    name?: string
    friends: string[]
    hiatuses: Hiatus[]
    preferences: UserPreferences
    uid: string
}

export type FirebaseUser = Pick<User, 'uid'> & Partial<User>

export const defaultUser = (part: FirebaseUser): User => ({
    friends: [],
    hiatuses: [],
    preferences: {
        activityCalendar: defaultActivityCalendarPreferences()
    },
    name: part.uid,
    ...part
})
export const missingUser = (uid: string): User => defaultUser({uid})

export const defaultActivityCalendarPreferences = (): ActivityCalendarPreferences => ({
    mode: CalendarMode.USER_ONLY,
    includeWorkouts: true,
    splitWorkouts: true,
    friends: [],
})