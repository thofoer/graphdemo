import { GraphComp } from "./components/GraphComp";
import { createRef, useState } from "react";
import { Graph, Path, NodeId, GraphDef, CalcResult } from "./types";
import { Button, Col, Form, FormGroup, ListGroup, ListGroupItem, Row } from "react-bootstrap";
import { useEffect } from "react";
import { findShortestRoundtripAsync } from "./algorithms/roundtrip";
import { GraphDefinition } from './components/GraphDefinition/GraphDefinition';
function App() {
    const [graphDefs, setGraphDefs] = useState<GraphDef[]>();
    const [graphDef, setGraphDef] = useState<GraphDef>();
    const [graph, setGraph] = useState<Graph>();

    const [startNode, setStartNode] = useState<NodeId>();
    const [targetNode, setTargetNode] = useState<NodeId>();

    const [resultPaths, setResultPaths] = useState<CalcResult<Path[]>>();
    const [resultShortestPathSimple, setResultShortestPathSimple] = useState<CalcResult<Path | null>>();
    const [resultShortestPathPrio, setResultShortestPathPrio] = useState<CalcResult<Path | null>>();
    const [resultShortestRoundtripSimple, setResultShortestRoundtripSimple] = useState<CalcResult<Path | null>>();
    const [resultShortestRoundtripPrio, setResultShortestRoundtripPrio] = useState<CalcResult<Path | null>>();

    const [highlightPath, setHighlightPath] = useState<Path>();

    const calcButton = createRef<HTMLButtonElement>();
    const stopButton = createRef<HTMLButtonElement>();

    useEffect(() => {
        const loadGraphDefs = async () => {
            if (!graphDefs) {
                const response = await fetch("graph.json");
                const graphDefs = await response.json();
                console.dir(graphDefs);
                setGraphDefs(graphDefs as GraphDef[]);
                setGraphDef(graphDefs[0]);
            }
        };
        loadGraphDefs();
    }, [graphDefs]);

    useEffect(() => {
        if (calcButton.current) {
            calcButton.current.disabled =
                (!graph || graphDef?.type !== "geo") && (!(startNode && targetNode) || startNode === targetNode);
        }
    }, [startNode, targetNode, calcButton, graphDef?.type, graph]);

    const calcPaths = () => {
        stopButton.current!.disabled = false;
        const e = document.getElementById("stopFlag")! as HTMLInputElement;
        e.value = "false";

        if (graphDef?.type === "edges") {
            setResultPaths(graph?.allPaths(startNode!, targetNode!)!);
            setResultShortestPathSimple(graph?.shortestPath(startNode!, targetNode!));
            setResultShortestPathPrio(graph?.shortestPath(startNode!, targetNode!));
            setResultShortestRoundtripSimple(graph?.shortestRoundtrip());
            setResultShortestRoundtripPrio(graph?.shortestRoundtrip());
        } else {
            findShortestRoundtripAsync(graph!, "priorityLengthAndWeight");
        }
    };

    const stop = () => {
        const e = document.getElementById("stopFlag")! as HTMLInputElement;
        e.value = "true";
    };

    console.log("APP REMDER");
    return (      
        <div className="App">
            <input id="stopFlag" type="text" className="d-none" value="false" readOnly/>
            <Row className="mx-0">
                <Col xs={4} className="bg-white">
                    <div className="h2 text-center">Wegsuche</div>

                    <Form>
                        {graphDef?.type === "edges" && (
                            <Row className="mb-3">
                                <FormGroup as={Col}>
                                    <Form.Label>Start</Form.Label>
                                    <Form.Select
                                        size="sm"
                                        onChange={(event) => setStartNode(event.target.selectedOptions[0].text)}
                                    >
                                        <option key=""></option>
                                        {graph?.nodes.map((node) => (
                                            <option key={node.name}>{node.name}</option>
                                        ))}
                                    </Form.Select>
                                </FormGroup>
                                <FormGroup as={Col}>
                                    <Form.Label>Target</Form.Label>
                                    <Form.Select
                                        size="sm"
                                        onChange={(event) => setTargetNode(event.target.selectedOptions[0].text)}
                                    >
                                        <option key=""></option>
                                        {graph?.nodes.map((node) => (
                                            <option key={node.name}>{node.name}</option>
                                        ))}
                                    </Form.Select>
                                </FormGroup>
                            </Row>
                        )}
                        <FormGroup className="d-flex d-justify-center" as={Row}>
                            <Col xl={9}>
                                <Button ref={calcButton} onClick={calcPaths}>
                                    Rechnen
                                </Button>
                            </Col>
                            <Col xl={3}>
                                <Button ref={stopButton} onClick={stop}>
                                    Abbruch
                                </Button>
                            </Col>
                        </FormGroup>
                    </Form>
                    {resultShortestRoundtripPrio /* graphDef?.type==="edges" && */ && (
                        <Row>
                            <div className="h3 text-center">Ergebnis</div>

                            <Form.Text className="text-muted">Kürzester Pfad</Form.Text>
                            <ListGroup className="m-2">
                                <ListGroupItem as="li" key="shortestSimple">
                                    SimpleStrategy {resultShortestPathSimple?.stepCount} Schritte
                                    <br />
                                    {resultShortestPathSimple?.data
                                        ? resultShortestPathSimple?.data.strRep()
                                        : "keine Lösung"}
                                </ListGroupItem>
                                <ListGroupItem as="li" key="shortestPrio">
                                    PrioStrategy {resultShortestPathPrio?.stepCount} Schritte
                                    <br />
                                    {resultShortestPathPrio?.data
                                        ? resultShortestPathPrio?.data.strRep()
                                        : "keine Lösung"}
                                </ListGroupItem>
                            </ListGroup>
                            <Form.Text className="text-muted">Kürzeste Rundreise</Form.Text>

                            <ListGroup className="m-2">
                                <ListGroupItem as="li" key="shortestRoundtripSimple">
                                    SimpleStrategy {resultShortestRoundtripSimple?.stepCount} Schritte
                                    <br />
                                    {resultShortestRoundtripSimple?.data
                                        ? resultShortestRoundtripSimple?.data.strRep()
                                        : "keine Lösung"}
                                </ListGroupItem>
                                <ListGroupItem as="li" key="shortestRoundtripPrio">
                                    PrioStrategy {resultShortestRoundtripPrio?.stepCount} Schritte
                                    <br />
                                    {resultShortestRoundtripPrio?.data
                                        ? resultShortestRoundtripPrio?.data.strRep()
                                        : "keine Lösung"}
                                </ListGroupItem>
                            </ListGroup>

                            {resultPaths && (
                                <>
                                    <Form.Text className="text-muted mt-5">
                                        Alle Pfade (Schritte: {resultPaths.stepCount})
                                    </Form.Text>
                                    <ListGroup className="m-2">
                                        {resultPaths.data.map((p) => (
                                            <ListGroupItem
                                                as="li"
                                                key={p.strRep()}
                                                onClick={() => setHighlightPath(p)}
                                                action
                                            >
                                                {p.strRep()}
                                            </ListGroupItem>
                                        ))}
                                    </ListGroup>
                                </>
                            )}
                        </Row>
                    )}
                    {graphDef?.type === "geo" && (
                        <div>
                            <FormGroup as={Row}>
                                <Col xl={1}>
                                    <Form.Label className="text-muted m-3 d-flex align-content-center">
                                        Queue
                                    </Form.Label>
                                </Col>
                                <Col xl={2}>
                                    <Form.Control
                                        className="m-3 d-flex justify-left"
                                        id="queueSize"
                                        as="input"
                                        readOnly
                                    />
                                </Col>
                                <Col xl={1}>
                                    <Form.Label className="text-muted m-3 d-flex  align-content-center">
                                        Schritte
                                    </Form.Label>
                                </Col>
                                <Col xl={4}>
                                    <Form.Control className="m-3" id="stepCount" as="input" readOnly />
                                </Col>
                                <Col xl={1}>
                                    <Form.Label className="text-muted m-3 d-flex  align-content-center">
                                        Zeit
                                    </Form.Label>
                                </Col>
                                <Col xl={3}>
                                    <Form.Control className="m-3" id="time" as="input" readOnly />
                                </Col>
                            </FormGroup>

                            <Form.Control className="m-3" as="textarea" id="log" readOnly style={{ height: "500px" }} />
                        </div>
                    )}
                </Col>
                <Col className="d-flex" xs={8}>
                    {graph ? (
                        <GraphComp
                            graph={graph}
                            highlightPath={highlightPath}                            
                            defaultLayout={graph.complete ? "preset" : "circle"}
                        />
                    ) : (                      
                       <>
                       { graphDefs && 
                        <GraphDefinition graphDefs={graphDefs} onSetGraph={(graph)=>setGraph(graph)}/>
                       }
                       </>
                    )}
                </Col>
            </Row>
        </div>
    );
}

export default App;
