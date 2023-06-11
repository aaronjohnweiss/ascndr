import React from 'react';
import {Point} from 'victory';

const hemisphere = (x, y, size, mult) => `M ${x}, ${y}
      m 0, ${-1 * mult * size}
      a ${size}, ${size} 0 1,0 0,${mult * size * 2}`

const leftHemishpere = (x, y, size) => hemisphere(x, y, size, 1);
const rightHemishpere = (x, y, size) => hemisphere(x, y, size, -1);

interface Props {
    index?: number
    legendColors: string[][]
}
export const MultiColorPoint = ({index = 0, legendColors, ...props}: Props) => {
    return (
        <>
            <Point {...props} getPath={leftHemishpere} style={{fill: legendColors[index][0]}} />
            <Point {...props} getPath={rightHemishpere} style={{fill: legendColors[index][1]}} />
        </>
    )
}