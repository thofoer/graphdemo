import { MazeDef } from ".";


export class Maze {

    static of(def: MazeDef ) {
        console.log("MAZE");
        return new Maze();
    }
}