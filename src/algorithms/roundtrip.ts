import { CalcResult, Graph, Path } from "../types";
import { PathQueue, QueueStrategy } from "./queueStrategies";

const FRAMES_PER_SECOND = 10;

const findShortestRoundtrip = (graph: Graph, queueStrategy: QueueStrategy): CalcResult<Path | null> => {
    let best: Path | null = null;
    let stepCount = 0;

    const queue = PathQueue.of(queueStrategy);

    queue.enqueue(Path.of(graph.nodeIds[0]));
    const nodeCount = graph.nodeIds.length;

    while (queue.length > 0) {
        stepCount++;
        const next = queue.dequeue()!;
        
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
    
    return {
        data: best,
        stepCount,
    };
};

const format = new Intl.NumberFormat("de-DE");

function formatNumber(s: number) {
    return format.format(s).replaceAll(".", "\u2009");
}

const findShortestRoundtripAsync = (graph: Graph, queueStrategy: QueueStrategy) => {
    let best: Path | null = null;
    let stepCount = 0;

    const queue = PathQueue.of(queueStrategy);

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
    const frameMillis = (1 / FRAMES_PER_SECOND) * 1000;
    const iter = () => {
        let running = true;

        if (stopFlag.value === "true") {            
            logField.value += "Abbruch\n";
        }

        while (running && queue.length > 0 && stopFlag.value !== "true") {
            stepCount++;
            const next = queue.dequeue()!;

            if (next.length === nodeCount + 1) {
                if (!best || next.weight < best.weight) {
                    best = next;
                    logField.value += "Neue Lösung: " + best.strRep() + "\n";
                    logField.scrollTop = logField.scrollHeight;
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

            const now = Date.now();
            if (now - lastFrame > frameMillis || stopFlag.value === "true" || queue.length === 0) {
                running = false;
                lastFrame = now;
                const millis = now - startTime;

                timeField.value = (millis / 1000).toString();

                stepCountField.value = formatNumber(stepCount);
                queueSizeField.value = queue.length.toString();
            }
        }

        if (queue.length > 0 && stopFlag.value !== "true") {
            window.requestAnimationFrame(iter);
        }
    };

    window.requestAnimationFrame(iter);
};


export {findShortestRoundtrip, findShortestRoundtripAsync};