import { GraphComp } from "./components/GraphComp/GraphComp";
import { createRef, useState } from "react";
import { Graph, Path, NodeId, GraphDef, CalcResult } from "./types";
import {
  Button,
  Col,
  Form,
  FormGroup,
  ListGroup,
  ListGroupItem,
  NavItem,
  Row,
} from "react-bootstrap";
import { useEffect } from "react";
import { findShortestRoundtripAsync } from "./algorithms/roundtrip";
import { GraphDefinition } from "./components/GraphDefinition/GraphDefinition";
import classes from "./App.module.scss";
import { SideBar } from "./components/SideBar/SideBar";
import "allotment/dist/style.css";
import { Allotment } from "allotment";
import { GraphDefinitionModal } from "./components/GraphDefinition/GraphDefinitionModal";
import { Link } from "react-router-dom";

function App() {
  const [graphDefs, setGraphDefs] = useState<GraphDef[]>([]);
  const [graphDef, setGraphDef] = useState<GraphDef>();
  const [graph, setGraph] = useState<Graph>();
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [highlightPath, setHighlightPath] = useState<Path>();

  const handleSetGraph = (g: Graph) => {
    console.log(g);
    setModalOpen(false);
    setGraph(g);
  };

  useEffect(() => {
    const loadGraphDefs = async () => {      
        if (graphDefs.length === 0) {
            const response = await fetch("graph.json");
            const graphDefs = await response.json();
            console.dir(graphDefs);
            setGraphDefs(graphDefs as GraphDef[]);
            setGraphDef(graphDefs[0]);
            console.log("graphdefs", graphDefs);
        }
    };    
    loadGraphDefs();
}, [graphDefs]);
  
  
  console.log("APP RENDER");


  return (
    <div style={{ width: "2800px", height: "2000px" }}>
      <GraphDefinitionModal
        modalOpen={modalOpen}
        hideModal={() => {
          setModalOpen(false);
        }}
        graphDefs={graphDefs}
        onSetGraph={handleSetGraph}
      />

      <Allotment defaultSizes={[600, 1200]}>
        <Allotment.Pane minSize={200}>
          <div className={classes.App}>
            <SideBar setGraphDefModalOpen={() => setModalOpen(true)}/>
          </div>
        </Allotment.Pane>
        <Allotment.Pane snap>
          
        {graph ? (
                    <GraphComp
                        graph={graph}
                        highlightPath={highlightPath}                            
                        defaultLayout={graph.complete ? "preset" : "circle"}
                    />
                ) : (                      
                    <>
                    { graphDefs && 
                    <div className="d-flex justify-content-center align-content-center mt-5 h3" >
                        <NavItem>
                        <Link to="/" onClick={()=>setModalOpen(true)}>Bitte Graph laden</Link>
                        </NavItem>
                        </div>
                    }
                    </>
                )}

        </Allotment.Pane>
      </Allotment>
    </div>
  );
}

export default App;
