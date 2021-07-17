import React, { useState } from 'react'
import GradeModal from '../components/GradeModal'
import { Button } from 'react-bootstrap'
import { prettyPrint } from '../helpers/gradeUtils'

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

export const routeCreateFields = [
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
        title: 'Route Image',
        name: 'picture',
        options: {
            type: 'file',
            accept: 'image/*'
        }
    }
]

export const routeUpdateFields = [...routeCreateFields,
    {
        title: 'Retired',
        name: 'isRetired',
        options: {
            type: 'checkbox'
        }
    }
]