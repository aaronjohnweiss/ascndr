import React from 'react';
import ActivityCalendar from 'react-activity-calendar';
import moment from 'moment';
import { routeCountForSession } from './StatsIndex';
import { ALL_STYLES } from '../helpers/gradeUtils';
import { dateString } from '../helpers/dateUtils';
import { percentile } from '../helpers/mathUtils';

const DATE_FORMAT = 'YYYY-MM-DD';

const getEmptyCounts = cutoffDate => {
    const tmpDate = cutoffDate.clone();
    const now = moment();
    const emptyCounts = {};
    while (tmpDate.isBefore(now)) {
        emptyCounts[tmpDate.format(DATE_FORMAT)] = 0;
        tmpDate.add(1, 'day');
    }
    return emptyCounts;
}

export const SessionCalendar = ({sessions, routes, cutoffDate}) => {
    const emptyCounts = getEmptyCounts(cutoffDate);
    const fullCounts = sessions.filter(({value}) => cutoffDate.isBefore(moment(value.startTime)))
        .map(({value}) => ({date: dateString(value.startTime), count: routeCountForSession(value, routes, ALL_STYLES, true)}))
        .reduce((acc, entry) => ({...acc, [entry.date]: entry.count + (acc[entry.date])}), emptyCounts);

    const allCounts = Object.values(fullCounts).filter(val => val > 0).sort((a, b) => a - b);
    const q25 = percentile(allCounts, 0.25);
    const q50 = percentile(allCounts, 0.50);
    const q75 = percentile(allCounts, 0.75);

    const getLevel = count => {
        if (count === 0) return 0;
        if (count <= q25) return 1;
        if (count <= q50) return 2;
        if (count <= q75) return 3;
        return 4;
    }

    const data = Object.entries(fullCounts).map(([date, count]) => ({date: date, count: count, level: getLevel(count)})).sort((a, b) => a.date.localeCompare(b.date));

    return <div className="d-flex justify-content-center mb-2">
        <ActivityCalendar data={data} hideColorLegend hideTotalCount color="#0000CC"/>
    </div>
}