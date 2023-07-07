import React, {useEffect, useState} from 'react';
import {isLoaded, useFirebaseConnect} from 'react-redux-firebase'
import {useLocation} from 'react-router-dom';
import {Button, Form} from 'react-bootstrap';
import {ALL_STYLES, printType} from '../helpers/gradeUtils';
import {findUser, getFriendsForUser, getGymsForUser, getUserName} from '../helpers/filterUtils';
import {getBooleanFromQuery} from './StatsContainer';
import {firebaseState, getUser} from "../redux/selectors";
import {LinkContainer} from 'react-router-bootstrap'

export const filtersLink = (location) => `/stats/filters${location.search ? location.search + '&' : '?'}ref=${location.pathname}`;

export const MultiSelect = ({options, onChange}) => {
    const onCheckboxChange = (key, isSelected) => {
        let arr = options.filter(opt => opt.checked).map(opt => opt.key)
        if (isSelected) {
            arr = [...arr, key];
        } else {
            arr = [...arr].filter(id => id !== key);
        }
        onChange(arr)
    };
    return <>
        {options.map(({key, label, checked}) => (
            <Form.Check id={key} key={key} checked={checked}
                        onChange={() => onCheckboxChange(key, !checked)} label={label}/>
        ))}
    </>
};

const defaultIfEmpty = (a1, a2) => {
    if (!a1 || a1.length === 0) return a2;
    return a1;
};

const StatFilters = () => {
    useFirebaseConnect([
        'gyms',
        'users'
    ])

    const { uid } = getUser()
    const gyms = firebaseState.gyms.getOrdered()
    const users = firebaseState.users.getOrdered()

    const query = new URLSearchParams(useLocation().search);


    const [gymIds, setGymIds] = useState<string[]>(defaultIfEmpty(query.getAll('gyms'), []));
    const [uids, setUids] = useState<string[]>(defaultIfEmpty(query.getAll('uids'), []));

    const [allowSuffixes, setAllowSuffixes] = useState(getBooleanFromQuery(query, 'allowSuffixes'));
    const [allowPartials, setAllowPartials] = useState(getBooleanFromQuery(query, 'allowPartials', true));

    const [allowedTypes, setAllowedTypes] = useState(defaultIfEmpty(query.getAll('allowedTypes'), ALL_STYLES));

    useEffect(() => {
        if (isLoaded(gyms) && isLoaded(users) && gymIds.length === 0) {
            setGymIds(getGymsForUser(gyms, users, uid).map(gym => gym.key))
        }
    }, [gyms])

    useEffect(() => {
        if (isLoaded(users) && uids.length === 0) {
            setUids(getFriendsForUser(findUser(users, uid), users).map(user => user.uid))
        }
    })

    if (!isLoaded(gyms) || !isLoaded(users)) {
        return <>Loading</>
    }

    const user = findUser(users, uid);
    const visibleUsers = [user, ...getFriendsForUser(user, users)];
    const visibleGyms = getGymsForUser(gyms, users, uid);

    const returnUrl = query.get('ref') || '/stats';

    const userOptions = visibleUsers.map(u => ({
        key: u.uid,
        label: getUserName(u),
        checked: uids.includes(u.uid)
    }));

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
        uids.forEach(id => queryParams.append('uids', id));
        allowedTypes.forEach(type => queryParams.append('allowedTypes', type));
        queryParams.append('allowSuffixes', `${allowSuffixes}`);
        queryParams.append('allowPartials', `${allowPartials}`);
        return queryParams.toString();
    };

    return (
        <>
            <h3>Users</h3>
            <MultiSelect options={userOptions}
                         onChange={setUids}/>
            <h3>Gyms</h3>
            <MultiSelect options={gymOptions}
                         onChange={setGymIds}/>

            <h3>Styles</h3>
            <MultiSelect options={styleOptions}
                         onChange={setAllowedTypes}/>

            <h3>Include sub-grades?</h3>
            <Form.Check type='radio' id='sy' key='sy' label='Include +/-' checked={allowSuffixes}
                        onChange={() => setAllowSuffixes(true)}/>
            <Form.Check type='radio' id='sn' key='sn' label='Ignore +/-' checked={!allowSuffixes}
                        onChange={() => setAllowSuffixes(false)}/>

            <h3>Include partial completions?</h3>
            <Form.Check type='radio' id='py' key='py' label='Include Partials' checked={allowPartials}
                        onChange={() => setAllowPartials(true)}/>
            <Form.Check type='radio' id='pn' key='pn' label='Ignore Partials' checked={!allowPartials}
                        onChange={() => setAllowPartials(false)}/>

            <LinkContainer to={`${returnUrl}?${generateQueryParams()}`}><Button>Confirm</Button></LinkContainer>
        </>
    );
};

export default StatFilters