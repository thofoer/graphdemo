import { Graph, Path, NodeId } from "./types";
import PriorityQueue from "ts-priority-queue";

export type CalcResult<T> = {
  stepCount: number;
  data: T;
};

abstract class QueueStrategy {
  abstract enqueue(p: Path): void;
  abstract dequeue(): Path;
  abstract get length(): number;
}

class PriorityQueueStrategy extends QueueStrategy {
  private queue = new PriorityQueue<Path>({
    comparator: function (a: Path, b: Path) {
      return a.compare(b);
    },
  });

  enqueue(p: Path) {
    this.queue.queue(p);
  }

  dequeue(): Path {
    return this.queue.dequeue();
  }

  get length() {
    return this.queue.length;
  }
}

class SimpleArrayStrategy extends QueueStrategy {
  private paths: Path[] = [];

  enqueue(p: Path) {
    this.paths.push(p);
  }

  dequeue(): Path {
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
  const paths = new PriorityQueueStrategy();
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
    data: result,
  };
};

const calculateShortestPath = (
  graph: Graph,
  startNode: NodeId,
  targetNode: NodeId,
  priorityQueueStrategy: boolean = false
): CalcResult<Path | null> => {
  let best: Path | null = null;
  let stepCount = 0;

  const queue = priorityQueueStrategy
    ? new PriorityQueueStrategy()
    : new SimpleArrayStrategy();

  queue.enqueue(Path.of(startNode));

  while (queue.length > 0) {
    stepCount++;
    const next = queue.dequeue()!;

    if (next.isComplete(startNode, targetNode)) {
      if (!best || next.weight < best.weight) {
        best = next;
      }
    } else if (!best || next.weight < best.weight) {
      const nextEdges = graph.adjacentEdgesForPath(next);
      nextEdges.forEach((e) => queue.enqueue(next.follow(e)));
    }
  }
  return { data: best, stepCount };
};

const calculateShortestRoundtrip = (
  graph: Graph,
  priorityQueueStrategy: boolean = false
): CalcResult<Path | null> => {
  let best: Path | null = null;
  let stepCount = 0;

  const queue = priorityQueueStrategy
    ? new PriorityQueueStrategy()
    : new SimpleArrayStrategy();

  queue.enqueue(Path.of(graph.nodeIds[0]));
  const nodeCount = graph.nodeIds.length;

  while (queue.length > 0) {
    stepCount++;
    const next = queue.dequeue()!;
    if (stepCount % 10000 === 0) {
      console.log(stepCount, queue.length, best);
    }

    if (next.length === nodeCount + 1) {
      if (!best || next.weight < best.weight) {
        best = next;
      }
    }
    if (next.length === nodeCount) {
      if (graph.isAdjacent(next.last, next.first)) {
        queue.enqueue(next.follow(graph.edgeForNodes(next.last, next.first)!));
      }
    } else if (!best || next.weight < best.weight) {
      const nextEdges = graph.adjacentEdgesForPath(next);
      nextEdges.forEach((e) => queue.enqueue(next.follow(e)));
    }
  }
  console.log("ende", best);
  return { data: best, stepCount };
};

const calculateShortestRoundtripAsync = (graph: Graph) => {
  let best: Path | null = null;
  let stepCount = 0;

  const queue = new PriorityQueueStrategy();

  queue.enqueue(Path.of(graph.nodeIds[0]));
  const nodeCount = graph.nodeIds.length;
  const stepCountField: HTMLInputElement = document.getElementById("stepCount")! as HTMLInputElement;
  const queueSizeField: HTMLInputElement = document.getElementById("queueSize")! as HTMLInputElement;
  const timeField: HTMLInputElement = document.getElementById("time")! as HTMLInputElement;
  const logField: HTMLInputElement = document.getElementById("log")! as HTMLInputElement;
  const stopFlag: HTMLInputElement = document.getElementById("stopFlag")! as HTMLInputElement;

  logField.value = "";
  const startTime = Date.now();
  let lastFrame = startTime;
  

  const iter = () => {
    let running = true;

    if(stopFlag.value==="true") {
      console.log("ABBUCH");
      logField.value += "Abbruch\n";
    }    

    while (running && queue.length > 0 && stopFlag.value!=="true") {
  
      stepCount++;
      const next = queue.dequeue()!;
    

      if (next.length === nodeCount + 1) {
        if (!best || next.weight < best.weight) {
          best = next;
          logField.value += "Neue Lösung: "+best.strRep()+"\n";
        }
      }
      if (next.length === nodeCount) {
        if (graph.isAdjacent(next.last, next.first)) {
          queue.enqueue(
            next.follow(graph.edgeForNodes(next.last, next.first)!)
          );
        }
      } 
      else if (!best || next.weight < best.weight) {
        const nextEdges = graph.adjacentEdgesForPath(next);
        nextEdges.forEach((e) => queue.enqueue(next.follow(e)));
      }

      const now = Date.now();
      if (now-lastFrame > 50 || stopFlag.value==="true" || queue.length===0 ) {
        running = false;
        lastFrame = now;
        const millis = now - startTime;
      
        timeField.value = (millis/1000).toString();
           
        stepCountField.value = stepCount.toString();
        queueSizeField.value = queue.length.toString();
      }    
    }


   
    if (queue.length>0 && stopFlag.value!=="true") {
       window.requestAnimationFrame(iter);
    }
  };

  window.requestAnimationFrame(iter);
};

export { calculateAllPaths, calculateShortestPath, calculateShortestRoundtrip, calculateShortestRoundtripAsync };
