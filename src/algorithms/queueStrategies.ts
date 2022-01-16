import { Path } from "../types";
import PriorityQueue from "ts-priority-queue";

type QueueStrategy = "simple" | "priorityWeight" | "priorityLengthAndWeight";

function pathWeightComparator(p1: Path, p2: Path) {
    return p1.weight - p2.weight;  
}

function pathLengthAndWeightComparator(p1: Path, p2: Path) {
    let res = p2.length - p1.length;
    if (res === 0) {
        res = p1.weight - p2.weight;
    }
    return res;      
}

abstract class PathQueue {
    abstract enqueue(p: Path): void;
    abstract dequeue(): Path;
    abstract get length(): number;

    static of(strategy: QueueStrategy) {
        switch(strategy) {
            case "simple":
                return new SimpleArrayStrategy();
            case "priorityWeight":
                return new PriorityQueueStrategy(pathWeightComparator);
            case "priorityLengthAndWeight":
                return new PriorityQueueStrategy(pathLengthAndWeightComparator);
            default:
                throw new Error("unknown strategy: "+strategy);
        }
    }
}

type PathComparator = (p1: Path, p2: Path) => number;

class PriorityQueueStrategy extends PathQueue {

    private queue: PriorityQueue<Path>;

    constructor(comparator: PathComparator) {
        super();
        this.queue = new PriorityQueue<Path>({comparator});
    }

    enqueue(path: Path) {
        this.queue.queue(path);
    }

    dequeue(): Path {
        return this.queue.dequeue();
    }

    get length() {
        return this.queue.length;
    }
}

class SimpleArrayStrategy extends PathQueue {
    private paths: Path[] = [];

    enqueue(path: Path) {
        this.paths.push(path);
    }

    dequeue(): Path {
        return this.paths.pop()!;
    }

    get length() {
        return this.paths.length;
    }
}

export { PathQueue };
export type { QueueStrategy };