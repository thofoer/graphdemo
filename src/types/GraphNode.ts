export type NodeId = string;


export type PredefinedGraphDef = {
  name: string;
  type: "edges" | "geo" | "adjacency-undirected";
  data: string[];    
  nodeCoordinates?: string[];
}

export type RandomGraphDef = {
  name: string;
  type: "random";  
  nodeCount: number;
  edgesPerNode: number;  
  complete: boolean;
  bidirectional: boolean;
}

export type GraphDef = PredefinedGraphDef | RandomGraphDef;

export class GraphNode {
  
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