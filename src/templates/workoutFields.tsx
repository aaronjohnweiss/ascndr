import InputSlider from '../components/InputSlider'
import React from 'react'
import { MAX_INTENSITY, WORKOUT_CATEGORIES } from '../helpers/workouts'
import { Form } from 'react-bootstrap'
import { distinct } from '../helpers/filterUtils'
import { Field } from '../components/EntityModal'
import { Workout } from '../types/Workout'
import { DatePicker } from './sessionFields'

const IntensityPicker = ({ value, onChange }) => {
  return <InputSlider min={1} max={MAX_INTENSITY} step={1} value={value} onChange={onChange} />
}

const CategoryPicker = ({ value, onChange }) => {
  const onCategoryChange =
    category =>
    ({ target: { checked } }) => {
      if (checked) {
        const newCategories = distinct([...value, category])
        onChange(newCategories)
      } else {
        const newCategories = [...value].filter(c => c !== category)
        onChange(newCategories)
      }
    }

  return (
    <>
      {WORKOUT_CATEGORIES.map((category, idx) => (
        <Form.Check
          checked={value.includes(category)}
          label={category}
          onChange={onCategoryChange(category)}
          key={idx}
        />
      ))}
    </>
  )
}

export const workoutFields: Field<Workout>[] = [
  {
    title: 'Intensity',
    name: 'intensity',
    options: {
      type: 'custom',
      component: IntensityPicker,
    },
  },
  {
    title: 'Categories',
    name: 'categories',
    options: {
      type: 'custom',
      component: CategoryPicker,
    },
  },
  {
    title: 'Date',
    name: 'startTime',
    options: {
      type: 'custom',
      component: DatePicker,
    },
  },
]

export const validateWorkoutFields = ({ categories }) => [
  {
    isValid: categories && categories.length > 0,
    message: 'Must choose at least 1 category',
    field: 'categories',
  },
]
