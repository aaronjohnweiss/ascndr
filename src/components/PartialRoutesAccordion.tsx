import React from 'react';
import {Accordion, Col, Row} from 'react-bootstrap';
import {printPercentage} from '../helpers/gradeUtils';
import {Grade} from "../types/Grade";
import {PartialCount, RouteCount} from "../types/Session";
import {OrderedList} from "../types/Firebase";
import {Route} from "../types/Route";
import {QuickEditButtons} from "../containers/SessionPage";
import {entries} from "../helpers/recordUtils";


interface Props {
    grade: Grade,
    partialsForGrade: PartialCount
    partialCountForGrade: number
    standardPartialCount: number
    customPartialCount: number
    customsWithPartials: OrderedList<Route>
    customRoutesMap: Record<string, RouteCount<string>>
    quickEditButtons: QuickEditButtons
}

export const PartialRoutesAccordion = ({
                                           grade,
                                           partialsForGrade,
                                           partialCountForGrade,
                                           standardPartialCount,
                                           customPartialCount,
                                           customsWithPartials,
                                           customRoutesMap,
                                           quickEditButtons
                                       }: Props) => {
    return (
        <Accordion flush>
            <Accordion.Item eventKey={'0'}>
                <Accordion.Header>
                    Partial completions: {partialCountForGrade}
                </Accordion.Header>
                <Accordion.Body style={{paddingRight: 0}}>
                    {standardPartialCount > 0 &&
                        <div>
                            <h6>Standard routes</h6>
                            {
                                entries(partialsForGrade).sort(([percentA,], [percentB,]) => percentB - percentA).map(([percentage, count], index) => (
                                    <Row key={index}
                                         className="align-items-center session-grade-row">
                                        <Col>
                                            {printPercentage(percentage)} ({count})
                                        </Col>
                                        <Col xs={6}>
                                            {quickEditButtons({
                                                key: {
                                                    ...grade,
                                                    percentage
                                                }
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
                                        entries(customRoutesMap[route.key].partials).sort(([percentA,], [percentB,]) => percentB - percentA).map(([percentage, count], index) => (
                                            <Row key={index}
                                                 className="align-items-center session-grade-row">
                                                <Col>
                                                    {printPercentage(percentage)} ({count})
                                                </Col>
                                                <Col xs={6}>
                                                    {quickEditButtons({
                                                        key: {
                                                            key: route.key,
                                                            percentage
                                                        }, isCustom: true
                                                    })}
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