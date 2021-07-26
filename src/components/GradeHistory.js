import React, { Fragment } from 'react'
import { compareGrades, prettyPrint, printType } from '../helpers/gradeUtils'
import { Accordion, ListGroup } from 'react-bootstrap';
import { toArray } from '../helpers/objectConverters';
import { StatItem } from './StatsIndex';
import { sortHiatuses } from './HiatusModal';
import { dateString } from '../helpers/dateUtils';

const calculateAllProgressions = (sessionsForUser, hiatuses, routes, allowSuffixes, allowedTypes) => {
    // Given hiatuses: Split up and section off data around the hiatuses
    if (hiatuses && hiatuses.length > 0) {
        const components = [];
        const sortedHiatuses = sortHiatuses(hiatuses);
        for (let i = 0; i <= sortedHiatuses.length; i++) {
            // For each hiatus, window the sessions to all sessions that were after the hiatus (but before the next one)
            const rangeStartDate = (i === hiatuses.length) ? null : sortedHiatuses[i].endDate;
            const rangeEndDate = (i === 0) ? null : sortedHiatuses[i-1].startDate;

            const sessionsInRange = sessionsForUser.filter(session => (rangeStartDate === null || session.value.startTime >= rangeStartDate) && (rangeEndDate === null || session.value.startTime < rangeEndDate));
            const progression = calculateProgression(sessionsInRange, routes, allowSuffixes, allowedTypes, 'h4');
            if (progression.filter(entry => entry != null).length !== 0) {
                let headerString;
                if (rangeStartDate != null && rangeEndDate != null) {
                    headerString = `Between ${dateString(rangeStartDate)} and ${dateString(rangeEndDate)}`
                } else if (rangeStartDate != null) {
                    headerString = `After ${dateString(rangeStartDate)}`
                } else {
                    headerString = `Before ${dateString(rangeEndDate)}`
                }
                // Build an accordion for the current window
                // First one (most recent) will default to open, rest will default to closed
                components.push(
                    <Accordion key={i} defaultActiveKey={'0'}>
                        <Accordion.Item eventKey={`${components.length}`}>
                            <Accordion.Header >
                                {headerString}
                            </Accordion.Header>
                            <Accordion.Body>
                                {progression}
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                );
            }
        }
        return components;
    }

    // No hiatuses: just show all data together
    return calculateProgression(sessionsForUser, routes, allowSuffixes, allowedTypes)
}

const calculateProgression = (sessionsForUser, routes, allowSuffixes, allowedTypes, Header = 'h3') => {
    // For each style of climb...
    return allowedTypes.map((type, j) => {
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
                <Header>{printType(type)}</Header>
                <ListGroup>
                    {firsts.map(({date, grade, key}, k) => (
                        <StatItem key={k}
                                  label={`${prettyPrint(grade, allowSuffixes)}: ${new Date(date).toDateString()}`}
                                  link={`/sessions/${key}`} />
                    ))}
                </ListGroup>
            </Fragment>
        );
    });
}

const GradeHistory = ({users, routes, sessions, allowSuffixes, allowedTypes}) => {
    const sessionsArray = toArray(sessions);

    // Build history per user
    return Object.values(users).map(({name, uid, hiatuses}, i) => {
        const sessionsForUser = sessionsArray.filter(session => session.value.uid === uid);

        const firstsByType = calculateAllProgressions(sessionsForUser, hiatuses, routes, allowSuffixes, allowedTypes)

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