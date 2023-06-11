import React, {useState} from 'react'
import {Button, ListGroup} from 'react-bootstrap'

interface Props {
    children: JSX.Element[]
    pageSize: number
    initialSize?: number
}
const TruncatedList = ({ children = [], pageSize, initialSize = pageSize }: Props) => {
    const [numItems, setNumItems] = useState(initialSize || children.length);

    const onShowMore = () => {
        if (numItems < pageSize) {
            setNumItems(pageSize);
        } else {
            setNumItems(numItems + pageSize);
        }
    }

    return (
        <>
            <ListGroup>
                {children.slice(0, numItems)}
            </ListGroup>
            {numItems < children.length &&
            <Button variant='link' onClick={onShowMore}>
                Show more
            </Button>
            }
        </>
    )
}

export default TruncatedList