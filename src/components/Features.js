import React, {Component, Fragment} from "react";
import {Card} from "react-bootstrap";
import {
    FaAngleDoubleRight,
    FaPlus,
    FaRegBuilding,
    FaRegCalendar,
    FaRegCalendarAlt,
    FaRegFileAlt,
    FaWalking
} from "react-icons/fa";

class Features extends Component {
    render() {
        return (
            <Fragment>
                <h3> Features </h3>
                <Card className='text-center'>
                    <Card.Title>Gyms</Card.Title>
                    <Card.Body><FaRegBuilding className='text-muted' size={'4em'}/><FaWalking style={{verticalAlign: 'bottom'}} size={'1.5em'}/> <FaAngleDoubleRight style={{verticalAlign: 'bottom'}} size={'1.5em'}/> <FaRegBuilding size={'4em'}/> <FaRegBuilding className='text-muted' size={'4em'}/></Card.Body>
                    <Card.Footer> View performance specific to the gyms you visit.</Card.Footer>
                </Card>
                <Card className='text-center'>
                    <Card.Title>Climbing Sessions</Card.Title>
                    <Card.Body><FaRegCalendar size={'4em'}/> <FaAngleDoubleRight className='text-muted' size={'2em'}/> <FaPlus size={'1.5em'}/> <FaAngleDoubleRight className='text-muted' size={'2em'}/> <FaRegCalendarAlt  size={'4em'}/></Card.Body>
                    <Card.Footer> Add sessions to track your progress over time.</Card.Footer>
                </Card>
                <Card className='text-center'>
                    <Card.Title>Define Routes</Card.Title>
                    <Card.Body><FaRegFileAlt size={'4em'}/> <FaPlus className='text-muted' size={'2em'}/></Card.Body>
                    <Card.Footer> Love a route? Save its information including name, difficulty, image, and general notes.</Card.Footer>
                </Card>
            </Fragment>
        )
    }
}

export default Features