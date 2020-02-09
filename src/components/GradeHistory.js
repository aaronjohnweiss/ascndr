import React, { Fragment } from 'react'
import { compareGrades, prettyPrint, printType } from '../helpers/gradeUtils'
import { ListGroup } from 'react-bootstrap';
import { toArray } from '../helpers/objectConverters';
import { StatItem } from './StatsIndex';

const GradeHistory = ({users, routes, sessions, allowSuffixes, allowedTypes}) => {
    const sessionsArray = toArray(sessions);

    // Build history per user
    return Object.values(users).map(({name, uid}, i) => {
        const sessionsForUser = sessionsArray.filter(session => session.value.uid === uid);

        // For each style of climb...
        const firstsByType = allowedTypes.map((type, j) => {
            // Go through all sessions, oldest to newest
            const firsts = sessionsForUser.sort((a, b) => b.value.startTime - a.value.startTime)
                .reduce((arr, {key, value: {startTime, customRoutes = [], standardRoutes = []}}) => {
                    // Get all grades climbed in that session
                    const maxGrade = [...customRoutes.map(customRoute => routes[customRoute.key].grade), ...standardRoutes.map(standardRoute => standardRoute.key)]
                        // Filter down to the current type
                        .filter(grade => type === grade.style)
                        // Get the max difficulty for this session
                        .reduce((a, b) => compareGrades(a, b, allowSuffixes) > 0 ? a : b, undefined);

                    // Max could be undefined if no routes of that style were climbed this session
                    if (maxGrade) {
                        // Filter out other maxes that are more recent but not a higher grade
                        arr = arr.filter(entry => compareGrades(entry.grade, maxGrade) > 0);
                        // Add this entry; include session key for linking
                        arr.push({date: startTime, grade: maxGrade, key});
                    }
                    return arr;
                }, []);

            // If there are no routes at all for this user/style return null to ignore it
            if (firsts.length === 0) return null;

            // List the firsts, their corresponding dates, with links to the session. Already sorted by date/grade descending.
            return (
                <Fragment key={j}>
                    <h3>{printType(type)}</h3>
                    <ListGroup>
                        {firsts.map(({date, grade, key}, k) => (
                            <StatItem key={k} label={`${prettyPrint(grade, allowSuffixes)}: ${new Date(date).toDateString()}`} link={`/sessions/${key}`} />
                        ))}
                    </ListGroup>
                </Fragment>
            );
        });

        // If there are no routes at all for this user, ignore it
        if (firstsByType.filter(entry => entry != null).length === 0) return null;

        // Show user name and their grade history
        return (
            <Fragment key={i}>
                <h2>{name}</h2>
                {firstsByType}
                <br />
            </Fragment>
        );
    });
};

export default GradeHistory;