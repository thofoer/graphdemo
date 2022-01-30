import { GraphComp } from "./components/GraphComp/GraphComp";
import React, { useRef, useState } from "react";
import { Path, GraphDef, Graph, Maze } from "./types";
import { Button, Form, NavItem } from "react-bootstrap";
import { useEffect } from "react";
import classes from "./App.module.scss";
import { SideBar } from "./components/SideBar/SideBar";
import "allotment/dist/style.css";
import { Allotment } from "allotment";
import { GraphDefinitionModal } from "./components/GraphDefinition/GraphDefinitionModal";
import { useSelector } from "react-redux";
import { graphSelector } from "./store/graphObjectSlice";
import { MazeViewComp } from "./components/MazeViewComp/MazeViewComp";

export const LogContext = React.createContext<(s: string) => void>(() => {});
export const HighlightContext = React.createContext<(p: Path | null) => void>(
  () => {}
);

function App() {
  const graph = useSelector(graphSelector).graphObject;

  const [viewWidth, setViewWidth] = useState(
    document.querySelector("body")?.offsetWidth ?? 1800
  );
  const [viewHeight, setViewHeight] = useState(
    document.querySelector("body")?.offsetHeight ?? 1200
  );

  const [graphDefs, setGraphDefs] = useState<GraphDef[]>([]);

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [highlightPath, setHighlightPath] = useState<Path | null>(null);

  const logArea = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const body = document.querySelector("body");
    setViewHeight(body?.offsetHeight ?? 0);
    setViewWidth(body?.offsetWidth ?? 0);
  },[]);

  useEffect(() => {
    const loadGraphDefs = async () => {
      if (graphDefs.length === 0) {
        const response = await fetch("graph.json");
        const graphDefs = await response.json();
        console.dir(graphDefs);
        setGraphDefs(graphDefs as GraphDef[]);
        log(`Es wurden ${graphDefs.length} Graphdefinitionen geladen.`);
      }
    };
    loadGraphDefs();
  }, [graphDefs]);

  const log = (s: string) => {
    if (logArea.current) {
      if (s==="CLEAR") {
        logArea.current.value! = "";  
      }
      else {
        logArea.current.value! += s + "\n";
        logArea.current.scrollTop = logArea.current.scrollHeight;
      }
    }
  };

  const highlight = (path: Path | null) => {
    setHighlightPath(path);
  };

  return (
    <div style={{ width: viewWidth, height: viewHeight }}>
      <GraphDefinitionModal
        modalOpen={modalOpen}
        hideModal={() => {
          setModalOpen(false);
        }}
        graphDefs={graphDefs}
      />

      <LogContext.Provider value={log}>
        <HighlightContext.Provider value={highlight}>
          <Allotment defaultSizes={[viewWidth * 0.3, viewWidth * 0.7]}>
            <Allotment.Pane minSize={200}>
              <div className={classes.App}>
                <SideBar />
              </div>
            </Allotment.Pane>
            <Allotment.Pane snap>
              <Allotment
                vertical
                defaultSizes={[viewHeight * 0.7, viewHeight * 0.3]}
              >
                <Allotment.Pane>
                  {console.log("=====>"+graph)}
                  {graph && graph instanceof Graph ? (
                    <div>
                      <GraphComp
                        graph={graph}
                        highlightPath={highlightPath}
                        defaultLayout={graph.props.positioning === "none" ? "circle" : "preset"}
                        setGraphDefModalOpen={() => setModalOpen(true)}
                      />
                    </div>
                  ) : 
                  graph && graph instanceof Maze ? (
                    <div>
                      <MazeViewComp maze={graph}/>
                    </div>
                  )
                  :
                  (
                    <>
                      {graphDefs && (
                        <div className="d-flex justify-content-center align-content-center mt-5 h3">
                          <NavItem>
                            <Button onClick={() => setModalOpen(true)}>
                              Bitte Graph laden
                            </Button>
                          </NavItem>
                        </div>
                      )}
                    </>
                  )}
                </Allotment.Pane>
                <Allotment.Pane>
                  <Form.Control
                    ref={logArea}
                    className="m-0"
                    as="textarea"
                    id="log"
                    readOnly
                    style={{ height: "100%" }}
                  />
                </Allotment.Pane>
              </Allotment>
            </Allotment.Pane>
          </Allotment>
        </HighlightContext.Provider>
      </LogContext.Provider>
    </div>
  );
}

export default App;
