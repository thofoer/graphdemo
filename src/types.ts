import {CalcResult, calculateAllPaths, calculateShortestPath, calculateShortestRoundtrip} from "./algorithms";

export type NodeId = string;

export type GraphDef = {
  name: string;
  type: "edges" | "geo"
  data: string[];
}

class GraphNode {
  
  constructor(public name: NodeId, public x?: number, public y?: number){}

  static of(n: NodeId) {
    return new GraphNode(n);
  }

  static parse(s: string) {
    const regex = /(.+),([\d.-]+),([\d.-]+)/u;
    const matches = regex.exec(s);
    if (matches) {
      const [,name, lat, lng] = matches;
      return new GraphNode(name, +lng, +lat);
    }
    throw new Error("Cannot parse Node: "+s);
  }
};

class Edge {
  constructor(
    public n1: NodeId,
    public n2: NodeId,
    public weight: number,
    public bidirectional = false
  ) {}

  static parse(s: string): Edge {
    const regex = /(\w+)\s*(<?->?)\s*(\w+)\s*:\s*(\d+)/u;
    const matches = regex.exec(s);
    if (matches) {
      const [,node1, dir, node2, weight] = matches;
      const  bidirectional = dir === '<->' || dir === '-';
      return new Edge( dir==='->' ? node1 : node2, 
                       dir==='->' ? node2 : node1, 
                       +weight, bidirectional);
    }
    throw new Error("Cannot parse Edge: "+s);
  }

  static of(n1: GraphNode, n2: GraphNode) {
    const R = 6371e3; // metres
    const φ1 = n1.y! * Math.PI/180; // φ, λ in radians
    const φ2 = n2.y! * Math.PI/180;
    const Δφ = (n2.y!-n1.y!) * Math.PI/180;
    const Δλ = (n2.x!-n1.x!) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    const d = Math.round((R * c) / 1000); // in kilometres

    return new Edge(n1.name, n2.name, d, true);
  }

}

class Path {
  nodes: NodeId[];
  weight: number;
  _edgeIds: string[];
 
  constructor(nodes: NodeId[] = [], weight: number = 0) {
    this.nodes = nodes; 
    this.weight = weight;
    this._edgeIds = [];
  }

  static of(n: NodeId) {
    return new Path([n], 0);
  }

  get first() {
    return this.nodes[0];
  }

  get last() {
    return this.nodes[this.nodes.length-1];
  }

  get between() {
    return this.nodes.slice(1, -1);
  }

  get length() {
    return this.nodes.length;
  }

  get edgeIds() {
    if (this._edgeIds.length===0) {
      for (let i=0; i<this.nodes.length-1; i++) {
        this._edgeIds.push(`${this.nodes[i]}->${this.nodes[i+1]}`);
      }
    }
    return this._edgeIds;
  }
 
  compare(o: Path) { 
    //return 0;
      let d = o.length - this.length;
      if (d===0) {
          d = this.weight - o.weight;
      }
      return d;      
      
       //return this.weight - o.weight;  
      
  }

  isAdjacent(e: Edge) {    
    return e.n1 === this.nodes[this.nodes.length-1] || (e.bidirectional && e.n2 === this.nodes[this.nodes.length-1]);
  }

  nextNodeForEdge(e: Edge) {
      return  e.n1 === this.nodes[this.nodes.length-1] ? e.n2 : e.n1;
  }

  follow(e: Edge) {
    if (!this.isAdjacent(e)) {
      throw new Error("Edge not adjacent: "+e);
    }
    const nextNode = this.nextNodeForEdge(e);
    
    return new Path([...this.nodes, nextNode], this.weight + e.weight);
  }

  isComplete(startNode: NodeId, targetNode: NodeId) {
    return this.nodes[0] === startNode && this.nodes[this.nodes.length-1] === targetNode;
  }

  strRep() {
    return `${this.weight}: ${this.nodes.join("🠖")}`;
  }

}

class Graph {

    public edges: Edge[];
    public nodes: GraphNode[];
    private _nodeIds: NodeId[];

    constructor(edges: Edge[], nodes?: GraphNode[]) {
        this.edges = edges;
        this._nodeIds = [...new Set(this.edges.flatMap( edge => [edge.n1, edge.n2]))].sort();    
        
        this.nodes = nodes || this._nodeIds.map( e => GraphNode.of(e));
        
    }

    get nodeIds() {
        return this._nodeIds;
    }

    static of(def: GraphDef) {
      if (def.type === "edges") {
        return Graph.parseEdges(def.data);
      }
      else if (def.type === "geo") {
        return Graph.parseGeo(def.data);
      }
    }

    static parseGeo(s: string[]) {
      const nodes = s.map( l => GraphNode.parse(l));
      const edges: Edge[] = [];

      for (let i=0; i<nodes.length; i++) {
        for (let j=i+1; j<nodes.length; j++) {
          edges.push(Edge.of(nodes[i], nodes[j]));
        }
      }

      return new Graph(edges, nodes);
    }

    static parseEdges(s: string[]) {
      const edges = s.map( l => Edge.parse(l));
      return new Graph(edges);
    }

    edgeForNodes(sourceNode: NodeId, targetNode: NodeId) {
      const res = this.edges.filter( e => (e.n1 === sourceNode && e.n2 === targetNode) 
                                       || (e.n2 === sourceNode && e.n1 === targetNode && e.bidirectional));

      if (res.length===1){
        return res[0];
      }
      else if (res.length===0) {
        return null;
      }
      else {
        throw new Error(`More than one edge found: ${sourceNode}->${targetNode}`);
      }
    }

    isAdjacent(sourceNode: NodeId, targetNode: NodeId) {
      return !!this.edgeForNodes(sourceNode, targetNode);
    }

    adjacentEdgesForPath(path: Path) {
      return this.edges.filter( e => path.isAdjacent(e))
                       .filter( e => !path.nodes.includes(path.nextNodeForEdge(e)));
    }

    allPaths(startNode: NodeId, targetNode: NodeId): CalcResult<Path[]> {
      return calculateAllPaths(this, startNode, targetNode );
    }

    shortestPath(startNode: NodeId, targetNode: NodeId, priorityQueueStrategy: boolean = false): CalcResult<Path|null> {     
      return calculateShortestPath(this, startNode, targetNode, priorityQueueStrategy );
    }

    shortestRoundtrip(priorityQueueStrategy: boolean = false): CalcResult<Path|null> {
      return calculateShortestRoundtrip(this, priorityQueueStrategy );
    }

}

export { GraphNode, Edge, Path, Graph };
