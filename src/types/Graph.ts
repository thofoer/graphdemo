import { GraphNode, Edge, NodeId, Path, GraphDef, RandomGraphDef } from ".";
import { Random } from "../algorithms/utils";
import { PredefinedGraphDef } from "./GraphNode";

export type Positioning = "absolute" | "geo" | "none";

export type GraphProperties = {
    name: string;
    complete: boolean;
    bidirectional: boolean;
    weighted: boolean;
    positioning: Positioning;    
}

const createRandomGraph = (def: RandomGraphDef) => {
    
    const random = Random(def.name);

    const NODE_NAMES = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx";

    const nodes: GraphNode[] = Array(def.nodeCount).fill(null).map( (_,i) => new GraphNode(NODE_NAMES.at(i)!, random(1, 3000), random(1, 3000)));
    const edges: Edge[] = [];



    if (def.complete) {
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                edges.push(new Edge(NODE_NAMES.charAt(i), NODE_NAMES.charAt(j), random(1, 100), true));
            }
        }
        return new Graph(
            edges,   
            {
                name: def.name,
                bidirectional: true,
                complete: true,
                weighted: true,
                positioning: "absolute"
            }, 
            nodes);
    }

    /*
    const nodes: GraphNode[] = Array(def.nodeCount).fill(null).map( (_,i) => new GraphNode(NODE_NAMES.at(i)!));
    const edges: Edge[] = [];

    const random = Random(def.name);

    if (def.complete) {
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                edges.push(new Edge(NODE_NAMES.charAt(i), NODE_NAMES.charAt(j), random(1, 100), true));
            }
        }
        return new Graph(
            edges,   
            {
                name: def.name,
                bidirectional: true,
                complete: true,
                weighted: true,
                positioning: "none"
            }, 
            nodes);
    }
*/

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
    
    return new Graph(
        edges,   
        {
            name: def.name,
            bidirectional: def.bidirectional || def.complete,
            complete: def.complete,
            weighted: true,
            positioning: "none"
        }, 
        nodes);
}


export class Graph {
    public edges: Edge[];
    public nodes: GraphNode[];    
    public props: GraphProperties;

    private _nodeIds: NodeId[];
    private _adjacencyMap: Map<NodeId, {node: NodeId, weight: number}[]>;
    
    constructor(edges: Edge[], properties: GraphProperties, nodes?: GraphNode[]) {
        this.edges = edges;
        this.props = properties;
        
        this._nodeIds = [...new Set(this.edges.flatMap((edge) => [edge.n1, edge.n2]))].sort();

        this.nodes = nodes || this._nodeIds.map((e) => GraphNode.of(e));

        this._adjacencyMap = new Map();
        
        this._nodeIds.forEach( nodeId => { this._adjacencyMap.set(nodeId, [])});

        this.edges.forEach( edge => {
            this._adjacencyMap.get(edge.n1)!.push({node: edge.n2, weight: edge.weight});            
            if (this.props.bidirectional) {                
                this._adjacencyMap.get(edge.n2)!.push({node: edge.n1, weight: edge.weight});
            }
        });
    }

    get nodeIds() {
        return this._nodeIds;
    }

    static of(def: GraphDef) {
        switch(def.type) {
            case "edges" : return Graph.parseEdges(def);
            case "geo": return Graph.parseGeo(def);
            case "random": return createRandomGraph(def);
            case "adjacency-undirected": return Graph.parseAdjacency(def, true);
        }
    }

    static parseGeo(def: PredefinedGraphDef) {
        const nodes = def.data.map((l) => GraphNode.parse(l));
        const edges: Edge[] = [];

        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                edges.push(Edge.of(nodes[i], nodes[j]));
            }
        }

        return new Graph(
            edges,
            {
                name: def.name,
                bidirectional: true,
                complete: true,
                weighted: true,
                positioning: "geo"
            },
            nodes);
    }

    static parseAdjacency(def: PredefinedGraphDef, undirected: boolean) {
        const edges: Edge[] = [];


        const regex = /(.+):(?:\s+(.+,[\d.-]+))+/u;
        const nodeRegex = /(.+),(\d+)/u;
        let weighted = false;
        let lastWeight: string;

        def.data.forEach( l => {
            const matches = regex.exec(l);
            if (matches) {
                const [,node, adj] = matches;    
                adj.split(" ").forEach( next => {
                    const nodeMatches = nodeRegex.exec(next);
                    if (nodeMatches) {
                        const [,n2, weight] = nodeMatches;    
                        edges.push( new Edge(node, n2, +weight, undirected))
                        if (!lastWeight) {
                            lastWeight = weight;
                        }
                        else if (!weighted) {
                            if (lastWeight !== weight){
                                weighted = true;
                            }
                        }
                    }
                });
            }
        });
        let nodes: GraphNode[] | undefined = undefined;
        if (def.nodeCoordinates) {
            nodes = [];
            const regex = /(.+)\[([\d-]+),([\d-]+)\]/u;

            def.nodeCoordinates.forEach( n => {                
                const matches = regex.exec(n);
                if (matches) {
                    const [, name, x, y] = matches;
                    nodes!.push( new GraphNode(name, +x, +y));
                }
            })            
        }
        return new Graph(
            edges,
            {
                name: def.name,
                bidirectional: undirected,
                complete: false,
                weighted: weighted,
                positioning: nodes ? "absolute" : "none"
            },
            nodes
            );
    }


    static parseEdges(def: PredefinedGraphDef) {
        const edges = def.data.map((l) => Edge.parse(l));
        return new Graph(
            edges, 
            {
                name: def.name,
                bidirectional: false,
                complete: false,
                weighted: true,
                positioning: "none"
            });
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

    distanceBetween(sourceNode: NodeId, targetNode: NodeId) {
        return this.edgeForNodes(sourceNode, targetNode)?.weight;
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

    weightForClosedPath(nodes: NodeId[]){
        let weight = 0;
        for (let i=0; i<nodes.length-1; i++) {
            const adj = this._adjacencyMap.get(nodes[i])?.find( a => a.node === nodes[i+1]);            
            if (adj) {
                weight += adj.weight;
            }
            else {
                throw new Error("no such path: "+nodes.join(","));
            }
        }
        const closingDistance = this.distanceBetween(nodes.first(), nodes.last());
        if (!closingDistance) {
            throw new Error("no closing edge found");
        }
        return weight + closingDistance; 
    }

    pathForNodes(nodes: NodeId[]) {
        let weight = 0;
        for (let i=0; i<nodes.length-1; i++) {
            const adj = this._adjacencyMap.get(nodes[i])?.find( a => a.node === nodes[i+1]);            
            if (adj) {
                weight += adj.weight;
            }
            else {
                throw new Error("no such path: "+nodes.join(","));
            }
        }
        return new Path(nodes, weight);
    }

}  
