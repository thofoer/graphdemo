import { Graph, Path, NodeId } from "./types";
import PriorityQueue from "ts-priority-queue";

export type CalcResult<T> = {
    stepCount: number;
    data: T;
}

abstract class QueueStrategy {
    abstract enqueue (p: Path): void;
    abstract dequeue (): Path;
    abstract get length(): number;
  }

  class PriorityQueueStrategy extends QueueStrategy  {
    
    private queue = new PriorityQueue<Path>({ comparator: function(a: Path, b: Path) { 
      return a.compare(b);      
    }});

    enqueue (p: Path) {
      this.queue.queue(p);
    }

    dequeue (): Path {
      return this.queue.dequeue();
    }

    get length() {
      return this.queue.length;
    }
  }

  class SimpleArrayStrategy extends QueueStrategy  {
    private paths: Path[] = [];

    enqueue (p: Path) {
      this.paths.push(p);
    }

    dequeue (): Path {
      return this.paths.pop()!;
    }

    get length() {
      return this.paths.length;
    }
  }



const calculateAllPaths = (
  graph: Graph,
  startNode: NodeId,
  targetNode: NodeId
): CalcResult<Path[]> => {
  const paths =new PriorityQueueStrategy();
  const result: Path[] = [];

  let stepCount = 0;
  paths.enqueue(Path.of(startNode));

  while (paths.length > 0) {
    stepCount++;
    const next = paths.dequeue()!;

    if (next.isComplete(startNode, targetNode)) {
      result.push(next);
    } else {
      const nextEdges = graph.adjacentEdgesForPath(next);
      nextEdges.forEach((e) => paths.enqueue(next.follow(e)));
    }
  }

  return {
      stepCount,
      data: result
  };
};

const calculateShortestPath = (graph: Graph, startNode: NodeId, targetNode: NodeId, priorityQueueStrategy: boolean = false): CalcResult<Path|null> => {
    let best: Path | null = null;
    let stepCount = 0;
   
    const queue = priorityQueueStrategy ? new PriorityQueueStrategy() : new SimpleArrayStrategy();

    queue.enqueue(Path.of(startNode));

    while (queue.length>0) { 
      stepCount++;
      const next = queue.dequeue()!;
      
      if (next.isComplete(startNode, targetNode)) {
        if ( !best || next.weight < best.weight) {
          best = next;
        }       
      }
      else if (!best || next.weight<best.weight){
        const nextEdges = graph.adjacentEdgesForPath(next);          
        nextEdges.forEach( e => queue.enqueue(next.follow(e)));          
      }
    }      
    return {data: best, stepCount};
}

const calculateShortestRoundtrip = (graph: Graph, priorityQueueStrategy: boolean = false): CalcResult<Path|null> => {
  let best: Path | null = null;
  let stepCount = 0;
 
  const queue = priorityQueueStrategy ? new PriorityQueueStrategy() : new SimpleArrayStrategy();

  queue.enqueue(Path.of(graph.nodeIds[0]));
  const nodeCount = graph.nodeIds.length;

  while (queue.length>0) { 
    stepCount++;
    const next = queue.dequeue()!;
    if (stepCount%10000===0) {

      console.log(stepCount, queue.length, best);      
    }
    
    if (next.length === nodeCount+1) {
      if ( !best || next.weight < best.weight) {
        best = next;
      }    
    }
    if (next.length === nodeCount ){
      if( graph.isAdjacent(next.last, next.first)) {      
      queue.enqueue(next.follow(graph.edgeForNodes(next.last, next.first)!));
    } 
  }
    else if (!best || next.weight<best.weight){
      const nextEdges = graph.adjacentEdgesForPath(next);          
      nextEdges.forEach( e => queue.enqueue(next.follow(e)));          
    }  
    
  }
  console.log("ende", best);
  return {data: best, stepCount};
}



export {calculateAllPaths, calculateShortestPath, calculateShortestRoundtrip};