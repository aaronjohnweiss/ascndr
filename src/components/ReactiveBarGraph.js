import React, { useLayoutEffect, useRef, useState } from 'react';
import { VictoryBar, VictoryChart, VictoryGroup, VictoryLegend } from 'victory';

// Width of each bar
const GRAPH_BAR_WIDTH = 20;
// Magic number: padding around graph, axis labels, etc
const GRAPH_BAR_PADDING = 110;
// Height of each entry in legend
const GRAPH_LEGEND_ENTRY_HEIGHT = 30;

const ReactiveBarGraph = ({data, categories, maxDomain, animate}) => {
    const divRef = useRef();

    const [width, setWidth] = useState(0);

    useLayoutEffect(() => {
        setWidth(divRef.current.clientWidth)
    }, [divRef.current]);

    const legendHeight = GRAPH_LEGEND_ENTRY_HEIGHT * data.length;
    const graphHeight = GRAPH_BAR_PADDING + GRAPH_BAR_WIDTH * data.length * categories.length;

    return (
        <div ref={divRef}>
            <svg height={graphHeight + legendHeight} width={width}>
                <VictoryChart standalone={false} horizontal width={width} height={graphHeight} maxDomain={maxDomain}>
                    <VictoryLegend
                        colorScale={'blue'}
                        centerTitle
                        orientation="vertical"
                        width={width}
                        y={graphHeight}
                        data={data.map(({name}) => ({name}))}
                    />
                    <VictoryGroup animate={animate} categories={{x: categories}} colorScale={'blue'}
                                  offset={GRAPH_BAR_WIDTH}>
                        {
                            data.map(({barData}, index) => {
                                // Add 0s for missing categories
                                const paddedBarData = [...barData];
                                categories.forEach(category => {
                                    if (paddedBarData.findIndex((({x}) => x === category)) === -1) {
                                        paddedBarData.push({x: category, y: 0});
                                    }
                                });
                                return <VictoryBar key={index} data={paddedBarData} barWidth={GRAPH_BAR_WIDTH}
                                                   labels={({datum}) => Math.floor(datum.y)} />
                            })
                        }
                    </VictoryGroup>
                </VictoryChart>
            </svg>
        </div>
    )
};

export default ReactiveBarGraph;