import InputSlider from "../components/InputSlider";
import React from "react";
import {categories, MAX_INTENSITY} from "../helpers/workouts";
import {Form} from "react-bootstrap";

const IntensityPicker = ({value, onChange}) => {
    console.log('intesnity picker', value)
    return <InputSlider min={1} max={MAX_INTENSITY} step={1} value={value} toString={x => x} onChange={onChange}/>
}

const CategoryPicker = ({value, onChange}) => {
    const onCategoryChange = (category) => ({target: {checked}}) => {
        if (checked) {
            const newCategories = [...new Set([...value, category])]
            onChange(newCategories)
        } else {
            const newCategories = [...value].filter(c => c !== category)
            onChange(newCategories)
        }
    }

    return (
        <>
            {
                categories.map((category, idx) => (
                        <Form.Check checked={value.includes(category)} label={category}
                                    onChange={onCategoryChange(category)} key={idx}/>
                    )
                )
            }
        </>
    )
}

export const workoutFields = [
    {
        title: 'Intensity',
        name: 'intensity',
        options: {
            type: 'custom',
            component: IntensityPicker
        }
    },
    {
        title: 'Categories',
        name: 'categories',
        options: {
            type: 'custom',
            component: CategoryPicker
        }
    }
]

export const validateWorkoutFields = ({categories}) => !categories || categories.length === 0