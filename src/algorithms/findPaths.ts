import { Graph, Path, CalcResult, NodeId } from "../types";
import { PathQueue, QueueStrategy } from "./queueStrategies";

const findAllPaths = (
    graph: Graph,
    startNode: NodeId,
    targetNode: NodeId,
    queueStrategy: QueueStrategy
): CalcResult<Path[]> => {
    const paths = PathQueue.of(queueStrategy);
    const result: Path[] = [];

    let stepCount = 0;
    paths.enqueue(Path.of(startNode));

    const startTime = Date.now();

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
        timeInMillis: Date.now() - startTime,
    };
};

const findShortestPath = (
    graph: Graph,
    startNode: NodeId,
    targetNode: NodeId,
    queueStrategy: QueueStrategy
): CalcResult<Path | null> => {
    let best: Path | null = null;
    let stepCount = 0;

    const queue = PathQueue.of(queueStrategy);

    queue.enqueue(Path.of(startNode));

    while (queue.length > 0) {
        stepCount++;
        const next = queue.dequeue()!;

        if (!best || next.weight < best.weight) {
            if (next.isComplete(startNode, targetNode)) {
                best = next;
            } else {
                graph //
                    .adjacentEdgesForPath(next)
                    .forEach((edge) => queue.enqueue(next.follow(edge)));
            }
        }
    }
    return {
        data: best,
        stepCount,
    };
};

export { findAllPaths, findShortestPath};