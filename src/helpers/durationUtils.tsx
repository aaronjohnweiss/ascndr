import { Session } from '../types/Session'

export const durationString = (durationMillis: number, includeMinutes = true) => {
  const hours = Math.floor(durationMillis / 3600000)
  const hoursString = `${hours || 0}h`

  if (includeMinutes) {
    const minutes = Math.floor((durationMillis % 3600000) / 60000)
    const minutesString = `${minutes || 0}m`
    return hoursString + ' ' + minutesString
  } else {
    return hoursString
  }
}

export const sessionDuration = (session: Session) =>
  session.endTime === undefined ? '(ongoing)' : durationString(session.endTime - session.startTime)
