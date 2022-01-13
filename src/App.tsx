import classes from "./App.module.css";
import { GraphComp } from "./GraphComp";
import { createRef,  useState } from "react";
import { Graph, GraphNode, Path } from "./types";
import { Button, Col, Form, FormGroup, ListGroup, ListGroupItem, Row } from "react-bootstrap";
import { useEffect } from "react";
import { CalcResult } from './algorithms';
import assert from "assert";

function App() {

  const [graph, setGraph] = useState<Graph>();

  const [startNode, setStartNode] = useState<GraphNode>();
  const [targetNode, setTargetNode] = useState<GraphNode>();

  const [resultPaths, setResultPaths] = useState<CalcResult<Path[]>>();
  const [resultShortestPathSimple, setResultShortestPathSimple] = useState<CalcResult<Path>>();
  const [resultShortestPathPrio, setResultShortestPathPrio] = useState<CalcResult<Path>>();
  
  const [highlightPath, setHighlightPath] = useState<Path>();

  const calcButton = createRef<HTMLButtonElement>();

  const loadGraph = async () => {
    if (!graph) {
      const response = await fetch("graph1.txt");
      const graphDef = await response.text();
      console.dir(graphDef);
      setGraph(Graph.parse(graphDef));
    }
  };

  useEffect(() => {
    
    if (calcButton.current) {
     calcButton.current.disabled = !(startNode && targetNode) || (startNode === targetNode);
    }
  },[startNode, targetNode, calcButton]);

  const calcPaths = () => {   
    
    setResultPaths( graph?.allPaths(startNode!, targetNode!)!);
    setResultShortestPathSimple(graph?.shortestPath(startNode!, targetNode!));
    setResultShortestPathPrio(graph?.shortestPath(startNode!, targetNode!, true));    
  }

  return (
    <div className="App">
      <Row className="mx-0">
        <Col xs={3} className="bg-white">
          <div className="h2 text-center">Wegsuche</div>

          <Form>
          <Row className="mb-3">
            <FormGroup as={Col}>
              
              <Form.Label>Start</Form.Label>
              <Form.Select size="sm" onChange={ event => setStartNode(event.target.selectedOptions[0].text)}>
                <option key=""></option>
                {graph?.nodes.map( node => <option key={node}>{node}</option>)}
              </Form.Select>
             
              </FormGroup>
              <FormGroup as={Col}>

              <Form.Label>Target</Form.Label>
              <Form.Select size="sm" onChange={ event => setTargetNode(event.target.selectedOptions[0].text)}>
              <option key=""></option>
                {graph?.nodes.map( node => <option key={node}>{node}</option>)}
              </Form.Select>
             
            </FormGroup>
            </Row>
            <Row className="m-2">
              <Button  ref={calcButton} onClick={calcPaths}>Rechnen</Button>
            </Row>
          </Form> 
          {resultPaths &&
            <Row>
              <div className="h3 text-center">Ergebnis</div>
              <Form.Text className="text-muted">
                Kürzester Pfad
              </Form.Text>
              <ListGroup className="m-2"> 
                <ListGroupItem as="li" key="shortestSimple">SimpleStrategy {resultShortestPathSimple?.stepCount} Schritte<br/>{resultShortestPathSimple?.data.strRep()}</ListGroupItem>
                <ListGroupItem as="li" key="shortestPrio">PrioStrategy {resultShortestPathPrio?.stepCount} Schritte<br/>{resultShortestPathPrio?.data.strRep()}</ListGroupItem>
              </ListGroup>
              <Form.Text className="text-muted mt-5">
                Alle Pfade (Schritte: {resultPaths.stepCount})
              </Form.Text>
              <ListGroup className="m-2"> 
                {resultPaths.data.map( p => <ListGroupItem as="li" key={p.strRep()} onClick={()=>setHighlightPath(p)} action>{p.strRep()}</ListGroupItem>)}
              </ListGroup>
             
            </Row>
            
          }
        </Col>
        <Col className="d-flex" xs={9}>
          {graph ? (
            <GraphComp graph={graph} highlightPath={highlightPath} />
          ) : (
            <div className="d-flex align-items-center" >
              <Button onClick={loadGraph}>Lade Graph</Button>
            </div>
          )}
        </Col>
      </Row>      

    </div>
  );
}

export default App;
