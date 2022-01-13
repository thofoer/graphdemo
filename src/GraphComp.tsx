import cytoscape from "cytoscape";
import React, { useCallback, useEffect, useRef } from "react";
import classes from "./GraphComp.module.css";
import { graphStyles } from "./graphstyles";
import { Graph, Path } from "./types";

interface GraphProps {
  graph: Graph;
  highlightPath?: Path;
}

export const GraphComp: React.VFC<GraphProps> = ({ graph, highlightPath }) => {
  const graphRoot = useRef<HTMLDivElement>(null);
  const cyGraph = useRef<cytoscape.Core>();

  const clear = () => {
    if (cyGraph.current) {
      cyGraph.current.remove("node");
      cyGraph.current.remove("edge");
    }
  };

  const renderGraph = useCallback(() => {    
    clear();
    if (!cyGraph.current) {
      return;
    }

    for (let node of graph.nodes) {
      cyGraph.current.add({
        group: "nodes",
        data: {
          id: node.name,
          name: node.name,
        },
      });
    }
    for (let edge of graph.edges) {
      cyGraph.current.add({
        group: "edges",
        data: {
          id: `${edge.n1}->${edge.n2}`,
          weight: edge.weight,
          source: edge.n1,
          target: edge.n2,
        },
      });
      if (edge.bidirectional) {
        cyGraph.current.add({
          group: "edges",
          data: {
            id: `${edge.n2}->${edge.n1}`,
            weight: edge.weight,
            source: edge.n2,
            target: edge.n1,
          },
        });
      }      
    }
    let layout = cyGraph.current.layout({
      name: "circle",
    });
   
     layout.run();
    
  }, [graph]);

  useEffect(() => {
    if (!cyGraph.current) {
      cyGraph.current = cytoscape({
        container: graphRoot.current,        
        style: graphStyles,
        wheelSensitivity: 0.15,
      });
    }
  }, []);

  useEffect(() => {
    renderGraph();
  }, [graph, renderGraph]);

  useEffect(()=> {
    if (highlightPath && cyGraph.current) {      
     
      cyGraph.current.$("node").forEach( i => { i.removeClass("red blue green");});  
      cyGraph.current.$("edge").forEach( i => { i.removeClass("edgeHighlight");});  
      
      cyGraph.current.$(`node[id="${highlightPath.first}"]`).addClass("red");
      cyGraph.current.$(`node[id="${highlightPath.last}"]`).addClass("green");

      const between = highlightPath.between;
      if (between.length>0) {              
        cyGraph.current.$(between.map(i=>`node[name="${i}"]`).join(","))
            .forEach( i=> { i.addClass("blue") });
      }
      cyGraph.current.$(highlightPath.edgeIds.map(i=>`edge[id="${i}"]`).join(","))
        .forEach( i=> { i.addClass("edgeHighlight") });


    }
  }, 
  [highlightPath]);
  
  return (
    <div className={classes.graphViewWrapper}>
      <div id="graphroot" className={classes.graphView} ref={graphRoot} />
    </div>
  );
};
