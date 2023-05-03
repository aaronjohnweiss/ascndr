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
    name: string
    friends: string[]
    hiatuses: Hiatus[]
    preferences: UserPreferences
    uid: string
}
