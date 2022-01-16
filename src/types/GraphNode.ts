export type NodeId = string;

export type GraphDef = {
  name: string;
  type: "edges" | "geo"
  data: string[];
}

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