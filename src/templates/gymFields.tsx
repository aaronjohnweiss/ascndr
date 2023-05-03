import {ALL_STYLES, printType} from '../helpers/gradeUtils';
import {GymPicker} from "../components/GymPicker";
import React from "react";

export const gymFields = [
    {
        title: 'Gym Name',
        placeholder: 'Name..',
        name: 'name'
    },
    {
        title: 'Gym Location',
        placeholder: 'Location..',
        name: 'location',
        options: {
            type: 'text'
        }
    },
    ...ALL_STYLES.map(style => {
        return {
            title: `Wall height (${printType(style)})` ,
            placeholder: 'Height..',
            name: `${style}_HEIGHT`,
            options: {
                type: 'number'
            }
        }
    })
]

export const migrateGymFields = ({gyms}) => [
    {
        title: 'Gym',
        name: 'gymId',
        options: {
            type: 'custom',
            component: ({value, onChange})  => <GymPicker gyms={gyms} gymId={value} onChange={onChange} />,
        }
    }
]