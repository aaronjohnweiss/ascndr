import {
  defaultState,
  mockFirebase,
  mountWithProviders,
  setupMockFirebase,
  user,
  userKey,
} from '../../redux/__tests__/reducer-test-helper'
import UserPage from '../UserPage'
import { defaultUser } from '../../types/User'

describe('UserPage', () => {
  beforeEach(() => {
    setupMockFirebase()
  })

  it('should render', () => {
    expect(mountWithProviders(UserPage).component).toMatchSnapshot()
  })

  it('should allow adding a friend', () => {
    const state = { ...defaultState }
    const newFriendUid = 'newFriend'
    state.firebase.ordered.users.push({
      key: 'newFriendKey',
      value: defaultUser({ uid: newFriendUid }),
    })

    const wrapper = mountWithProviders(UserPage, { reduxParams: { preloadedState: state } }).wrapper

    wrapper.find('Button[data-test="add-friend"]').simulate('click')
    const modal = wrapper.find('EntityModal[title="Add friend"]')
    modal
      .find('input[data-test="userValue"]')
      .simulate('change', { target: { value: newFriendUid } })
    modal.find('Button[data-test="modal-submit"]').simulate('click')

    expect(mockFirebase.update).toHaveBeenCalledWith(
      `users/${userKey}`,
      expect.objectContaining({
        ...user,
        friends: [...user.friends, newFriendUid],
      }),
    )
  })

  it('should allow updating user', () => {
    const newName = 'New user name'

    const wrapper = mountWithProviders(UserPage).wrapper

    wrapper.find('Button[data-test="edit-user"]').simulate('click')
    const modal = wrapper.find('EntityModal[title="Edit User"]')
    modal.find('input[data-test="name"]').simulate('change', { target: { value: newName } })
    modal.find('Button[data-test="modal-submit"]').simulate('click')

    expect(mockFirebase.update).toHaveBeenCalledWith(
      `users/${userKey}`,
      expect.objectContaining({
        ...user,
        name: newName,
      }),
    )
  })
})
