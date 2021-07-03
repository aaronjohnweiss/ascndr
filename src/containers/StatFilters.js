import React, { useState } from 'react';
import { compose } from 'redux';
import { firebaseConnect } from 'react-redux-firebase';
import { connect } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { Button, Form } from 'react-bootstrap';
import resolveUsers from '../helpers/resolveUsers';
import { ALL_STYLES, printType } from '../helpers/gradeUtils';
import { getGroupsForUser, getGymsForGroups } from '../helpers/filterUtils';

export const filtersLink = (location) => `/stats/filters${location.search ? location.search + '&' : '?'}ref=${location.pathname}`;

const MultiSelect = ({options, onChange}) => {
    return <>
        {options.map(({key, label, checked}, idx) => (
            <Form.Check id={key} key={key} checked={checked}
                        onChange={() => onChange(key, !checked)} label={label} />
        ))}
    </>
};

const defaultIfEmpty = (a1, a2) => {
    if (!a1 || a1.length === 0) return a2;
    return a1;
};

const StatFilters = ({auth, groups, users, gyms}) => {
    const query = new URLSearchParams(useLocation().search);

    const groupsForUser = getGroupsForUser(groups, auth.uid);
    const allowedUids = [...new Set(groupsForUser.flatMap(group => group.value.users))];
    const visibleUsers = resolveUsers(users, allowedUids);
    const visibleGyms = getGymsForGroups(gyms, groupsForUser);
    const [gymIds, setGymIds] = useState(defaultIfEmpty(query.getAll('gyms'), visibleGyms.map(gym => gym.key)));
    const [uids, setUids] = useState(defaultIfEmpty(query.getAll('uids'), allowedUids));

    const [allowSuffixes, setAllowSuffixes] = useState(query.get('allowSuffixes')  === 'true');

    const [allowedTypes, setAllowedTypes] = useState(defaultIfEmpty(query.getAll('allowedTypes'), ALL_STYLES));

    const returnUrl = query.get('ref') || '/stats';


    const onChange = (setter) => (key, isSelected) => setter((arr) => {
        if (isSelected) {
            return [...arr, key];
        } else {
            return [...arr].filter(id => id !== key);
        }
    });

    const userOptions = visibleUsers.map(({name, uid}) => ({
        key: uid,
        label: name,
        checked: uids.includes(uid)
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
        queryParams.append('allowSuffixes', allowSuffixes);
        return queryParams.toString();
    };

    return (
        <>
            <h3>Users</h3>
            <MultiSelect options={userOptions}
                         onChange={onChange(setUids)} />
            <h3>Gyms</h3>
            <MultiSelect options={gymOptions}
                         onChange={onChange(setGymIds)} />

            <h3>Styles</h3>
            <MultiSelect options={styleOptions}
                         onChange={onChange(setAllowedTypes)} />

            <h3>Include sub-grades?</h3>
            <Form.Check type='radio' id='y' key='y' label='Include +/-' checked={allowSuffixes} onChange={() => setAllowSuffixes(true)}/>
            <Form.Check type='radio' id='n' key='n' label='Ignore +/-' checked={!allowSuffixes} onChange={() => setAllowSuffixes(false)}/>

            <Button href={`${returnUrl}?${generateQueryParams()}`}>Confirm</Button>
        </>
    );
};

const mapStateToProps = (state) => {
    return {
        auth: state.auth,
        gyms: state.firebase.ordered.gyms,
        groups: state.firebase.ordered.groups,
        users: state.firebase.data.users
    }
};

export default compose(
    firebaseConnect([
        {path: 'gyms'},
        {path: 'groups'},
        {path: 'users'}
    ]),
    connect(mapStateToProps)
)(StatFilters)