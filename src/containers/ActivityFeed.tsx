import React, {useEffect, useState} from 'react'
import {getUser, useDatabase} from "../redux/selectors/selectors";
import {isLoaded} from 'react-redux-firebase'
import InfiniteScroll from "react-infinite-scroll-component";
import {useHistory, useLocation} from "react-router-dom";
import {getNumberFromQuery, getQuery} from "../helpers/queryParser";
import {buildFeedData, FeedItem} from "../helpers/activityFeedBuilder";
import FeedItemCard from "../components/activity-feed/FeedItemCard";


const PAGE_SIZE = 20
const DEFAULT_ITEMS = PAGE_SIZE * 3

const ActivityFeed = () => {
    const {uid} = getUser()
    const firebaseState = useDatabase()
    const gyms = firebaseState.gyms.getOrdered(['viewer', uid])
    const sessions = firebaseState.sessions.getOrdered(['viewer', uid])
    const users = firebaseState.users.getOrdered(['friendOf', uid])
    const routes = firebaseState.routes.getOrdered(['viewer', uid])
    const workouts = firebaseState.workouts.getOrdered(['viewer', uid])

    const history = useHistory()
    const location = useLocation()

    const [feedLength, setFeedLength] = useState(getNumberFromQuery(getQuery(location), 'n', DEFAULT_ITEMS))

    const [feedData, setFeedData] = useState<FeedItem[]>([])

    useEffect(
        () => {
            history.replace({pathname: location.pathname, search: `?n=${feedLength}`})
        }, [feedLength]
    )

    // Load the activity feed once all other data are loaded. Note this will not refresh in case of new content
    useEffect(
        () => {
            if (isLoaded(gyms) && isLoaded(sessions) && isLoaded(users) && isLoaded(routes) && isLoaded(workouts) && feedData.length === 0) {
                setFeedData(buildFeedData(uid, gyms, sessions, users, routes, workouts))
            }
        }, [
            gyms,
            sessions,
            users,
            routes,
            workouts,
            feedData
        ]
    )

    if (!isLoaded(gyms) || !isLoaded(sessions) || !isLoaded(users) || !isLoaded(routes) || !isLoaded(workouts)) return <></>

    return (
        <div className='activity-feed'>
            <InfiniteScroll next={() => setFeedLength((len) => len + PAGE_SIZE)} hasMore={feedLength < feedData.length}
                            dataLength={feedLength} loader={<></>}>
                {feedData.slice(0, feedLength).map((feedItem, idx) => (
                    <FeedItemCard key={idx} feedItem={feedItem} uid={uid} gyms={gyms} sessions={sessions} users={users}
                                  routes={routes} workouts={workouts}/>
                ))}
            </InfiniteScroll>
        </div>
    )

}

export default ActivityFeed
