import {  GraphNode } from ".";
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
  