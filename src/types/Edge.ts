import {  GraphNode } from ".";
import { geoDistance } from "../algorithms/utils";
import {NodeId} from "./GraphNode";

export class Edge {
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
      const distance = geoDistance(n1.y!, n1.x!, n2.y!, n2.x!);      
      return new Edge(n1.name, n2.name, Math.round(distance), true);
    }
  
  }
  