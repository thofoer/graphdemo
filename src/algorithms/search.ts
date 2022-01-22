import { Graph, NodeId } from "../types";

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

export { dfs };