import { Graph, GraphDef, RandomGraphDef } from "../../types";
import {
  Button,
  Col,
  Form,
  FormCheck,
  FormControl,
  FormGroup,
  FormLabel,
  Row,
} from "react-bootstrap";
import { useState } from "react";
import FormRange from "react-bootstrap/esm/FormRange";

interface GraphDefinitionProps {
  graphDefs: GraphDef[];
  onSetGraph: (graph: Graph) => void;
}

export const GraphDefinition: React.VFC<GraphDefinitionProps> = ({
  graphDefs,
  onSetGraph,
}) => {
  const [selectedGraph, setSelectedGraph] = useState<Graph>();
  const [loadButtonDisabled, setLoadButtonDisabled] = useState<boolean>(true);
  const [showRandomGraphConfig, setShowRandomGraphConfig] = useState<boolean>(false);
  const [nodeCount, setNodeCount] = useState<number>(10);
  const [edgesPerNode, setEdgesPerNode] = useState<number>(5);
  const [completeGraph, setCompleteGraph] = useState<boolean>(false);
  const [bidirectionalGraph, setBidirectionalGraph] = useState<boolean>(false);


  const loadGraph = () => {
    if (showRandomGraphConfig) {
        const randomDef: RandomGraphDef = {
            bidirectional: bidirectionalGraph,
            complete: completeGraph,
            edgesPerNode,
            nodeCount,
            name: `zufälliger Graph mit ${nodeCount} Knoten.`,
            type: 'random'
        };
        onSetGraph(Graph.of(randomDef));
    }
    else if (selectedGraph) {
      onSetGraph(selectedGraph);
    }
  };

  const handleSelectedGraphDefChanged = (selected: HTMLOptionElement) => {
    switch (selected.id) {
      case "__random":
        setLoadButtonDisabled(false);
        setShowRandomGraphConfig(true);     
      
        break;
      case "__empty":
        setLoadButtonDisabled(true);
        setShowRandomGraphConfig(false);
        break;
      default:
        setLoadButtonDisabled(false);
        setShowRandomGraphConfig(false);
        setSelectedGraph(Graph.of(graphDefs[selected.index - 2]));
        
        break;
    }
  };

  const handleSetCompleteGraph = (s: boolean) => {
      setCompleteGraph(s);
      setEdgesPerNode(nodeCount-1);
      if (s) {
        setBidirectionalGraph(true);
    }
  }

  const handleSetBidirectionalGraph = (s: boolean) => {
    setBidirectionalGraph(s);    
}

  return (
    <Form className="mt-5" >
      <Row className="mb-3">
        <FormGroup as={Col}>
          <Form.Select
            size="lg"
            onChange={(event) =>
              handleSelectedGraphDefChanged(event.target.selectedOptions[0])
            }
          >
            <option key="__empty" id="__empty"></option>
            <option key="__random" id="__random">
              zufälliger Graph
            </option>
            {graphDefs.map((g) => (
              <option key={g.name} id="__predefined">
                {g.name}
              </option>
            ))}
          </Form.Select>
        </FormGroup>
        <FormGroup as={Col}>
          <Button onClick={loadGraph} disabled={loadButtonDisabled}>
            Lade Graph
          </Button>
        </FormGroup>
      </Row>
      {showRandomGraphConfig && (
        <>
          <Row className="d-flex p-3 mt-3">
            <Col className="m-1" xl={3}>
              <FormLabel className="mb-4" as={Row}>Knoten</FormLabel>
              <FormLabel className="mb-4" as={Row}>Kanten pro Knoten</FormLabel>
              <FormLabel className="mb-4" as={Row}>vollständiger Graph</FormLabel>
              <FormLabel as={Row}>bidirektionale Kanten</FormLabel>
            </Col>
            <Col xl={5} className="m-1">
              <FormRange              
                className="mb-4"  
                min={3}
                max={50}
                inputMode="numeric"
                defaultValue={nodeCount}
                draggable={false}
                step={1}
                onChange={(e) => {
                  setNodeCount(+e.target.value);
                  if (completeGraph) {
                    console.log(nodeCount-1);
                    setEdgesPerNode(nodeCount-1);
                  }
                  if (edgesPerNode > nodeCount) {
                      setEdgesPerNode(nodeCount-1);
                  }
                }}
              ></FormRange>

              <FormRange      
                className="mb-4"           
                min={completeGraph ? nodeCount-1 : 1}
                max={nodeCount-1}
                inputMode="numeric"
                defaultValue={edgesPerNode}
                draggable={false}
                disabled={completeGraph}
                step={1}
                onChange={(e) => {
                    setEdgesPerNode(+e.target.value);
                }}    
              />

              <FormCheck className="mb-4" type="checkbox"> 
                  <FormCheck.Input type="checkbox" onChange={(e) => handleSetCompleteGraph(e.target.checked)}/>
              </FormCheck>
            
              <FormCheck className="mb-4" type="checkbox"> 
                  <FormCheck.Input type="checkbox" disabled={completeGraph} checked={bidirectionalGraph} onChange={(e) => handleSetBidirectionalGraph(e.target.checked)} />
              </FormCheck>
              
            </Col>
            <Col xl={1}>
              <FormControl
                className="mb-2"  
                style={{ width: "3em" }}
                as="input"
                readOnly
                value={nodeCount}
              />
              <FormControl
                style={{ width: "3em" }}
                as="input"
                readOnly
                value={edgesPerNode}
              />
            </Col>
          </Row>
        </>
      )}
    </Form>
  );
};
