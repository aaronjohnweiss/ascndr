import { CalendarMode, defaultUser } from '../../types/User'
import { ActivityCalendarSettingsModal } from '../ActivityCalendarSettingsModal'
import { shallow, mount } from 'enzyme'
import toJson from 'enzyme-to-json'

describe('activity calendar settings', () => {
  const friends = Array.from({ length: 5 }, (_, i) =>
    defaultUser({ uid: `uid${i}`, name: `user ${i}` }),
  )

  const user = defaultUser({
    uid: 'user',
    friends: friends.map(f => f.uid),
  })

  const handleClose = jest.fn()
  const handleSubmit = jest.fn()
  const defaultProps = () => ({
    user,
    friends,
    show: true,
    handleClose,
    handleSubmit,
  })

  it('should render with default preferences', () => {
    const wrapper = shallow(<ActivityCalendarSettingsModal {...defaultProps()} />)
    expect(toJson(wrapper)).toMatchSnapshot()
  })

  it('should render with custom user preferences', () => {
    const props = {
      ...defaultProps(),
      user: {
        ...user,
        preferences: {
          activityCalendar: {
            friends: user.friends.slice(0, 2),
            includeWorkouts: true,
            mode: CalendarMode.FRIENDS,
            splitWorkouts: false,
          },
        },
      },
    }

    const wrapper = shallow(<ActivityCalendarSettingsModal {...props} />)
    expect(toJson(wrapper)).toMatchSnapshot()
  })

  it('should be hidden when passed show=false', () => {
    const props = {
      ...defaultProps(),
      show: false,
    }

    const wrapper = shallow(<ActivityCalendarSettingsModal {...props} />)
    expect(toJson(wrapper)).toMatchSnapshot()
  })

  it('should update user state based off of form input', () => {
    const props = {
      ...defaultProps(),
      user: {
        ...user,
        preferences: {
          activityCalendar: {
            mode: CalendarMode.USER_ONLY,
            includeWorkouts: false,
            friends: [],
          },
        },
      },
    }
    const wrapper = shallow(<ActivityCalendarSettingsModal {...props} />)

    wrapper
      .find('FormCheck[label="Include friends"]')
      .simulate('change', { target: { checked: true } })
    wrapper
      .find('FormCheck[label="Include workouts"]')
      .simulate('change', { target: { checked: true } })

    const selectedUids = user.friends.slice(0, 2)
    wrapper.find('MultiSelect').simulate('change', selectedUids)

    wrapper.find('Button[variant="primary"]').simulate('click')

    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: CalendarMode.FRIENDS,
        includeWorkouts: true,
        splitWorkouts: true,
        friends: selectedUids,
      }),
    )
  })
})
