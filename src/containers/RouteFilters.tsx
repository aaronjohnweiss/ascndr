import React, {useEffect, useState} from 'react';
import {isLoaded, useFirebaseConnect} from 'react-redux-firebase';
import {useLocation} from 'react-router-dom';
import {Button, Form} from 'react-bootstrap';
import {ALL_STYLES, printType} from '../helpers/gradeUtils';
import {getGymsForUser} from '../helpers/filterUtils';
import {getBooleanFromQuery} from './StatsContainer';
import {parseSort} from "./RoutesContainer";
import {MultiSelect} from "./StatFilters";
import {firebaseState, getUser} from "../redux/selectors";
import {entries} from "../helpers/recordUtils";
import {sortOptions} from "../components/RoutesIndex";


const defaultIfEmpty = (a1, a2) => {
    if (!a1 || a1.length === 0) return a2;
    return a1;
};

const RouteFilters = () => {
    useFirebaseConnect([
        'gyms',
        'users'
    ])

    const { uid } = getUser()
    const gyms = firebaseState.gyms.getOrdered()
    const users = firebaseState.users.getOrdered()

    const query = new URLSearchParams(useLocation().search);


    const [gymIds, setGymIds] = useState<string[]>(defaultIfEmpty(query.getAll('gyms'), []));


    const [selfOnly, setSelfOnly] = useState(getBooleanFromQuery(query, 'selfOnly'));
    const [allowPartials, setAllowPartials] = useState(getBooleanFromQuery(query, 'allowPartials', true));

    const [allowedTypes, setAllowedTypes] = useState(defaultIfEmpty(query.getAll('allowedTypes'), ALL_STYLES));

    useEffect(() => {
        if (isLoaded(gyms) && isLoaded(users) && gymIds.length === 0) {
            setGymIds(getGymsForUser(gyms, users, uid).map(gym => gym.key))
        }
    }, [gyms])

    const sortBy = parseSort(query)[0];
    const [sortDesc, setSortDesc] = useState(sortBy.desc)
    const [sortKey, setSortKey] = useState(sortBy.key)

    if (!isLoaded(gyms) || !isLoaded(users)) {
        return <>Loading</>
    }

    const visibleGyms = gyms && getGymsForUser(gyms, users, uid);

    const returnUrl = '/routeGallery';

    const gymOptions = visibleGyms.map(({key, value}) => ({
        key,
        label: value.name,
        checked: gymIds.includes(key)
    }));

    const styleOptions = ALL_STYLES.map(style => ({
        key: style,
        label: printType(style),
        checked: allowedTypes.includes(style)
    }));

    const generateQueryParams = () => {
        const queryParams = new URLSearchParams();
        gymIds.forEach(id => queryParams.append('gyms', id));
        allowedTypes.forEach(type => queryParams.append('allowedTypes', type));
        queryParams.append('selfOnly', `${selfOnly}`);
        queryParams.append('allowPartials', `${allowPartials}`);
        queryParams.append('sortBy', (sortDesc ? '-' : '+') + sortKey)
        return queryParams.toString();
    };

    return (
        <>
            <h3>Users</h3>
            <Form.Check type='radio' id='uy' key='uy' label='Self only' checked={selfOnly}
                        onChange={() => setSelfOnly(true)}/>
            <Form.Check type='radio' id='un' key='un' label='Include friends' checked={!selfOnly}
                        onChange={() => setSelfOnly(false)}/>
            <h3>Gyms</h3>
            <MultiSelect options={gymOptions}
                         onChange={setGymIds}/>

            <h3>Styles</h3>
            <MultiSelect options={styleOptions}
                         onChange={setAllowedTypes}/>

            <h3>Include partial completions?</h3>
            <Form.Check type='radio' id='py' key='py' label='Include Partials' checked={allowPartials}
                        onChange={() => setAllowPartials(true)}/>
            <Form.Check type='radio' id='pn' key='pn' label='Ignore Partials' checked={!allowPartials}
                        onChange={() => setAllowPartials(false)}/>

            <h3>Sort by:</h3>
            {
                entries(sortOptions).map(([field, {label}], idx) =>
                    <Form.Check type='radio' key={idx} label={label}
                                checked={sortKey === field}
                                onChange={() => setSortKey(field)}/>
                )
            }

            <h3>Sort direction:</h3>
            <Form.Check type='radio' label='Ascending' checked={!sortDesc}
                        onChange={() => setSortDesc(false)}/>
            <Form.Check type='radio' label='Descending' checked={sortDesc}
                        onChange={() => setSortDesc(true)}/>

            <Button href={`${returnUrl}?${generateQueryParams()}`}>Confirm</Button>
        </>
    );
};

export default RouteFilters