import React from 'react'
import { Persisted } from '../../types/Firebase'
import { Workout } from '../../types/Workout'

interface Props {
  workout: Persisted<Workout>
}

export const WorkoutCardBody = ({ workout }: Props) => {
  return (
    <>
      Workout Session (Intensity - {workout.value.intensity}) <br />
      {workout.value.categories.join(', ')}
    </>
  )
}
