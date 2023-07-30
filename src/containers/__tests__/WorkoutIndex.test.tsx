import {
  mockFirebase,
  mountWithProviders,
  setupMockFirebase,
  user,
} from '../../redux/__tests__/reducer.test'
import WorkoutIndex from '../WorkoutIndex'
import { WORKOUT_CATEGORIES } from '../../helpers/workouts'

describe('WorkoutIndex', () => {
  beforeEach(() => {
    setupMockFirebase()
  })

  it('should render', () => {
    expect(mountWithProviders(WorkoutIndex).component).toMatchSnapshot()
  })

  it('should allow adding a workout', () => {
    const wrapper = mountWithProviders(WorkoutIndex).wrapper

    const intensity = 3
    const categories = WORKOUT_CATEGORIES.filter((category, idx) => idx % 2 === 0)

    wrapper.find('Button#add-workout').simulate('click')
    const modal = wrapper.find('EntityModal')
    modal.find('IntensityPicker').invoke('onChange')(intensity)
    modal.find('CategoryPicker').invoke('onChange')(categories)
    modal.find('Button#modal-submit').simulate('click')

    expect(mockFirebase.push).toHaveBeenCalledWith(
      `workouts`,
      expect.objectContaining({
        uid: user.uid,
        intensity,
        categories,
      }),
    )
  })
})
