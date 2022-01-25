import { Graph, Path } from "../types";
import { PathQueue, QueueStrategy } from "./queueStrategies";
import { FRAME_MILLIS, ReportFindingCallback, ReportResultCallback, ReportStatusCallback } from ".";

const findShortestRoundtrip = (
  graph: Graph,
  queueStrategy: QueueStrategy,
  onReportStatus: ReportStatusCallback,
  onReportResult: ReportResultCallback<Path | null>,
  onReportFinding: ReportFindingCallback<Path>
) => {
  let best: Path | null = null;
  let stepCount = 0;
  let cancelled = false;

  const queue = PathQueue.of(queueStrategy);
  const path = Path.of(graph.nodeIds[0]);
  path.bidirectional = graph.props.bidirectional;
  queue.enqueue(path);
  const nodeCount = graph.nodeIds.length;

  const startTime = Date.now();
  let lastFrame = startTime;

  const iter = () => {
    let running = true;

    while (running && !cancelled && queue.length > 0) {
      stepCount++;
      const next = queue.dequeue()!;

      if (next.length === nodeCount + 1) {
        if (!best || next.weight < best.weight) {
          best = next;
          onReportFinding(best);
        }
      }
      if (next.length === nodeCount) {
        if (graph.isAdjacent(next.last, next.first)) {
          queue.enqueue(
            next.follow(graph.edgeForNodes(next.last, next.first)!)
          );
        }
      } else if (!best || next.weight < best.weight) {
        const nextEdges = graph.adjacentEdgesForPath(next);
        nextEdges.forEach((e) => queue.enqueue(next.follow(e)));
      }

      const now = Date.now();
      if (now - lastFrame > FRAME_MILLIS || cancelled || queue.length === 0) {
        running = false;
        lastFrame = now;
        const millis = now - startTime;
        onReportStatus(stepCount, queue.length, millis);
      }
    }
    if (queue.length > 0 && !cancelled) {
      window.requestAnimationFrame(iter);
    }
    if (queue.length === 0) {
      const elapsedMillis = Date.now() - startTime;
      onReportResult(best, stepCount, elapsedMillis);
      onReportStatus(stepCount, queue.length, elapsedMillis);
    }
  };

  const cancelCallback = () => {
    cancelled = true;
  };
  window.requestAnimationFrame(iter);
  return cancelCallback;
};



export { findShortestRoundtrip };
