import React from 'react'
import {AggregateSessionMilestone} from "../../containers/ActivityFeed";
import {pluralize} from "../../helpers/mathUtils";
import {FaAward} from "react-icons/fa";
import {IconContext} from "react-icons";
import assertNever from "assert-never/index";
import {prettyPrint} from "../../helpers/gradeUtils";
import {defaultIconContext, iconColors} from "./iconStyle";

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
            break
        case 'grade':
            milestoneText = `first ${prettyPrint(milestone.grade, true, true)}`
            break
        default:
            assertNever(milestone)
    }

    return <>New Milestone - {milestoneText}</>
}

export const MilestoneIcon = () =>
    <IconContext.Provider value={{...defaultIconContext, color: iconColors.success}}>
        <FaAward/>
    </IconContext.Provider>