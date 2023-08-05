import { mountWithProviders } from '../../redux/__tests__/reducer-test-helper'
import UserHome from '../UserHome'

describe('UserHome', () => {
  it('should render', () => {
    expect(mountWithProviders(UserHome).component).toMatchSnapshot()
  })
})
