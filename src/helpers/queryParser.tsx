import {Location} from "history";
import {FilterParam} from "../redux/selectors/types";
import {Gym} from "../types/Gym";
import {User} from "../types/User";
import {Session} from "../types/Session";
import {isStyle, RouteStyle} from "../types/Grade";
import {ALL_STYLES} from "./gradeUtils";
import {SORT_FIELDS, SortEntry} from "../components/RoutesIndex";

export const getBooleanFromQuery = (query, name, valueIfMissing = false) => query.has(name) ? query.get(name) === 'true' : valueIfMissing;

const defaultSort = {
    key: 'created' as const,
    desc: true,
}
export const parseSort = (query: URLSearchParams): SortEntry[] => {
    const sort = query.get('sortBy')?.split(',').map(field => ({
        key: field.substring(1),
        desc: field.charAt(0) === '-'
    })).filter((sortEntry): sortEntry is SortEntry => SORT_FIELDS.findIndex(s => s === sortEntry.key) >= 0) || []

    return [...sort, defaultSort]
}
export const filterQueryParams = (location: Location<unknown>) => {
    const query = new URLSearchParams(location.search);

    return {
        gyms: {
            getFilter: (): FilterParam<Gym>[] => {
                if (query.has('gyms')) {
                    return [['gymKey', query.getAll('gyms')]]
                }

                return []
            }
        },
        users: {
            getFilter: (): FilterParam<User>[] => {
                if (query.has('uids')) {
                    return [['uid', query.getAll('uids')]]
                }

                return []
            }
        },
        selfOnly: {
            getUserFilter: (uid: string): FilterParam<User>[] => {
                const selfOnly = getBooleanFromQuery(query, 'selfOnly', true)

                if (selfOnly) {
                    return [['uid', uid]]
                } else {
                    return [['friendOf', uid]]
                }
            },
            getSessionFilter: (uid: string): FilterParam<Session>[] => {
                const selfOnly = getBooleanFromQuery(query, 'selfOnly', true)

                if (selfOnly) {
                    return [['owner', uid]]
                } else {
                    return [['editor', uid]]
                }
            }
        },
        allowedTypes: {
            getValues: (): RouteStyle[] => {
                if (query.has('allowedTypes')) {
                    return query.getAll('allowedTypes').filter(type => isStyle(type)) as RouteStyle[];
                } else {
                    return [...ALL_STYLES];
                }
            }
        },
        allowPartials: {
            getValue: (): boolean => getBooleanFromQuery(query, 'allowPartials', true)
        },
        allowSuffixes: {
            getValue: (): boolean => getBooleanFromQuery(query, 'allowSuffixes', false)
        },
        sort: {
            getSort: () => parseSort(query)
        }
    }
}