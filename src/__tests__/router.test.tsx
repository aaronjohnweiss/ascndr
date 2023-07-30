import { MemoryRouter, Route, Router } from 'react-router-dom'
import React from 'react'

export type RouterParams = {
  path?: string
  route?: string
  initialEntries?: string[]
}
export const wrapWithRouter = (
  ui: React.ReactElement,
  { path = '/', route = '/', initialEntries = [route] }: RouterParams = {},
): React.ReactElement => (
  <MemoryRouter initialEntries={initialEntries} keyLength={0}>
    <Route path={path} component={ui} />
  </MemoryRouter>
)
