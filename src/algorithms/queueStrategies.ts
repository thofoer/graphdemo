import { Path } from "../types";
import PriorityQueue from "ts-priority-queue";

type QueueStrategy = "lifo" | "fifo" | "priorityWeight" | "priorityLengthAndWeight";

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

abstract class Queue<T> {
    abstract enqueue(p: T): void;
    abstract dequeue(): T;
    abstract get length(): number;

    isEmpty() {        
        return this.length === 0;
    }
}

abstract class PathQueue extends Queue<Path>{
    static of(strategy: QueueStrategy) {
        switch(strategy) {
            case "lifo":
                return new LIFOStrategy<Path>();
            case "fifo":
                return new FIFOStrategy<Path>();
            case "priorityWeight":
                return new PriorityQueueStrategy<Path>(pathWeightComparator);
            case "priorityLengthAndWeight":
                return new PriorityQueueStrategy<Path>(pathLengthAndWeightComparator);
            default:
                throw new Error("unknown strategy: "+strategy);
        }
    }
}

type QueueComparator<T> = (p1: T, p2: T) => number;

class PriorityQueueStrategy<T> extends Queue<T> {

    private queue: PriorityQueue<T>;

    constructor(comparator: QueueComparator<T>) {
        super();
        this.queue = new PriorityQueue<T>({comparator});
    }

    enqueue(path: T) {
        this.queue.queue(path);
    }

    dequeue(): T {
        return this.queue.dequeue();
    }

    get length() {
        return this.queue.length;
    }
}

class LIFOStrategy<T> extends Queue<T> {
    private paths: T[] = [];

    enqueue(path: T) {
        this.paths.push(path);
    }

    dequeue(): T {
        return this.paths.pop()!;
    }

    get length() {
        return this.paths.length;
    }
}

class FIFOStrategy<T> extends Queue<T> {
    private paths: T[] = [];

    enqueue(path: T) {
        this.paths.push(path);
    }

    dequeue(): T {
        return this.paths.shift()!;
    }

    get length() {
        return this.paths.length;
    }
}

export { Queue, PathQueue, LIFOStrategy, FIFOStrategy, PriorityQueueStrategy };
export type { QueueStrategy };