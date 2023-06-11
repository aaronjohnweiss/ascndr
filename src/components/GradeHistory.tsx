import React, {Fragment} from 'react'
import {compareGrades, isPartial, prettyPrint, printType} from '../helpers/gradeUtils'
import {Accordion, ListGroup} from 'react-bootstrap';
import {toArray} from '../helpers/objectConverters';
import {StatItem} from './StatsIndex';
import {sortHiatuses} from './HiatusModal';
import {dateString} from '../helpers/dateUtils';
import {GradeChartProps} from "./GradeHistogram";
import {Persisted} from "../types/Firebase";
import {Session} from "../types/Session";
import {entries} from "../helpers/recordUtils";

const calculateAllProgressions = (sessionsForUser, hiatuses, routes, allowSuffixes, allowedTypes, allowPartials) => {
    // Given hiatuses: Split up and section off data around the hiatuses
    if (hiatuses && hiatuses.length > 0) {
        const components: JSX.Element[] = [];
        const sortedHiatuses = sortHiatuses(hiatuses);
        for (let i = 0; i <= sortedHiatuses.length; i++) {
            // For each hiatus, window the sessions to all sessions that were after the hiatus (but before the next one)
            const rangeStartDate = (i === hiatuses.length) ? null : sortedHiatuses[i].endDate;
            const rangeEndDate = (i === 0) ? null : sortedHiatuses[i - 1].startDate;

            const sessionsInRange = sessionsForUser.filter(session => (rangeStartDate === null || session.value.startTime >= rangeStartDate) && (rangeEndDate === null || session.value.startTime < rangeEndDate));
            const progression = calculateProgression(sessionsInRange, routes, allowSuffixes, allowedTypes, allowPartials, 'h4');
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
                            <Accordion.Header>
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
    return calculateProgression(sessionsForUser, routes, allowSuffixes, allowedTypes, allowPartials)
}

const calculateProgression = (sessionsForUser, routes, allowSuffixes, allowedTypes, allowPartials, Header: keyof JSX.IntrinsicElements = 'h3') => {
    // For each style of climb...
    return allowedTypes.map((type, j) => {
        // Go through all sessions, oldest to newest
        const firsts = sessionsForUser.sort((a, b) => b.value.startTime - a.value.startTime)
            .reduce((arr, {key, value: {startTime, customRoutes = [], standardRoutes = []}}: Persisted<Session>) => {
                // Get all grades climbed in that session
                let maxFullGrade = null;
                let maxPartialGrade = null;

                // Get the max difficulty for this session
                [...customRoutes.map(({key, count, partials}) => ({
                    grade: routes[key].grade,
                    count,
                    partials
                })), ...standardRoutes.map(({key, count, partials}) => ({grade: key, count, partials}))]
                    // Filter down to the current type
                    .filter(route => type === route.grade.style)
                    .forEach(({grade, count, partials}) => {
                        if (count > 0) {
                            // Keep track of max grade for full completions
                            if (compareGrades(grade, maxFullGrade) > 0) {
                                maxFullGrade = grade;
                            }
                        } else {
                            if (partials && allowPartials) {
                                // Make sure a valid partial climb was logged; find highest partial percentage for this grade
                                const highestPercentage = entries(partials).filter(([, val]) => val > 0).map(([key,]) => key).reduce((a, b) => Math.max(a, b), 0)
                                if (highestPercentage > 0) {
                                    // Keep track of max grade for partial completions
                                    const partialGrade = {
                                        ...grade,
                                        percentage: highestPercentage
                                    };

                                    if (compareGrades(partialGrade, maxPartialGrade) > 0) {
                                        maxPartialGrade = partialGrade;
                                    }
                                }
                            }
                        }
                    });

                // Max could be undefined if no routes of that style were climbed this session
                if (maxPartialGrade) {
                    // Filter out other partial maxes that are more recent but not a higher grade
                    arr = arr.filter(entry => !isPartial(entry.grade) || compareGrades(entry.grade, maxPartialGrade, allowSuffixes, allowPartials) > 0);
                    // Add this entry; include session key for linking
                    arr.push({date: startTime, grade: maxPartialGrade, key});
                }
                if (maxFullGrade) {
                    // Filter out other maxes that are more recent but not a higher grade
                    arr = arr.filter(entry => compareGrades(entry.grade, maxFullGrade, allowSuffixes) > 0);
                    // Add this entry; include session key for linking
                    arr.push({date: startTime, grade: maxFullGrade, key});
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
                                  label={`${prettyPrint(grade, allowSuffixes, allowPartials)}: ${new Date(date).toDateString()}`}
                                  link={`/sessions/${key}`}/>
                    ))}
                </ListGroup>
            </Fragment>
        );
    });
}

const GradeHistory = ({users, routes, sessions, allowSuffixes, allowedTypes, allowPartials}: GradeChartProps) => {
    const sessionsArray = toArray(sessions);

    // Build history per user
    return (
        <>
            {Object.values(users).map(({name, uid, hiatuses}, i) => {
                const sessionsForUser = sessionsArray.filter(session => session.value.uid === uid);

                const firstsByType = calculateAllProgressions(sessionsForUser, hiatuses, routes, allowSuffixes, allowedTypes, allowPartials)

                // Show user name and their grade history
                return (
                    <Fragment key={i}>
                        <h2>{name}</h2>
                        {firstsByType}
                        <br/>
                    </Fragment>
                );
            })
            }
        </>)
};

export default GradeHistory;