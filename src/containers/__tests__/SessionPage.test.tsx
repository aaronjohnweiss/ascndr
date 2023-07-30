import {
  mountWithProviders,
  sessionKey,
  setupMockFirebase,
} from '../../redux/__tests__/reducer.test'
import SessionPage from '../SessionPage'

describe('SessionPage', () => {
  beforeEach(() => {
    setupMockFirebase()
  })

  const routerParams = {
    path: `/sessions/:id`,
    route: `/sessions/${sessionKey}`,
  }

  it('should render', () => {
    expect(mountWithProviders(SessionPage, { routerParams }).component).toMatchSnapshot()
  })
})
