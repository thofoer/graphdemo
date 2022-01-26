import cytoscape from "cytoscape";
import React, { useCallback, useContext, useEffect, useRef } from "react";
import classes from "./GraphComp.module.scss";
import { Graph, Path } from '../../types';
import { dfs } from '../../algorithms';
import { graphStyles } from "./graphstyles";
import { LogContext } from "../../App";
import { bfs } from "../../algorithms/search";
import { ga } from "../../algorithms/tspga";

interface GraphProps {
    graph: Graph;
    highlightPath: Path | null;
    defaultLayout?: string;    
    setGraphDefModalOpen: () => void;
}  

export const GraphComp: React.VFC<GraphProps> = ({
    graph,
    highlightPath,
    defaultLayout = "circle",    
    setGraphDefModalOpen
}) => { 
    const graphRoot = useRef<HTMLDivElement>(null);
    const cyGraph = useRef<cytoscape.Core>();

    const log = useContext(LogContext);

    const dumpGraph = () => {
        log("----Graph-Dump-------------")
        graph.nodeIds.forEach( node => {
            log(`${node} 🠖 ${graph.adjacentNodesForNode(node).join(", ")}`);
        });
        log("   Koordinaten ");
        if (cyGraph.current) {
            cyGraph.current.$("node").forEach( n => {
                const {x,y} = n.position();
                log(`${n.id()}[${Math.floor(x)},${Math.floor(y)}]`);
            });
        }
    }

    const test = () => {
        // log("----DFS-------------");
        // dfs(graph, "A", (node: string) => log(node));
        // log("----BFS-------------");
        // bfs(graph, "A", (node: string) => log(node));
        
      //  ga(graph);

    };

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

        let fx = 1;
        let fy = 1;
        if (graph.props.positioning==="geo") {
            fx = 120;
            fy = -200;
        }

        for (let node of graph.nodes) {
            cyGraph.current.add({
                group: "nodes",
                position: {
                    x: fx * node.x!,
                    y: fy * node.y!,
                },
                data: {
                    id: node.name,
                    name: node.name,
                },
            });
        }
        for (let edge of graph.edges) {
            let source = edge.n1;
            let target = edge.n2; 
            if (graph.props.bidirectional && source>target)  {
                [source, target] = [target, source];
            }
            cyGraph.current.add({
                group: "edges",
                data: {
                    id: `${source}->${target}`,
                    weight: edge.weight,
                    source: source,
                    target: target,
                },
            });
            if (edge.bidirectional && !graph.props.bidirectional) {                
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

        if ( graph.props.bidirectional) {
            cyGraph.current.$("edge").forEach((i) => {
                i.addClass("edgeBidirectional");
            });
        }
        if (!graph.props.weighted) {
            cyGraph.current.$("edge").forEach((i) => {
                i.addClass("edgeUnweighted");
            });
        }

        let layout = cyGraph.current.layout({
            name: defaultLayout,
        });

        layout.run();
    }, [graph, defaultLayout]);

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

    const clearHighlight = useCallback(() => {
        if (cyGraph.current) {
            cyGraph.current.$("node").forEach((i) => {
                i.removeClass("red blue green");
            });
            cyGraph.current.$("edge").forEach((i) => {
                i.removeClass("edgeHighlight");
                i.removeClass("edgeFaded");
            });
        }
    },[]);


    useEffect(() => {
        clearHighlight();

        if (highlightPath && cyGraph.current) {           
            cyGraph.current.$(`node[id="${highlightPath.first}"]`).addClass("red");
            cyGraph.current.$(`node[id="${highlightPath.last}"]`).addClass("green");

            const between = highlightPath.between;
            if (between.length > 0) {
                cyGraph.current.$(between.map((i) => `node[name="${i}"]`).join(",")).forEach((i) => {
                    i.addClass("blue");
                });
            }
            cyGraph.current.$("edge").forEach((i) => {                
                i.addClass("edgeFaded");
            });
            cyGraph.current.$(highlightPath.edgeIds.map((i) => `edge[id="${i}"]`).join(",")).forEach((i) => {
                i.removeClass("edgeFaded");
                i.addClass("edgeHighlight");                
            });
        }
    }, [highlightPath, clearHighlight]);

    return (
        
        <div className={classes.graphViewWrapper}>
            <button className={classes.button} onClick={setGraphDefModalOpen}>G</button>
            <button className={classes.button} onClick={()=>log("CLEAR")}>C</button>
            <button className={classes.button} onClick={dumpGraph}>D</button>
            <button className={classes.button} onClick={test}>T</button>
            <button className={classes.button} onClick={clearHighlight}>H</button>
            Anzahl Knoten: {graph.nodes.length} Anzahl Kanten: {graph.edges.length}
            <div id="graphroot" className={classes.graphView} ref={graphRoot} />
        </div>
        
    );
};
