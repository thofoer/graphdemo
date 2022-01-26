import { GraphNode, GraphDef, NodeId, RandomGraphDef, MazeDef } from './GraphNode';
import { Edge } from './Edge';
import { Maze } from './Maze';
import { Path } from './Path';
import { Graph } from './Graph';
import { CalcResult } from './CalcResult';

export type { CalcResult, GraphDef, NodeId, RandomGraphDef, MazeDef };
export { GraphNode, Edge, Path, Graph, Maze };



export type GraphObject = Graph | Maze;