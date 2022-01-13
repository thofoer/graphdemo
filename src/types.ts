import {CalcResult, calculateAllPaths, calculateShortestPath} from "./algorithms";

export type GraphNode = string;

class Edge {
  constructor(
    public n1: GraphNode,
    public n2: GraphNode,
    public weight: number,
    public bidirectional = false
  ) {}

  static parse(s: string): Edge {
    const regex = /(\w+)\s*(<?->?)\s*(\w+)\s*:\s*(\d+)/;
    const matches = regex.exec(s);
    if (matches) {
      const [,node1, dir, node2, weight] = matches;
      const  bidirectional = dir === '<->' || dir === '-';
      return new Edge( dir==='->' ? node1 : node2, dir==='->' ? node2 : node1, +weight, bidirectional);
    }
    throw new Error("Cannot parse Edge: "+s);
  }
}

class Path {
  nodes: GraphNode[];
  weight: number;
  _edgeIds: string[];
 
  constructor(nodes: GraphNode[] = [], weight: number = 0) {
    this.nodes = nodes; 
    this.weight = weight;
    this._edgeIds = [];
  }

  static of(n: GraphNode) {
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
    
    return new Path([...this.nodes,nextNode], this.weight + e.weight);
  }

  isComplete(startNode: GraphNode, targetNode: GraphNode) {
    return this.nodes[0] === startNode && this.nodes[this.nodes.length-1] === targetNode;
  }

  strRep() {
    return `${this.weight}: ${this.nodes.join("🠖")}`;
  }

}

class Graph {

    public edges: Edge[];
    _nodes: GraphNode[];

    constructor(edges: Edge[]) {
        this.edges = edges;
        this._nodes = [];
    }

    get nodes() {
        if(this._nodes.length === 0) {
            this._nodes = [...new Set(this.edges.flatMap( edge => [edge.n1, edge.n2]))].sort();            
        }
        return this._nodes;
    }

    static parse(s: string) {
      const edges = s.split("\n").map( l => Edge.parse(l));
      return new Graph(edges);
    }

    adjacentEdgesForPath(path: Path) {
      return this.edges.filter( e => path.isAdjacent(e))
                       .filter( e => !path.nodes.includes(path.nextNodeForEdge(e)));
    }

    allPaths(startNode: GraphNode, targetNode: GraphNode): CalcResult<Path[]> {
      return calculateAllPaths(this,startNode, targetNode );
    }

    shortestPath(startNode: GraphNode, targetNode: GraphNode, priorityQueueStrategy: boolean = false): CalcResult<Path> {     
      return calculateShortestPath(this,startNode, targetNode, priorityQueueStrategy );
    }

}

export { Edge, Path, Graph };
