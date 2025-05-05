import React, { useLayoutEffect, useRef, useState } from 'react'
import moment from 'moment'
import ActivityCalendar from './activity-calendar/ActivityCalendar'

export const ResponsiveActivityCalendar = ({
  minCutoffDate,
  getData,
  blockSize = 12,
  blockMargin = 4,
}) => {
  const divRef = useRef<HTMLDivElement | null>(null)
  const [width, setWidth] = useState(0)
  useLayoutEffect(() => {
    setWidth(divRef?.current?.clientWidth || 100)
  }, [divRef.current])

  const numWeeks = Math.floor(width / (blockSize + blockMargin)) - 1
  const fullWidthCutoffDate = moment().startOf('week').subtract(numWeeks, 'weeks')

  const cutoffDate = minCutoffDate.isBefore(fullWidthCutoffDate)
    ? minCutoffDate
    : fullWidthCutoffDate

  return (
    <div ref={divRef}>
      <div className="d-flex justify-content-center mb-4">
        <ActivityCalendar
          data={getData(cutoffDate)}
          hideColorLegend
          hideTotalCount
          blockSize={blockSize}
          blockMargin={blockMargin}
        />
      </div>
    </div>
  )
}

export default ResponsiveActivityCalendar
