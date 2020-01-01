import React, { useLayoutEffect, useRef, useState } from 'react'
import { VictoryBar, VictoryChart, VictoryGroup, VictoryLegend } from 'victory'
import { BOULDER, compareGrades, gradeEquals, prettyPrint, TOP_ROPE } from '../helpers/gradeUtils'

// Width of each bar
const GRAPH_BAR_WIDTH = 20;
// Magic number: padding around graph, axis labels, etc
const GRAPH_BAR_PADDING = 110;
// Height of each entry in legend
const GRAPH_LEGEND_ENTRY_HEIGHT = 30;

const addCount = (arr, key, count, allowSuffixes) => {
    const entry = arr.find(val => gradeEquals(val.key, key, allowSuffixes))
    if (entry) {
        entry.count += count;
    } else {
        arr.push({key, count});
    }
}

const GradeHistogram = ({users, routes, sessions, allowSuffixes = false, allowedTypes = [BOULDER, TOP_ROPE]}) => {
    const divRef = useRef();

    const [width, setWidth] = useState(0);

    useLayoutEffect(() => {
        setWidth(divRef.current.clientWidth)
    }, [divRef.current]);

    // Maintain list of all grades for the x axis labels
    const allGrades = [];

    // Calculate totals for each user
    const data = users.map(({uid, name}) => {
        const sessionsForUser = sessions.filter(session => session.uid === uid);

        // Go through all sessions, aggregating routes by grade
        const countByGrade = sessionsForUser.reduce((acc, session) => {
            // Look up grade for any custom routes
            if (session.customRoutes) {
                session.customRoutes.forEach(customRoute => {
                    const grade = routes[customRoute.key].grade;

                    if (allowedTypes.includes(grade.style)) {
                        addCount(acc, grade, customRoute.count, allowSuffixes);
                    }
                });
            }

            // Add grade/count for standard routes
            if (session.standardRoutes) {
                session.standardRoutes.forEach(standardRoute => {
                    if (allowedTypes.includes(standardRoute.key.style)) {
                        addCount(acc, standardRoute.key, standardRoute.count, allowSuffixes);
                    }
                });
            }

            return acc;
        }, []);

        // Add to list of all grades
        countByGrade.forEach(({key}) => {
            if (!allGrades.find(val => gradeEquals(val, key, allowSuffixes))) {
                allGrades.push(key);
            }
        });

        return {uid, name, countByGrade};
    }, {});

    const sortedGrades = [...allGrades].sort(compareGrades).reverse();

    const categories = sortedGrades.map(grade => prettyPrint(grade, allowSuffixes));

    const legendHeight = GRAPH_LEGEND_ENTRY_HEIGHT * users.length;
    const graphHeight = GRAPH_BAR_PADDING + GRAPH_BAR_WIDTH * users.length * sortedGrades.length;

    return (
        <div ref={divRef}>
            <svg height={graphHeight + legendHeight} width={width}>
                <VictoryChart standalone={false} horizontal width={width} height={graphHeight}>
                    <VictoryLegend
                                   colorScale={"blue"}
                                   centerTitle
                                   orientation="vertical"
                                   width={width}
                                   y={graphHeight}
                                   data={data.map(({ name }) => ({name}))}
                    />
                    <VictoryGroup categories={{x: categories}} colorScale={"blue"} offset={GRAPH_BAR_WIDTH}>
                        {
                            data.map(({uid, countByGrade}) => {

                                const barData = sortedGrades.map(grade => {
                                    const entry = countByGrade.find(val => gradeEquals(val.key, grade, allowSuffixes));
                                    return {x: prettyPrint(grade, allowSuffixes), y: entry && entry.count || 0};
                                });

                                return <VictoryBar key={uid} data={barData} barWidth={GRAPH_BAR_WIDTH} labels={({datum}) => datum.y}/>
                            })
                        }
                    </VictoryGroup>
                </VictoryChart>
            </svg>
        </div>
    )
}

export default GradeHistogram;