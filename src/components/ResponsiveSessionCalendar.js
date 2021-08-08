import React, { useLayoutEffect, useRef, useState } from 'react';
import moment from 'moment';
import SessionCalendar from './SessionCalendar';


const BLOCK_SIZE = 12;
const BLOCK_MARGIN = 4;

export const ResponsiveSessionCalendar = ({sessions, routes, minCutoffDate}) => {
    const divRef = useRef();
    const [width, setWidth] = useState(0);
    useLayoutEffect(() => {
        setWidth(divRef.current.clientWidth)
    }, [divRef.current]);

    const numWeeks = Math.floor(width / (BLOCK_SIZE + BLOCK_MARGIN)) - 1;
    const fullWidthCutoffDate = moment().startOf('week').subtract(numWeeks, 'weeks');

    const cutoffDate = minCutoffDate.isBefore(fullWidthCutoffDate) ? minCutoffDate : fullWidthCutoffDate;

    return <div ref={divRef}>
        <SessionCalendar sessions={sessions} routes={routes} blockSize={BLOCK_SIZE} blockMargin={BLOCK_MARGIN} cutoffDate={cutoffDate}/>
    </div>
}

export default ResponsiveSessionCalendar;