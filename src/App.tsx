
import { GraphComp } from "./GraphComp";
import { createRef,  useState } from "react";
import { Graph, Path, NodeId, GraphDef } from "./types";
import { Button, Col, Form, FormGroup, ListGroup, ListGroupItem, ProgressBar, Row } from "react-bootstrap";
import { useEffect } from "react";
import { CalcResult } from './algorithms';



function App() {

  const [graphDefs, setGraphDefs] = useState<GraphDef[]>();
  const [graphDef, setGraphDef] = useState<GraphDef>();
  const [graph, setGraph] = useState<Graph>();

  const [queueSize, setQueueSize] = useState<number>(0);  

  const [startNode, setStartNode] = useState<NodeId>();
  const [targetNode, setTargetNode] = useState<NodeId>();

  const [resultPaths, setResultPaths] = useState<CalcResult<Path[]>>();
  const [resultShortestPathSimple, setResultShortestPathSimple] = useState<CalcResult<Path|null>>();
  const [resultShortestPathPrio, setResultShortestPathPrio] = useState<CalcResult<Path|null>>();  
  const [resultShortestRoundtripSimple, setResultShortestRoundtripSimple] = useState<CalcResult<Path|null>>();
  const [resultShortestRoundtripPrio, setResultShortestRoundtripPrio] = useState<CalcResult<Path|null>>();
  

  const [highlightPath, setHighlightPath] = useState<Path>();

  const calcButton = createRef<HTMLButtonElement>();


  useEffect( () => {
    const loadGraphDefs = async () => {
      if (!graphDefs) {
        const response = await fetch("graph.json");
        const graphDefs = await response.json();      
        console.dir(graphDefs);
        setGraphDefs(graphDefs as GraphDef[]);
        setGraphDef(graphDefs[0]);
      }
    };
    loadGraphDefs()},
  [graphDefs]);

  const loadGraph = () => {
    console.log(graphDef);
    if (graphDef) {
      setGraph(Graph.of(graphDef));
      console.log(graph);
    }
  }


  useEffect(() => {
    
    if (calcButton.current) {
     calcButton.current.disabled = (!graph ||(graphDef?.type !== "geo") ) && (!(startNode && targetNode) || (startNode === targetNode));
    }
  },[startNode, targetNode, calcButton]);

  const setStepCount = (n: number) => {
    const elem = document.getElementById("stepCount");
    console.log(elem);
  }

  const calcPaths = () => {   
    
    if (graphDef?.type==="edges") {
      setResultPaths( graph?.allPaths(startNode!, targetNode!)!);    
      setResultShortestPathSimple(graph?.shortestPath(startNode!, targetNode!));
      setResultShortestPathPrio(graph?.shortestPath(startNode!, targetNode!, true));    
      setResultShortestRoundtripSimple(graph?.shortestRoundtrip());
    }    
    setResultShortestRoundtripPrio(graph?.shortestRoundtrip(true));    
  }

  return (
    <div className="App">
      <Row className="mx-0">
        <Col xs={4} className="bg-white">
          <div className="h2 text-center">Wegsuche</div>

          <Form>
          {graphDef?.type==="edges" &&
           <Row className="mb-3">
            <FormGroup as={Col}>
              
                <Form.Label>Start</Form.Label>
                <Form.Select size="sm" onChange={ event => setStartNode(event.target.selectedOptions[0].text)}>
                  <option key=""></option>
                  {graph?.nodes.map( node => <option key={node.name}>{node.name}</option>)}
                </Form.Select>
              
                </FormGroup>
                <FormGroup as={Col}>

                <Form.Label>Target</Form.Label>
                <Form.Select size="sm" onChange={ event => setTargetNode(event.target.selectedOptions[0].text)}>
                <option key=""></option>
                  {graph?.nodes.map( node => <option key={node.name}>{node.name}</option>)}
                </Form.Select>
              
              </FormGroup>
              
            </Row>
            }
            <Row className="m-2">
              <Button  ref={calcButton} onClick={calcPaths}>Rechnen</Button>
            </Row>
          </Form> 
          {resultShortestRoundtripPrio  &&/* graphDef?.type==="edges" && */
            <Row>
              <div className="h3 text-center">Ergebnis</div>
             
              <Form.Text className="text-muted">
                Kürzester Pfad
              </Form.Text>
              <ListGroup className="m-2"> 
                <ListGroupItem as="li" key="shortestSimple">SimpleStrategy {resultShortestPathSimple?.stepCount} Schritte<br/>{resultShortestPathSimple?.data ? resultShortestPathSimple?.data.strRep() : "keine Lösung"}</ListGroupItem>
                <ListGroupItem as="li" key="shortestPrio">PrioStrategy {resultShortestPathPrio?.stepCount} Schritte<br/>{resultShortestPathPrio?.data ? resultShortestPathPrio?.data.strRep() : "keine Lösung"}</ListGroupItem>
              </ListGroup>
              <Form.Text className="text-muted">
                Kürzeste Rundreise
              </Form.Text>

              <ListGroup className="m-2"> 
                <ListGroupItem as="li" key="shortestRoundtripSimple">SimpleStrategy {resultShortestRoundtripSimple?.stepCount} Schritte<br/>{resultShortestRoundtripSimple?.data ? resultShortestRoundtripSimple?.data.strRep() : "keine Lösung"}</ListGroupItem>
                <ListGroupItem as="li" key="shortestRoundtripPrio">PrioStrategy {resultShortestRoundtripPrio?.stepCount} Schritte<br/>{resultShortestRoundtripPrio?.data ? resultShortestRoundtripPrio?.data.strRep() : "keine Lösung"}</ListGroupItem>
              </ListGroup>
              
              {resultPaths &&
          <>
              <Form.Text className="text-muted mt-5">
                Alle Pfade (Schritte: {resultPaths.stepCount})
              </Form.Text>
              <ListGroup className="m-2"> 
                {resultPaths.data.map( p => <ListGroupItem as="li" key={p.strRep()} onClick={()=>setHighlightPath(p)} action>{p.strRep()}</ListGroupItem>)}
              </ListGroup>
              </>  
            }
            </Row>            
          }
          {graphDef?.type==="geo" && false &&
          <div>                     
            <Form.Text className="text-muted m-3">
                Einträge in Queue
              </Form.Text>
              
              <ProgressBar  className="m-3" now={queueSize} />

              <Form.Text className="text-muted m-3">
                Schritte
              </Form.Text>
         
              <Form.Control
                className="m-3"
                id="stepCount"
                  as="input"
                  readOnly
                  value={45}
                  
              />

          <Form.Control
            className="m-3"
              as="textarea"
              readOnly
              style={{ height: '500px' }}
          />


          </div>
          }
        </Col>
        <Col className="d-flex" xs={8}>
          {graph ? (
            <GraphComp graph={graph} highlightPath={highlightPath} complete={graphDef?.type === "geo"} defaultLayout={graphDef?.type === "geo" ? "preset" : "circle"}/>
          ) : (
            <div className="d-flex align-items-center" >
              <Form>    
                
                <Row className="mb-3">
                  <FormGroup as={Col} style={{width: "500px"}}>
                    <Form.Select size="sm" onChange={ event => setGraphDef(graphDefs![event.target.selectedIndex])}>                    
                      {graphDefs?.map( g => <option key={g.name}>{g.name}</option>)}
                    </Form.Select>
                    </FormGroup>         
                    <FormGroup as={Col}>
                    <Button onClick={loadGraph}>Lade Graph</Button>              
                  </FormGroup>         
                </Row>  
              </Form>
            </div>
          )}
        </Col>
      </Row>      

    </div>
  );
}

export default App;
