import React, {useState} from 'react'
import GradeModal from '../components/GradeModal'
import {Button, Form} from 'react-bootstrap'
import {prettyPrint} from '../helpers/gradeUtils'
import {dateString} from "../helpers/dateUtils";
import {Field} from "../components/EntityModal";
import {Route, RouteVideo} from "../types/Route";

const SetRouteGrade = ({ value, onChange }) => {
    const [show, setShow] = useState(false)

    return (
        <div>
            {value && prettyPrint(value) || 'None'}
            <Button onClick={() => setShow(!show)} variant='link'>
                {value && 'Edit' || 'Set'}
            </Button>
            <GradeModal show={show}
                        handleClose={() => setShow(false)}
                        handleSubmit={(value) => {
                            onChange(value)
                            setShow(false)
                        }}
                        allowPartial={false}
                        title='Set route grade'/>
        </div>
    )
}

export const DatePicker = ({value, onChange}) => (<Form.Control
    onChange={(evt) => onChange(new Date(evt.target.value).getTime())}
    value={value ? dateString(value) : ''}
    type='date'/>)

export const routeCreateFields: Field<Route>[] = [
    {
        title: 'Route Name',
        placeholder: 'Name..',
        name: 'name'
    },
    {
        title: 'Description',
        placeholder: 'Description..',
        name: 'description',
        options: {
            type: 'text'
        }
    },
    {
        title: 'Route Grade',
        name: 'grade',
        options: {
            type: 'custom',
            component: SetRouteGrade
        }
    },
    {
        title: 'Route Color',
        placeholder: 'Color..',
        name: 'color'
    },
    {
        title: 'Routesetter',
        placeholder: 'Setter..',
        name: 'setter'
    },
    {
        title: 'Route Image',
        name: 'picture',
        options: {
            type: 'file',
            accept: 'image/*'
        }
    }
]

export const routeUpdateFields: Field<Route>[] = [...routeCreateFields,
    {
        title: 'Retired',
        name: 'isRetired',
        options: {
            type: 'checkbox'
        }
    }
]

export const routeVideoFields: Field<RouteVideo>[] = [
    {
        title: 'URL',
        name: 'url',
        placeholder: 'https://...'
    },
    {
        title: 'Date',
        name: 'date',
        options: {
            type: 'custom',
            component: DatePicker
        }
    }
]