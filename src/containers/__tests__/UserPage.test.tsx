import { mount } from 'enzyme'
import {
  defaultState,
  mockFirebase,
  setupMockFirebase,
  user,
  userKey,
  wrapWithProviders,
} from '../../redux/__tests__/reducer.test'
import UserPage from '../UserPage'
import { defaultUser } from '../../types/User'

describe('UserPage', () => {
  beforeEach(() => {
    setupMockFirebase()
  })

  it('should render', () => {
    expect(mount(wrapWithProviders(<UserPage />).wrapper)).toMatchSnapshot()
  })

  it('should allow adding a friend', () => {
    const state = { ...defaultState }
    const newFriendUid = 'newFriend'
    state.firebase.ordered.users.push({
      key: 'newFriendKey',
      value: defaultUser({ uid: newFriendUid }),
    })

    const wrapper = mount(wrapWithProviders(<UserPage />, { preloadedState: state }).wrapper)

    wrapper.find('Button#add-friend').simulate('click')
    const modal = wrapper.find('EntityModal[title="Add friend"]')
    modal.find('input#userValue').simulate('change', { target: { value: newFriendUid } })
    modal.find('Button#modal-submit').simulate('click')

    expect(mockFirebase.update).toHaveBeenCalledWith(
      `users/${userKey}`,
      expect.objectContaining({
        ...user,
        friends: [...user.friends, newFriendUid],
      }),
    )
  })
})
