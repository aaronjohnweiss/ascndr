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
import {CountForDate, LabeledData, MultiCountForDate} from "../../helpers/activityCalendarEntries";

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

export interface CalendarLabels {
    months: string[]
    weekdays: string[]
    totalCount: string
    legend: {
        less: string
        more: string
    }
}

export const DEFAULT_LABELS: CalendarLabels = {
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

const flattenDays = (data: CountForDate[][]) => {
    const flatDays = new Map<string, MultiCountForDate>();

    data.forEach((days, i) => days.forEach(day => {
        const {date, count, level} = day;

        if (!flatDays.has(date)) {
            flatDays.set(date, emptyDay(date, data.length))
        }

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const thisDay = flatDays.get(date)!
        thisDay.counts[i] = count
        thisDay.levels[i] = level
    }))

    return [...flatDays.values()]
}

export function normalizeCalendarDays(days: MultiCountForDate[], numCategories: number): MultiCountForDate[] {
    const daysMap = days.reduce((map, day) => {
        map.set(day.date, day);
        return map;
    }, new Map<string, MultiCountForDate>());

    return eachDayOfInterval({
        start: parseISO(days[0].date),
        end: parseISO(days[days.length - 1].date),
    }).map((day) => {
        const date = formatISO(day, {representation: 'date'});

        return daysMap.get(date) || emptyDay(date, numCategories);
    });
}

export const getLatestDate = (data: LabeledData[]): string => {
    return data.flatMap(x => x.data).map(x => x.date).reduce((maxDate: string | undefined, currentDate) => maxDate && maxDate > currentDate ? maxDate : currentDate, undefined) || new Date().toDateString()
}

export function groupByWeeks(data: LabeledData[], weekStart): (MultiCountForDate | undefined)[][] {
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
    const paddedDays: (MultiCountForDate | undefined)[] = [
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
                    <stop offset={getOffset(gradientIdx, numColors)}
                          stopColor={theme[themeIdx][`level${levels[themeIdx]}`]}/>
                    <stop offset={getOffset(gradientIdx + 1, numColors)}
                          stopColor={theme[themeIdx][`level${levels[themeIdx]}`]}/>
                </Fragment>)
            }
        </linearGradient>
    );
}

export function getClassName(name: string, styles?: string) {
    if (styles) {
        return `${NAMESPACE}__${name} ${styles}`;
    }

    return `${NAMESPACE}__${name}`;
}

interface LegendDatum {
    name: string,
    symbol: { fill: string }
}

export const getLegendRows = ({
                                  maxWidth,
                                  fontSize,
                                  fontFamily,
                                  labels,
                                  padding
                              }: {
    maxWidth: number,
    padding: number,
    fontSize?: string,
    fontFamily?: string,
    labels: LegendDatum[]
}): LegendDatum[][] => {
    if (!fontSize) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        fontSize = VictoryTheme.grayscale.legend.style.labels.fontSize
    }
    if (!fontFamily) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        fontFamily = VictoryTheme.grayscale.legend.style.labels.fontFamily
    }
    const rowSize = row => row.map(label => calculateSize(label.name, {
        fontSize: `${fontSize}px`,
        font: fontFamily
    }).width + padding).reduce((acc, x) => acc + x, 0)

    const rows: LegendDatum[][] = [];
    let thisRow: LegendDatum[] = [];
    for (const label of labels) {
        if (rowSize([...thisRow, label]) < maxWidth) {
            thisRow.push(label)
        } else {
            rows.push(thisRow)
            thisRow = [label]
        }
    }
    rows.push(thisRow);
    return rows;
}
