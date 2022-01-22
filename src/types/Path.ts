import { Edge, NodeId } from ".";

export class Path {
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
          let n1 = this.nodes[i];
          let n2 = this.nodes[i+1];
          if (n1>n2) {
            [n1, n2] = [n2, n1];
          }
          this._edgeIds.push(`${n1}->${n2}`);
        }
      }
      return this._edgeIds;
    }
   
    compare(o: Path) { 
      // //return 0;
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