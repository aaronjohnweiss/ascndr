import React, { useState } from 'react'
import { Button, ListGroup } from 'react-bootstrap'

const TruncatedList = ({ children = [], pageSize }) => {
    const [numItems, setNumItems] = useState(pageSize || children.length)

    return (
        <>
            <ListGroup>
                {children.slice(0, numItems)}
            </ListGroup>
            {numItems < children.length &&
            <Button variant='link' onClick={() => setNumItems(numItems + pageSize)}>
                Show more
            </Button>
            }
        </>
    )
}

export default TruncatedList