import moment, { duration } from 'moment'

export const dateString = (date: number | string | Date) => {
  return moment(date).toISOString().split('T')[0]
}

export const localDateTimeString = (date: number | string | Date) =>
  moment(date).format('YYYY-MM-DDTHH:mm:ss')

/**
 * Display relative time between the current time and the provided date (e.g. "2 weeks ago")
 */
export const timeFromNow = (date: number | string | Date, withoutSuffix?: boolean) =>
  moment(date).fromNow(withoutSuffix)

/**
 * Max time in the past for using a relative date instead of absolute date
 */
const MAX_RELATIVE_DATE = duration(1, 'month')

/**
 * Display relative time between the current date and the provided date (e.g. "2 weeks ago"),
 * but once that gets too generic it switches to absolute dates (i.e. a date further in the past than {@link MAX_RELATIVE_DATE} will instead show like Jan 01 2000)
 */
export const preciseTimeFromNow = (date: number | string | Date) => {
  const age = duration(moment().diff(moment(date)))

  if (age.asMilliseconds() > MAX_RELATIVE_DATE.asMilliseconds()) {
    return moment(date).format('MMM Do YYYY')
  }

  return timeFromNow(date)
}
