import {VictoryLegend} from "victory";
import React from "react";
import {shorten} from "../helpers/stringUtils";
import {getNumColumns} from "./activity-calendar/utils";

const LEGEND_ENTRY_HEIGHT = 30;
const LEGEND_ENTRY_GUTTER = 20;
const LEGEND_ENTRY_MAX_CHARACTERS = 15;
const LEGEND_ENTRY_PADDING = LEGEND_ENTRY_GUTTER * 2;


export const WrappedLegend = ({data, width, colorScale}) => {
    const legendData = data.map(datum => ({name: shorten(datum.label, LEGEND_ENTRY_MAX_CHARACTERS)}));

    const numColumns = getNumColumns({maxWidth: width, padding: LEGEND_ENTRY_PADDING, labels: legendData});

    return (
        <div>
            <svg width={width} height={LEGEND_ENTRY_HEIGHT * Math.ceil(data.length / numColumns)}>
                <VictoryLegend
                    standalone={false}
                    colorScale={colorScale}
                    gutter={LEGEND_ENTRY_GUTTER}
                    orientation="horizontal"
                    itemsPerRow={numColumns}
                    width={width}
                    data={legendData}
                />
            </svg>
        </div>
    )
}

export default WrappedLegend