import {ALL_STYLES, printType} from '../helpers/gradeUtils';
import {GymPicker} from "../components/GymPicker";
import React from "react";
import {Field} from "../components/EntityModal";
import {Gym} from "../types/Gym";

export const gymFields: Field<Gym>[] = [
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
            name: `${style}_HEIGHT` as keyof Gym,
            options: {
                type: 'number' as const
            }
        }
    })
]

interface MigrateGym {
    gymId: string
}
export const migrateGymFields = ({gyms}): Field<MigrateGym>[] => [
    {
        title: 'Gym',
        name: 'gymId',
        options: {
            type: 'custom',
            component: ({value, onChange})  => <GymPicker gyms={gyms} gymId={value} onChange={onChange} />,
        }
    }
]