import React, { FC, useState } from "react";
import { Button, Card, Col, Form, FormGroup, Row } from "react-bootstrap";
import { useSelector } from "react-redux";
import { QueueStrategy } from "../../algorithms/queueStrategies";
import { graphSelector } from "../../store/graphSlice";

interface OwnProps {
    isRunning: boolean;
    start: (startNode: string, targetNode: string, strategy: QueueStrategy) => void;
    cancel: () => void;
}

const PathfinderSettings: FC<OwnProps> = (
    {
        isRunning,
        start,
        cancel,
    }
) => {
    
    const graph = useSelector(graphSelector).graph;
    const [startNode, setStartNode] = useState<string>("");
    const [targetNode, setTargetNode] = useState<string>("");
    const [strategy, setStrategy] = useState<string>("simple");

    const handleStart = () => {
        start(startNode, targetNode, strategy as QueueStrategy);
    }

    const isStartable = () => {
        return !isRunning && startNode !== "" && targetNode !== "";
    }

    console.log("render pathfinder settings");

    return (
        <>        
        { graph &&
            <Card className="m-3">
                <Card.Header>Pfadsuche</Card.Header>
                <Card.Body>
                    <Form  className="d-flex justify-content-start">
                        <FormGroup as={Col} style={{minWidth: "4em", marginRight: "2em"}}>
                        <Form.Label>Start</Form.Label>
                        <Form.Select onChange={(event) => setStartNode(event.target.selectedOptions[0].text)}>
                            <option></option>                            
                            {graph.nodes.map((node) => (
                                <option key={node.name}>{node.name}</option>
                            ))}
                            </Form.Select>
                        </FormGroup>

                        <FormGroup as={Col} style={{minWidth: "4em", marginRight: "2em"}}>
                        <Form.Label>Ziel</Form.Label>
                        <Form.Select  onChange={(event) => setTargetNode(event.target.selectedOptions[0].text)}>
                            <option></option>
                            {graph.nodes.map((node) => (
                                <option key={node.name}>{node.name}</option>
                            ))}
                            </Form.Select>
                        </FormGroup>

                        <FormGroup as={Col} style={{minWidth: "8em", marginRight: "2em"}}>
                        <Form.Label>Queue-Strategie</Form.Label>
                        <Form.Select  onChange={(event) => setStrategy(event.target.selectedOptions[0].value)}>
                            <option value="simple">LIFO</option>
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

export default React.memo(PathfinderSettings, (prevProps, nextProps) => prevProps.isRunning === nextProps.isRunning);