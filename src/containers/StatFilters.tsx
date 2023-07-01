import React, {useEffect, useState} from 'react';
import {isLoaded} from 'react-redux-firebase'
import {useLocation} from 'react-router-dom';
import {Button, Form} from 'react-bootstrap';
import {ALL_STYLES, printType} from '../helpers/gradeUtils';
import {getUserName} from '../helpers/filterUtils';
import {getBooleanFromQuery} from './StatsContainer';
import {getUser, useDatabase} from "../redux/selectors";

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
    const { uid } = getUser()
    const firebaseState = useDatabase()
    const gyms = firebaseState.gyms.getOrdered(['viewer', uid])
    const user = firebaseState.users.getOne(uid)
    const friends = firebaseState.users.getOrdered(['friendOf', uid])

    const query = new URLSearchParams(useLocation().search);


    const [gymIds, setGymIds] = useState<string[]>(defaultIfEmpty(query.getAll('gyms'), []));
    const [uids, setUids] = useState<string[]>(defaultIfEmpty(query.getAll('uids'), []));

    const [allowSuffixes, setAllowSuffixes] = useState(getBooleanFromQuery(query, 'allowSuffixes'));
    const [allowPartials, setAllowPartials] = useState(getBooleanFromQuery(query, 'allowPartials', true));

    const [allowedTypes, setAllowedTypes] = useState(defaultIfEmpty(query.getAll('allowedTypes'), ALL_STYLES));

    useEffect(() => {
        if (isLoaded(gyms) && gymIds.length === 0) {
            setGymIds(gyms.map(gym => gym.key))
        }
    }, [gyms])

    useEffect(() => {
        if (isLoaded(user) && uids.length === 0) {
            setUids(user.friends)
        }
    }, [user])

    if (!isLoaded(gyms) || !isLoaded(user) || !isLoaded(friends)) {
        return <>Loading</>
    }

    const returnUrl = query.get('ref') || '/stats';

    const userOptions = friends.map(u => u.value).map(u => ({
        key: u.uid,
        label: getUserName(u),
        checked: uids.includes(u.uid)
    }));

    const gymOptions = gyms.map(({key, value}) => ({
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

            <Button href={`${returnUrl}?${generateQueryParams()}`}>Confirm</Button>
        </>
    );
};

export default StatFilters