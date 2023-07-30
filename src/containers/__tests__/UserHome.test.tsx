import { mountWithProviders } from '../../redux/__tests__/reducer.test'
import UserHome from '../UserHome'

describe('UserHome', () => {
  it('should render', () => {
    expect(mountWithProviders(UserHome).component).toMatchSnapshot()
  })
})
