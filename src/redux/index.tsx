import rootReducer, { AppState } from './reducer'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import { applyMiddleware, createStore } from 'redux'
import thunkMiddleware from 'redux-thunk'

export const store = createStore(rootReducer, undefined, applyMiddleware(thunkMiddleware))
export type AppDispatch = typeof store.dispatch
export type DispatchFunc = () => AppDispatch
export const useAppDispatch: DispatchFunc = useDispatch
export const useAppSelector: TypedUseSelectorHook<AppState> = useSelector
