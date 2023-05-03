import React from 'react';
import {Accordion, Col, Row} from 'react-bootstrap';
import {printPercentage} from '../helpers/gradeUtils';

export const PartialRoutesAccordion = ({grade, partialsForGrade, partialCountForGrade, standardPartialCount, customPartialCount, customsWithPartials, customRoutesMap, quickEditButtons}) => {
    return (
        <Accordion flush>
            <Accordion.Item eventKey={0}>
                <Accordion.Header>
                    Partial completions: {partialCountForGrade}
                </Accordion.Header>
                <Accordion.Body style={{paddingRight: 0}}>
                    {standardPartialCount > 0 &&
                    <div>
                        <h6>Standard routes</h6>
                        {
                            Object.entries(partialsForGrade).sort(([percentA,], [percentB,]) => percentB - percentA).map(([percentage, count], index) => (
                                <Row key={index}
                                     className="align-items-center session-grade-row">
                                    <Col>
                                        {printPercentage(percentage)} ({count})
                                    </Col>
                                    <Col xs={6}>
                                        {quickEditButtons(count, {
                                            ...grade,
                                            percentage
                                        })}
                                    </Col>
                                </Row>
                            ))
                        }
                    </div>
                    }
                    {customPartialCount > 0 &&
                    <div>
                        {customsWithPartials.map((route) => (
                            <div key={route.key}>
                                <h6>{route.value.name}</h6>
                                {
                                    Object.entries(customRoutesMap[route.key].partials).sort(([percentA,], [percentB,]) => percentB - percentA).map(([percentage, count], index) => (
                                        <Row key={index}
                                             className="align-items-center session-grade-row">
                                            <Col>
                                                {printPercentage(percentage)} ({count})
                                            </Col>
                                            <Col xs={6}>
                                                {quickEditButtons(count, {
                                                    key: route.key,
                                                    percentage
                                                }, true)}
                                            </Col>
                                        </Row>
                                    ))
                                }
                            </div>
                        ))}
                    </div>
                    }
                </Accordion.Body>
            </Accordion.Item>
        </Accordion>
    );
}

export default PartialRoutesAccordion;