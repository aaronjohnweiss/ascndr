import React from 'react'
import {Col, Container, Row} from 'react-bootstrap';
import {AggregateSessionMilestone, IconProps} from "../../containers/ActivityFeed";
import {pluralize} from "../../helpers/mathUtils";
import {FaAward} from "react-icons/fa";
import {IconContext} from "react-icons";

interface Props {
    milestone: AggregateSessionMilestone
}

export const MilestoneCard = ({milestone}: Props) => {

    let milestoneText;

    switch (milestone.unit) {
        case 'sessionCount':
            if (milestone.count === 1) {
                milestoneText = 'first session'
            } else {
                milestoneText = `${milestone.count} sessions`
            }
            break
        case 'duration':
            milestoneText = `${milestone.count} ${pluralize('hour', milestone.count)} climbed`
    }

    return <Container>
        <Row>
            <Col xs={12}>New Milestone - {milestoneText}</Col>
        </Row>
    </Container>
}

export const MilestoneIcon = ({baseStyle}: IconProps) => <IconContext.Provider value={{...baseStyle, color: 'goldenrod'}}><FaAward /></IconContext.Provider>