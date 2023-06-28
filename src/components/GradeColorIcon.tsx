import React from 'react'
import {Badge} from 'react-bootstrap'

const colorVariantMapping = {
    purple: { variant: 'primary', textColor: 'white' },
    gray: { variant: 'secondary', textColor: 'white' },
    grey: { variant: 'secondary', textColor: 'white' },
    green: { variant: 'success', textColor: 'white' },
    red: { variant: 'danger', textColor: 'white' },
    yellow: { variant: 'warning', textColor: 'dark' },
    orange: { variant: 'warning', textColor: 'dark' },
    blue: { variant: 'info', textColor: 'white' },
    white: { variant: 'light', textColor: 'dark' },
    black: { variant: 'dark', textColor: 'white' },
  };


const GradeColorIcon = ({grade, color}) => {
    /*
        This is the alternative to overriding the styles that I was trying; it seemed that all the colors except for pink and 
        purple and orange were accounted for in the variants of the badge component; So I wanted to try just mapping string color to the variant.
    */
    const variantColor = colorVariantMapping[color.toLowerCase().trim()] || colorVariantMapping['blue'];
    console.log(color)

    //if the style of climb is boulder, render a V infront, otherwise its top rope / lead, so render 5.
    const renderedGrade = (grade.style === "BOULDER" ? "V" : "5.") + grade.difficulty

    // const customStyle = {
    //     backgroundColor: '#FF0000',
    //     color: '#FFFFFF',
    //     important: true
    //   };
    return (
        <>
            <Badge pill bg={variantColor.variant} text={variantColor.textColor} style={{marginLeft: "10px"}}>{renderedGrade}</Badge>
        </>
    )
}

export default GradeColorIcon