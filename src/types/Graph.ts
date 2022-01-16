import { CalcResult } from "./CalcResult";
import { GraphNode, Edge, NodeId, Path, GraphDef } from ".";
import { findAllPaths, findShortestPath } from "../algorithms/findPaths";
import { QueueStrategy } from "../algorithms/queueStrategies";
import { findShortestRoundtrip } from "../algorithms/roundtrip";

export class Graph {
    public edges: Edge[];
    public nodes: GraphNode[];
    private _nodeIds: NodeId[];

    constructor(edges: Edge[], nodes?: GraphNode[]) {
        this.edges = edges;
        this._nodeIds = [...new Set(this.edges.flatMap((edge) => [edge.n1, edge.n2]))].sort();

        this.nodes = nodes || this._nodeIds.map((e) => GraphNode.of(e));
    }

    get nodeIds() {
        return this._nodeIds;
    }

    static of(def: GraphDef) {
        if (def.type === "edges") {
            return Graph.parseEdges(def.data);
        } else if (def.type === "geo") {
            return Graph.parseGeo(def.data);
        }
    }

    static parseGeo(s: string[]) {
        const nodes = s.map((l) => GraphNode.parse(l));
        const edges: Edge[] = [];

        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                edges.push(Edge.of(nodes[i], nodes[j]));
            }
        }

        return new Graph(edges, nodes);
    }

    static parseEdges(s: string[]) {
        const edges = s.map((l) => Edge.parse(l));
        return new Graph(edges);
    }

    edgeForNodes(sourceNode: NodeId, targetNode: NodeId) {
        const res = this.edges.filter(
            (e) =>
                (e.n1 === sourceNode && e.n2 === targetNode) ||
                (e.n2 === sourceNode && e.n1 === targetNode && e.bidirectional)
        );

        if (res.length === 1) {
            return res[0];
        } else if (res.length === 0) {
            return null;
        } else {
            throw new Error(`More than one edge found: ${sourceNode}->${targetNode}`);
        }
    }

    isAdjacent(sourceNode: NodeId, targetNode: NodeId) {
        return !!this.edgeForNodes(sourceNode, targetNode);
    }

    adjacentEdgesForPath(path: Path) {
        return this.edges
            .filter((e) => path.isAdjacent(e))
            .filter((e) => !path.nodes.includes(path.nextNodeForEdge(e)));
    }
    
    allPaths(
        startNode: NodeId,
        targetNode: NodeId,
        queueStrategy: QueueStrategy = "priorityWeight"
    ): CalcResult<Path[]> {
        return findAllPaths(this, startNode, targetNode, queueStrategy);
    }

    shortestPath(
        startNode: NodeId,
        targetNode: NodeId,
        queueStrategy: QueueStrategy = "priorityWeight"
    ): CalcResult<Path | null> {
        return findShortestPath(this, startNode, targetNode, queueStrategy);
    }

    shortestRoundtrip(queueStrategy: QueueStrategy = "priorityLengthAndWeight"): CalcResult<Path | null> {
        return findShortestRoundtrip(this, queueStrategy);
    }
}
