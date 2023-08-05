import {
  defaultState,
  mockFirebase,
  mountWithProviders,
  routeKey,
  session,
  sessionKey,
  setupMockFirebase,
} from '../../redux/__tests__/reducer-test-helper'
import SessionPage from '../SessionPage'
import { LEAD, TOP_ROPE } from '../../helpers/gradeUtils'
import { Grade } from '../../types/Grade'
import moment from 'moment'

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

  it('should render for an ended session', () => {
    const preloadedState = {
      ...defaultState,
    }

    preloadedState.firebase.ordered.sessions = [
      {
        key: sessionKey,
        value: {
          ...session,
          endTime: moment().add(1, 'hour').valueOf(),
        },
      },
    ]
    expect(
      mountWithProviders(SessionPage, { routerParams, reduxParams: { preloadedState } }).component,
    ).toMatchSnapshot()
  })

  describe('editing route count', () => {
    const grade: Grade = {
      difficulty: 8,
      style: TOP_ROPE,
    }
    const initialCount = 2
    const preloadedState = {
      ...defaultState,
    }

    beforeEach(() => {
      preloadedState.firebase.ordered.sessions = [
        {
          key: sessionKey,
          value: {
            ...session,
            standardRoutes: [
              {
                key: grade,
                count: initialCount,
                partials: {
                  25: initialCount,
                },
              },
            ],
            customRoutes: [
              {
                key: routeKey,
                count: initialCount,
                partials: {
                  25: initialCount,
                },
              },
            ],
          },
        },
      ]
    })

    describe.each([
      ['customRoutes', routeKey, routeKey],
      ['standardRoutes', grade, '5.8'],
    ])('%s', (type, key, id) => {
      it.each([
        [
          `quick-adding route`,
          id,
          'plus',
          expect.objectContaining({
            key,
            count: initialCount + 1,
          }),
        ],
        [
          `quick-removing route`,
          id,
          'minus',
          expect.objectContaining({
            key,
            count: initialCount - 1,
          }),
        ],
        [
          `quick-adding partial route`,
          `${id}-25`,
          'plus',
          expect.objectContaining({
            key,
            partials: {
              25: initialCount + 1,
            },
          }),
        ],
        [
          'quick-removing partial route',
          `${id}-25`,
          'minus',
          expect.objectContaining({
            key,
            partials: {
              25: initialCount - 1,
            },
          }),
        ],
      ])('should allow %s', (description, rowId, buttonType, expectedRoute) => {
        const wrapper = mountWithProviders(SessionPage, {
          routerParams,
          reduxParams: { preloadedState },
        }).wrapper

        wrapper
          .find(`div[data-test="${rowId}"]`)
          .find(`Button.${buttonType}`)
          .first()
          .simulate('click')

        expect(mockFirebase.update).toHaveBeenCalledWith(
          `sessions/${sessionKey}`,
          expect.objectContaining({
            [type]: [expectedRoute],
          }),
        )
      })
    })

    it('should allow adding standard route through modal', () => {
      const wrapper = mountWithProviders(SessionPage, {
        routerParams,
        reduxParams: { preloadedState },
      }).wrapper

      const gradeToAdd: Grade = {
        difficulty: 11,
        style: 'LEAD',
      }

      const percentage = 50
      wrapper.find('GradeModal').invoke('handleSubmit')({ ...gradeToAdd, percentage })

      expect(mockFirebase.update).toHaveBeenCalledWith(
        `sessions/${sessionKey}`,
        expect.objectContaining({
          standardRoutes: expect.arrayContaining([
            expect.objectContaining({
              key: gradeToAdd,
              partials: {
                [percentage]: 1,
              },
            }),
          ]),
        }),
      )
    })

    it('should allow adding custom route through modal', () => {
      const wrapper = mountWithProviders(SessionPage, {
        routerParams,
        reduxParams: { preloadedState },
      }).wrapper

      const newCustomRouteKey = 'customRoute123'

      const percentage = 75
      wrapper.find('CustomRouteModal').invoke('handleSubmit')({
        key: newCustomRouteKey,
        percentage,
      })

      expect(mockFirebase.update).toHaveBeenCalledWith(
        `sessions/${sessionKey}`,
        expect.objectContaining({
          customRoutes: expect.arrayContaining([
            expect.objectContaining({
              key: newCustomRouteKey,
              partials: {
                [percentage]: 1,
              },
            }),
          ]),
        }),
      )
    })
  })

  it('should allow ending the session', () => {
    const wrapper = mountWithProviders(SessionPage, { routerParams }).wrapper

    const endSessionSelector = 'ConfirmCancelButton[buttonText="End session"]'
    wrapper.find(endSessionSelector).invoke('handleConfirm')()

    expect(mockFirebase.update).toHaveBeenCalledWith(
      `sessions/${sessionKey}`,
      expect.objectContaining({
        endTime: moment().valueOf(),
      }),
    )
  })
})
