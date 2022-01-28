import React, { FC, useState } from "react";
import { Button, Card, Col, Form, FormGroup } from "react-bootstrap";
import { useSelector } from "react-redux";
import { QueueStrategy } from "../../algorithms/queueStrategies";
import { graphSelector } from "../../store/graphObjectSlice";
import { Graph } from "../../types";

interface OwnProps {
    isRunning: boolean;
    start: (graph: Graph, strategy: QueueStrategy) => void;
    cancel: () => void;
}

const RoundtripSettings: FC<OwnProps> = (
    {
        isRunning,
        start,
        cancel,
    }
) => {
    
    const graph = useSelector(graphSelector).graphObject;

    const [strategy, setStrategy] = useState<string>("lifo");

    const handleStart = () => {
        if (graph && graph instanceof Graph) {
            start(graph, strategy as QueueStrategy);
        }
    }

    const isStartable = () => {
        return !isRunning;
    }

    console.log("render pathfinder settings");

    return (
        <>        
        { graph &&
            <Card className="m-3">
                <Card.Header>Problem des Handlungsreisenden</Card.Header>
                <Card.Body>
                    <Form  className="d-flex justify-content-start">                    
                        <FormGroup as={Col} style={{minWidth: "8em", marginRight: "2em"}}>
                        <Form.Label>Queue-Strategie</Form.Label>
                        <Form.Select  onChange={(event) => setStrategy(event.target.selectedOptions[0].value)}>
                            <option value="lifo">LIFO</option>
                            <option value="fifo">FIFO</option>
                            <option value="priorityWeight">Pfad-Gewicht</option>
                            <option value="priorityLengthAndWeight">Pfad-Länge und -Gewicht</option>                    
                            </Form.Select>
                        </FormGroup>
                       
                    </Form>
                    <FormGroup className="d-flex align-items-end mt-3">
                            <Button onClick={handleStart} style={{marginRight: "1em", minWidth: "6em"}} disabled={!isStartable()}>Start</Button>
                            <Button disabled={!isRunning} onClick={cancel} style={{marginRight: "1em", minWidth: "6em"}}>Abbruch</Button>                        
                    </FormGroup>
                </Card.Body>
            </Card>
        }
        </>
    );
}

export default React.memo(RoundtripSettings, (prevProps, nextProps) => prevProps.isRunning === nextProps.isRunning);