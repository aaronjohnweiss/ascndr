import {VictoryLegend} from "victory";
import React from "react";
import {shorten} from "../helpers/stringUtils";
import {getLegendRows} from "./activity-calendar/utils";
import {LabeledData} from "../helpers/activityCalendarEntries";

const LEGEND_ENTRY_HEIGHT = 30;
const LEGEND_ENTRY_GUTTER = 20;
const LEGEND_ENTRY_MAX_CHARACTERS = 15;
const LEGEND_ENTRY_PADDING = LEGEND_ENTRY_GUTTER * 2;


export const WrappedLegend = ({data, width, colorScale}: {data: LabeledData[], width: number, colorScale: string[]}) => {
    const legendData = data.map((datum, idx) => ({name: shorten(datum.label, LEGEND_ENTRY_MAX_CHARACTERS), symbol: { fill: colorScale[idx] }}));

    const rows = getLegendRows({maxWidth: width, padding: LEGEND_ENTRY_PADDING, labels: legendData});

    return (
        <div>
            <svg width={width} height={LEGEND_ENTRY_HEIGHT * rows.length}>
                {rows.map((row, idx) => <VictoryLegend
                    key={idx}
                    y={idx * LEGEND_ENTRY_HEIGHT}
                    standalone={false}
                    gutter={LEGEND_ENTRY_GUTTER}
                    orientation="horizontal"
                    width={width}
                    data={row}
                />
                )}
            </svg>
        </div>
    )
}

export default WrappedLegend