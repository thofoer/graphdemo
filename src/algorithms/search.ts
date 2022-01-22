import { Graph, NodeId } from "../types";
import { FIFOStrategy } from './queueStrategies';

const dfs = (graph: Graph, startNode: NodeId, visitor: (node: NodeId) => void) => {

    const visited = new Map<NodeId, boolean>();

    const traverse = (node: NodeId): void => {

        if (!visited.get(node)) {
            visitor(node);
            visited.set(node, true);
            graph.adjacentNodesForNode(node).forEach( next => traverse(next));
        }
    }
    traverse(startNode);

}


const bfs = (graph: Graph, startNode: NodeId, visitor: (node: NodeId) => void) => {
    const queue = new FIFOStrategy<NodeId>();
    queue.enqueue(startNode);
    const visited = new Map<NodeId, boolean>();
    visited.set(startNode, true);

    while (!queue.isEmpty()) {
        const node = queue.dequeue();
        visitor(node);
        graph.adjacentNodesForNode(node)
             .filter( n => !visited.get(n))
             .forEach( n => {
                queue.enqueue(n);
                visited.set(n, true);
             });
    }
}


export { dfs, bfs };