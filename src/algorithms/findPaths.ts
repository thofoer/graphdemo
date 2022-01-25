import { Graph, Path, CalcResult, NodeId } from "../types";
import { PathQueue, QueueStrategy } from "./queueStrategies";
import { FRAME_MILLIS, ReportResultCallback, ReportStatusCallback } from '.';


const findAllPaths = (
    graph: Graph,
    startNode: NodeId,
    targetNode: NodeId,
    queueStrategy: QueueStrategy,
    onReportStatus: ReportStatusCallback,
    onReportResult: ReportResultCallback<Path[]>,
) => {
    const paths = PathQueue.of(queueStrategy);
    const result: Path[] = [];

    let cancelled = false;
    let stepCount = 0;
    const path = Path.of(startNode);
    path.bidirectional = graph.props.bidirectional;
    paths.enqueue(path);

    const startTime = Date.now();
    let lastFrame = startTime;    

    const iter = () => {
        
        let running = true;

        while (running && !cancelled && paths.length > 0) {
            stepCount++;
            const next = paths.dequeue()!;

            if (next.isComplete(startNode, targetNode)) {
                result.push(next);
            } else {
                const nextEdges = graph.adjacentEdgesForPath(next);
                nextEdges.forEach((e) => paths.enqueue(next.follow(e)));
            }

            const now = Date.now();
            if (now - lastFrame > FRAME_MILLIS || cancelled || paths.length === 0) {
                running = false;
                lastFrame = now;
                const millis = now - startTime;                
                onReportStatus(stepCount, paths.length, millis);                
            }
        }
        if (paths.length > 0 && !cancelled ) {
            window.requestAnimationFrame(iter);
        }
        if (paths.length===0) {
            const elapsedMillis = Date.now()-startTime;
            onReportResult(result, stepCount, elapsedMillis);
            onReportStatus(stepCount, paths.length, elapsedMillis);         
        }
    }

    const cancelCallback = () => {
        cancelled = true;
    }
    window.requestAnimationFrame(iter);
    return cancelCallback;
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
    const startTime = Date.now();
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
        timeInMillis: Date.now() - startTime
    };
};

export { findAllPaths, findShortestPath };