import { MazeDef } from ".";

export const FREE = ".";
export const WALL = "#";
export const START_FIELD = "@";
export const TARGET_FIELD = "$";

export type Coord = { x: number, y: number};

export class Maze {

    private grid: string[][];
    public startPos: Coord;
    public targetPos: Coord;

    constructor(grid: string[][], startPos: Coord, targetPos: Coord){
        this.grid = grid;
        this.startPos = startPos;
        this.targetPos = targetPos;
    }

    width() {
        return this.grid[0].length;
    }

    height() {
        return this.grid.length;
    }

    isFree({x,y}: Coord) {
        return this.grid[y][x] === FREE;
    }

    get({x,y}: Coord) {
        return this.grid[y][x];
    }


    static of(def: MazeDef ) {        
        let startPos: Coord|null = null;
        let targetPos: Coord|null = null;
        const grid:string[][] = [[]];

        for(let y=0; y<def.data.length; y++) {
            grid[y]=[];
            for (let x=0; x<def.data[y].length; x++) {
                const tile = def.data[y].charAt(x);
                grid[y].push(tile);
                if (tile===START_FIELD) {
                    startPos = { x,y };                    
                }
                if (tile===TARGET_FIELD) {
                    targetPos = { x,y };                    
                }
            }
        }

        if (startPos && targetPos) {
           const res = new Maze(grid, startPos, targetPos);
           res.dump();                      
           return res;
        }
        else {
            throw new Error("no startpos / targetpos found");
        }

    }

    dump(logger: (s: string)=>void = console.log) {
        for(let row of this.grid) {
            logger(row.join(""));
        }
    }


}