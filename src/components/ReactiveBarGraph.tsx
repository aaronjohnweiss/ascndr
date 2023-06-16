import React, {useLayoutEffect, useRef, useState} from 'react';
import {Point, VictoryAxis, VictoryBar, VictoryChart, VictoryGroup, VictoryLegend, VictoryStack} from 'victory';
import {rainbowColors} from '../helpers/rainbowColor';
import {MultiColorPoint} from './MultiColorPoint';

// Width of each bar
const GRAPH_BAR_WIDTH = 20;
// Magic number: padding around graph, axis labels, etc
const GRAPH_BAR_PADDING = 110;
// Height of each entry in legend
const GRAPH_LEGEND_ENTRY_HEIGHT = 30;


const getColors = (numUsers: number) => rainbowColors({n: numUsers});

const ReactiveBarGraph = ({data, categories, maxDomain, animate, showLegend = true, isStacked = true}) => {
    // Use div ref to determine screen width (to fit graph to screen)
    const divRef = useRef<HTMLDivElement | null>(null);
    const [width, setWidth] = useState(0);
    useLayoutEffect(() => {
        setWidth(divRef?.current?.clientWidth || 100)
    }, [divRef.current]);

    const numUsers = data.length;

    const allColors = getColors(numUsers);
    // Since the bars go in order upside down, reverse the legend's colors/labels
    const legendColors = allColors.slice().reverse();
    const legendLabels = data.map(({name}) => ({name})).reverse();

    const domainPadding = GRAPH_BAR_WIDTH * numUsers / 2;
    const legendHeight = GRAPH_LEGEND_ENTRY_HEIGHT * numUsers;
    const graphHeight = GRAPH_BAR_PADDING + GRAPH_BAR_WIDTH * numUsers * categories.length + domainPadding * 2;

    return (
        <div ref={divRef}>
            <svg height={graphHeight + legendHeight} width={width}>
                <VictoryChart standalone={false} horizontal width={width} height={graphHeight} maxDomain={maxDomain} domainPadding={domainPadding}>
                    {showLegend &&
                    <VictoryLegend
                        colorScale={legendColors.map(([a,]) => a)}
                        centerTitle
                        orientation="vertical"
                        width={width}
                        y={graphHeight}
                        data={legendLabels}
                        dataComponent={isStacked ? <MultiColorPoint legendColors={legendColors}/> : <Point />}
                    />
                    }
                    <VictoryAxis />
                    <VictoryAxis dependentAxis tickFormat={(t) => Math.floor(t)}/>
                    <VictoryGroup animate={animate} categories={{x: categories}}
                                  offset={GRAPH_BAR_WIDTH} style={{data: {width: GRAPH_BAR_WIDTH}}}>
                        {
                            data.map(({barData, barTotals}, i) => {
                                return <VictoryStack key={i} colorScale={allColors[i]}
                                                     labels={(node) => barTotals[node.datum.x] || 0}>
                                    {
                                        barData.map((bars, j) => {
                                            const paddedBarData = [...bars];
                                            // Add 0s for missing categories
                                            categories.forEach(category => {
                                                if (paddedBarData.findIndex((({x}) => x === category)) === -1) {
                                                    paddedBarData.push({x: category, y: 0});
                                                }
                                            });
                                            return <VictoryBar key={j} data={paddedBarData}
                                                               barWidth={GRAPH_BAR_WIDTH} />
                                        })
                                    }
                                </VictoryStack>
                            })
                        }
                    </VictoryGroup>
                </VictoryChart>
            </svg>
        </div>
    )
};

export default ReactiveBarGraph;