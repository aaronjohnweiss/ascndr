import { useEffect, useState } from 'react'
import moment from 'moment'
import { durationString } from './durationUtils'

const DEFAULT_INTERVAL_MS = 60 * 1000

interface DateSettings {
  intervalMs?: number
}

export const useDate = ({ intervalMs = DEFAULT_INTERVAL_MS }: DateSettings): number => {
  const [date, setDate] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setDate(new Date())
    }, intervalMs)
    return () => {
      clearInterval(timer)
    }
  }, [])

  return date.getTime()
}

type DurationSettings = DateSettings & {
  startTime?: number
  endTime?: number
}

export const useDuration = (settings: DurationSettings): string => {
  const date = useDate(settings)
  let start = settings.startTime || new Date().getTime()

  useEffect(() => {
    if (settings.startTime !== undefined) {
      start = settings.startTime
    }
  }, [settings])

  return durationString((settings.endTime || date) - start)
}
