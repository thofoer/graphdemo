import { FC } from "react";
import { Button, Card } from "react-bootstrap";
import { useSelector } from "react-redux";
import { graphSelector } from "../../store/graphObjectSlice";
import { Maze } from "../../types";
import { findAllPaths, findShortestPath, removeDeadends } from "../../algorithms/maze";

export const MazeComp: FC = () => {

    const maze = useSelector(graphSelector).graphObject;

    const fix = () => {
        if (maze && maze instanceof Maze) {
            removeDeadends(maze);
        }
    }

    const shortestPath = () => {
        if (maze && maze instanceof Maze) {
            console.log(findAllPaths(maze, maze.startPos, maze.targetPos));
        }
    }

    return (
        <> {maze && maze instanceof Maze &&
          <Card className="m-3">
            <Button onClick={fix}>Sackgassen entfernen</Button>
            <Button onClick={shortestPath}>Kürzester Pfad</Button>
            </Card>
            }
        </>
    );
}