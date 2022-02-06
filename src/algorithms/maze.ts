import { Maze } from "../types";
import { Coord } from "../types/Maze";
import { PriorityQueueStrategy } from "./queueStrategies";


const removeDeadends = (maze: Maze) => {

    console.time("deadend")
    let d = maze.findDeadend();
    while(d) {
        maze.removeDeadend(d);
        d = maze.findDeadend();
    }
    console.timeLog("deadend", "Sackgassen entfernt")
}

type Path = Coord[];

const strRep = (c: Coord) => {
    return `${c.x},${c.y}`;
}

const findShortestPath = (maze: Maze, start: Coord, destination: Coord) => {
    const queue = new PriorityQueueStrategy<Path>( (a,b) => a.length - b.length);
    queue.enqueue([start]);

    const visited = new Map<string, boolean>();
    visited.set(strRep(start), true);

    while (!queue.isEmpty()) {
        const path = queue.dequeue();
        const lastCoord = path[path.length-1];
        if (lastCoord.x === destination.x && lastCoord.y === destination.y ) {
            return path;
        }
        maze.adjacentFreeCoords(lastCoord)
             .filter( n => !visited.get(strRep(n)))
             .forEach( n => {
                queue.enqueue([...path, n]);
                visited.set(strRep(n), true);
             });
    }
    return null;
}

const findAllPaths = (maze: Maze, start: Coord, destination: Coord) => {
    const res: Path[] = [];
    const queue = new PriorityQueueStrategy<Path>( (a,b) => a.length - b.length);
    queue.enqueue([start]);
    
    while (!queue.isEmpty()) {    
        const path = queue.dequeue();    
        const lastCoord = path[path.length-1];
        if (lastCoord.x === destination.x && lastCoord.y === destination.y ) {
            res.push( path);
        }
        maze.adjacentFreeCoords(lastCoord)
             .filter( n => !path.map(i=>strRep(i)).includes(strRep(n)))
             .forEach( n => {
                queue.enqueue([...path, n]);                
             });
    }    
    return res;
}


export { removeDeadends, findShortestPath, findAllPaths };
