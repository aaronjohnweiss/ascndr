import React from 'react'
import UserHome from './UserHome'
import GenericHome from './GenericHome'
import { useAppSelector } from '../redux/index'

export const Home = () => {
  const authenticated = useAppSelector(state => state.auth)
  if (authenticated === false) return <>Loading</>
  return authenticated ? <UserHome /> : <GenericHome />
}

export default Home
