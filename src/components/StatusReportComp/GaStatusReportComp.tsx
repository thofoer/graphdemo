import { FC } from "react";
import { Card, Col, Form, FormGroup, ProgressBar } from "react-bootstrap";
import { formatNumber, formatTime } from "../../algorithms/utils";

interface OwnProps {
    progress: number,
    generation: number,
    elapsedMillis: number
}

export const GaStatusReportComp: FC<OwnProps> = ({
    progress,
    generation,
    elapsedMillis,
}) => {

    return (
        <Card className="m-3">
            <Card.Body>
                <Form  className="d-flex justify-content-start">
                    <FormGroup as={Col} style={{minWidth: "4em", marginRight: "2em"}}>
                    <Form.Label>Fortschritt</Form.Label>
                    
                    <ProgressBar now={progress} style={{height: "2em", fontSize: "1em"}}  label={`${progress} %`}/>

                    </FormGroup>

                    <FormGroup as={Col} style={{minWidth: "4em", marginRight: "2em"}}>
                    <Form.Label>Generation</Form.Label>
                    <Form.Control                     
                        id="population"
                        as="input"
                        value={formatNumber(generation)}
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