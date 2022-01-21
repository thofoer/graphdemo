import { FC } from "react";
import { Card, Col, Form, FormGroup } from "react-bootstrap";
import { formatNumber, formatTime } from "../../algorithms/utils";

interface OwnProps {
    queueSize: number,
    stepCount: number,
    elapsedMillis: number
}



export const StatusReportComp: FC<OwnProps> = ({
    queueSize,
    stepCount,
    elapsedMillis,
}) => {

    return (
        <Card className="m-3">
            <Card.Body>
                <Form  className="d-flex justify-content-start">
                    <FormGroup as={Col} style={{minWidth: "4em", marginRight: "2em"}}>
                    <Form.Label>Queue</Form.Label>
                    <Form.Control                      
                        id="queueSize"
                        as="input"
                        value={formatNumber(queueSize)}
                        readOnly
                    />
                    </FormGroup>

                    <FormGroup as={Col} style={{minWidth: "4em", marginRight: "2em"}}>
                    <Form.Label>Schritte</Form.Label>
                    <Form.Control                     
                        id="stepCount"
                        as="input"
                        value={formatNumber(stepCount)}
                        readOnly
                    />
                    </FormGroup>

                    <FormGroup as={Col} style={{minWidth: "8em", marginRight: "2em"}}>
                    <Form.Label>Zeit</Form.Label>
                    <Form.Control                    
                        id="elapsedMillis"
                        as="input"
                        value={formatTime(elapsedMillis)}
                        readOnly
                    />
                    </FormGroup>                    
                </Form>
            </Card.Body>
        </Card>
    );
};