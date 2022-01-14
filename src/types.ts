import {CalcResult, calculateAllPaths, calculateShortestPath, calculateShortestRoundtrip} from "./algorithms";

export type NodeId = string;

class GraphNode {
  
  constructor(public name: NodeId, public x?: number, public y?: number){}

  static of(n: NodeId) {
    return new GraphNode(n);
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
    const regex = /(\w+)\s*(<?->?)\s*(\w+)\s*:\s*(\d+)/;
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
       return o.weight - this.weight;  
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

    static parse(s: string) {
      const edges = s.split("\n").map( l => Edge.parse(l));
      return new Graph(edges);
    }

    edgeForNodes(sourceNode: NodeId, targetNode: NodeId) {
      const res = this.edges.filter( e => (e.n1 === sourceNode && e.n2 === targetNode) 
                                       || (e.n1 === sourceNode && e.n2 === targetNode && e.bidirectional));

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
