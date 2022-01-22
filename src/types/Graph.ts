import { GraphNode, Edge, NodeId, Path, GraphDef, RandomGraphDef } from ".";
import { Random } from "../algorithms/utils";
import { PredefinedGraphDef } from "./GraphNode";



const createRandomGraph = (def: RandomGraphDef) => {
    
    const NODE_NAMES = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx";

    const nodes: GraphNode[] = Array(def.nodeCount).fill(null).map( (_,i) => new GraphNode(NODE_NAMES.at(i)!));
    const edges: Edge[] = [];

    const random = Random(def.name);


    nodes.forEach( node => {
        const edgeNodes: string[] = [];
        for (let i=0; i<def.edgesPerNode; i++) {
            let n = "";
            do {
                n = NODE_NAMES.at(random(0,def.nodeCount))!;
            }
            while (n === node.name || edgeNodes.includes(n));
            edgeNodes.push(n);
        }
        edgeNodes.forEach( n => {
            edges.push( new Edge(node.name, n, random(1, 100), def.bidirectional ));
        });        
    });
    
    return new Graph(edges, false, false, "none", nodes);
}

export type Positioning = "absolute" | "geo" | "none";

export class Graph {
    public edges: Edge[];
    public nodes: GraphNode[];    
    public complete: boolean;
    public bidirectional: boolean;
    public positioning: Positioning;

    private _nodeIds: NodeId[];
    private _adjacencyMap: Map<NodeId, {node: NodeId, weight: number}[]>;
    
    constructor(edges: Edge[], complete: boolean, bidirectional: boolean, positioning: Positioning, nodes?: GraphNode[]) {
        this.edges = edges;
        this.complete = complete;
        this.bidirectional = bidirectional;
        this.positioning = positioning;

        this._nodeIds = [...new Set(this.edges.flatMap((edge) => [edge.n1, edge.n2]))].sort();

        this.nodes = nodes || this._nodeIds.map((e) => GraphNode.of(e));

        this._adjacencyMap = new Map();
        
        this._nodeIds.forEach( nodeId => { this._adjacencyMap.set(nodeId, [])});

        this.edges.forEach( edge => {
            this._adjacencyMap.get(edge.n1)!.push({node: edge.n2, weight: edge.weight});            
            if (bidirectional) {                
                this._adjacencyMap.get(edge.n2)!.push({node: edge.n1, weight: edge.weight});
            }
        });
    }

    get nodeIds() {
        return this._nodeIds;
    }

    static of(def: GraphDef) {
        switch(def.type) {
            case "edges" : return Graph.parseEdges(def.data!);
            case "geo": return Graph.parseGeo(def.data!);
            case "random": return createRandomGraph(def);
            case "adjacency-undirected": return Graph.parseAdjacency(def, true);
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

        return new Graph(edges, true, true, "geo", nodes);    
    }

    static parseAdjacency(def: PredefinedGraphDef, undirected: boolean) {
        const edges: Edge[] = [];


        const regex = /(.+):(?:\s+(.+,[\d.-]+))+/u;
        const nodeRegex = /(.+),(\d+)/u;
        def.data.forEach( l => {
            const matches = regex.exec(l);
            if (matches) {
                const [,node, adj] = matches;    
                adj.split(" ").forEach( next => {
                    const nodeMatches = nodeRegex.exec(next);
                    if (nodeMatches) {
                        const [,n2, weight] = nodeMatches;    
                        edges.push( new Edge(node, n2, +weight, undirected))
                    }
                });
            }
        });
        if (def.nodeCoordinates) {
            const nodes: GraphNode[] = [];
            const regex = /(.+)\[([\d-]+),([\d-]+)\]/u;

            def.nodeCoordinates.forEach( n => {                
                const matches = regex.exec(n);
                if (matches) {
                    const [, name, x, y] = matches;
                    nodes.push( new GraphNode(name, +x, +y));
                }
            })
            return new Graph(edges, false, true, "absolute", nodes);
        }
        return new Graph(edges, false, true, "none");
    }


    static parseEdges(s: string[]) {
        const edges = s.map((l) => Edge.parse(l));
        return new Graph(edges, false, false, "none");
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

    adjacentNodesForNode(node: NodeId): NodeId[] {
        if (!this._adjacencyMap.get(node)) {
            throw new Error("unknown node: "+node);
        }        
        return this._adjacencyMap.get(node)!.map( e => e.node);        
    }
}  
