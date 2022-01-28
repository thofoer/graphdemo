import { MazeDef } from ".";

export const FREE = ".";
export const WALL = "#";
export const START_FIELD = "@";

export type Coord = { x: number, y: number};

export class Maze {

    private grid: string[][];
    private startPos: Coord;

    constructor(grid: string[][], startPos: Coord){
        this.grid = grid;
        this.startPos = startPos;
    }

    width() {
        return this.grid[0].length;
    }

    height() {
        return this.grid.length;
    }


    static of(def: MazeDef ) {
        console.log("MAZE");
        let startPos: Coord|null = null;
        const grid:string[][] = [[]];

        for(let y=0; y<def.data.length; y++) {
            grid[y]=[];
            for (let x=0; x<def.data[y].length; x++) {
                const tile = def.data[y].charAt(x);
                grid[y].push(tile);
                if (tile===START_FIELD) {
                    startPos = { x,y };                    
                }
            }
        }

        if (startPos) {
           const res = new Maze(grid, startPos);
           res.dump();
           return res;
        }
        else {
            throw new Error("no startpos found");
        }

    }

    dump(logger: (s: string)=>void = console.log) {
        for(let row of this.grid) {
            logger(row.join(""));
        }
    }


}