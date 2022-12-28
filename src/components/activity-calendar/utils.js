import eachDayOfInterval from 'date-fns/eachDayOfInterval';
import formatISO from 'date-fns/formatISO';
import parseISO from 'date-fns/parseISO';
import differenceInCalendarDays from 'date-fns/differenceInCalendarDays';
import getDay from 'date-fns/getDay';
import subWeeks from 'date-fns/subWeeks';
import nextDay from 'date-fns/nextDay';
import getMonth from 'date-fns/getMonth';
import color from 'tinycolor2';
import {rainbowColors} from "../../helpers/rainbowColor";
import React, {Fragment} from "react";
import {VictoryTheme} from 'victory'
import calculateSize from 'calculate-size'

export const NAMESPACE = 'ActivityCalendar';


export const MIN_DISTANCE_MONTH_LABELS = 2;
export const DEFAULT_MONTH_LABELS = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
];

export const DEFAULT_WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const DEFAULT_LABELS = {
    months: DEFAULT_MONTH_LABELS,
    weekdays: DEFAULT_WEEKDAY_LABELS,
    totalCount: '{{count}} contributions in {{year}}',
    legend: {
        less: 'Less',
        more: 'More',
    },
};

const emptyDay = (date, numCategories) => ({
    date,
    counts: Array(numCategories).fill(0),
    levels: Array(numCategories).fill(0),
})

const flattenDays = (data) => {
    const flatDays = new Map();

    data.forEach((days, i) => days.forEach(day => {
        const {date, count, level} = day;

        if (!flatDays.has(date)) {
            flatDays.set(date, emptyDay(date, data.length))
        }

        const thisDay = flatDays.get(date)
        thisDay.counts[i] = count
        thisDay.levels[i] = level
    }))

    return [...flatDays.values()]
}

export function normalizeCalendarDays(days, numCategories) {
    const daysMap = days.reduce((map, day) => {
        map.set(day.date, day);
        return map;
    }, new Map());

    return eachDayOfInterval({
        start: parseISO(days[0].date),
        end: parseISO(days[days.length - 1].date),
    }).map((day) => {
        const date = formatISO(day, {representation: 'date'});

        if (daysMap.has(date)) {
            return daysMap.get(date);
        }

        return emptyDay(date, numCategories);
    });
}

export function groupByWeeks(data, weekStart) {
    if (data.length === 0) return [];

    const flattenedDays = flattenDays(data.map(datum => datum.data))

    // The calendar expects a continuous sequence of days, so fill gaps with empty activity.
    const normalizedDays = normalizeCalendarDays(flattenedDays, data.length);

    // Determine the first date of the calendar. If the first contribution date is not
    // specified week day the desired day one week earlier will be selected.
    const firstDate = parseISO(normalizedDays[0].date);
    const firstCalendarDate = getDay(firstDate) === weekStart ? firstDate : subWeeks(nextDay(firstDate, weekStart), 1);

    // In order to correctly group contributions by week it is necessary to left pad the list,
    // because the first date might not be desired week day.
    const paddedDays = [
        ...Array(differenceInCalendarDays(firstDate, firstCalendarDate)).fill(undefined),
        ...normalizedDays,
    ];

    return Array(Math.ceil(paddedDays.length / 7))
        .fill(undefined)
        .map((_, calendarWeek) => paddedDays.slice(calendarWeek * 7, calendarWeek * 7 + 7));
}

export function getMonthLabels(weeks, monthNames = DEFAULT_MONTH_LABELS) {
    return weeks
        .reduce((labels, week, index) => {
            const firstWeekDay = week.find((day) => day !== undefined);

            if (!firstWeekDay) {
                throw new Error(`Unexpected error: Week is empty: [${week}]`);
            }

            const month = monthNames[getMonth(parseISO(firstWeekDay.date))];
            const prev = labels[labels.length - 1];

            if (index === 0 || prev.text !== month) {
                return [
                    ...labels,
                    {
                        x: index,
                        y: 0,
                        text: month,
                    },
                ];
            }

            return labels;
        }, [])
        .filter((label, index, labels) => {
            if (index === 0) {
                return labels[1] && labels[1].x - label.x > MIN_DISTANCE_MONTH_LABELS;
            }

            return true;
        });
}

export const createColorLevels = (baseColor) => ({
    level4: baseColor.setAlpha(1).toHslString(),
    level3: baseColor.setAlpha(.8).toHslString(),
    level2: baseColor.setAlpha(.6).toHslString(),
    level1: baseColor.setAlpha(.4).toHslString(),
})

export const createCalendarTheme = (numCategories, emptyColor = color('white').darken(8).toHslString()) => ({
    level0: emptyColor,
    theme: rainbowColors({n: numCategories}).map(([baseColor]) => createColorLevels(color(baseColor))),
})

export const getOffset = (i, n) => `${i * 100 / n}%`

export const GradientForDay = ({id, day: {date, levels}, theme, level0}) => {
    const nonzeroLevels = levels.map((val, index) => [val, index]).filter(([val]) => val !== 0).map(([, index]) => index)
    const numColors = nonzeroLevels.length
    if (numColors === 0) {
        return (
            <linearGradient id={id}>
                <stop offset="0%" stopColor={level0}/>
                <stop offset="100%" stopColor={level0}/>
            </linearGradient>
        )
    }
    return (
        <linearGradient id={id}>
            {
                nonzeroLevels.map((themeIdx, gradientIdx) => <Fragment key={gradientIdx}>
                    <stop offset={getOffset(gradientIdx, numColors)} stopColor={theme[themeIdx][`level${levels[themeIdx]}`]} />
                    <stop offset={getOffset(gradientIdx + 1, numColors)} stopColor={theme[themeIdx][`level${levels[themeIdx]}`]} />
                </Fragment>)
            }
        </linearGradient>
    );
}

export function getClassName(name, styles) {
    if (styles) {
        return `${NAMESPACE}__${name} ${styles}`;
    }

    return `${NAMESPACE}__${name}`;
}

export function generateEmptyData() {
    const year = new Date().getFullYear();
    const days = eachDayOfInterval({
        start: new Date(year, 0, 1),
        end: new Date(year, 11, 31),
    });

    return days.map((date) => (emptyDay(date, 1)));
}

export const getNumColumns = ({maxWidth, fontSize = VictoryTheme.grayscale.legend.style.labels.fontSize, fontFamily = VictoryTheme.grayscale.legend.style.labels.fontFamily, labels, padding}) => {
    let numPerRow = labels.length;
    const widths = labels.map(({name}) => {
        const size = calculateSize(name, {fontSize: `${fontSize}px`, font: fontFamily}).width;
        return size + padding;
    })

    while (!isValidSlice({numPerRow, widths, maxWidth}) && numPerRow > 1) {
        numPerRow--;
    }

    return numPerRow;
}

const buildSlice = ({numPerRow, widths}) => Array(Math.ceil(widths.length / numPerRow))
    .fill(undefined)
    .map((_, idx) => widths.slice(idx * numPerRow, (idx + 1) * numPerRow));

const isValidSlice = ({numPerRow, widths, maxWidth}) => buildSlice({numPerRow, widths}).map(row => row.reduce((acc, x) => acc + x, 0)).every(lineWidth => lineWidth <= maxWidth)