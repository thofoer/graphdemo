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
        if (x<0 || y<0 || x>=this.width() || y>=this.height()) {
            return false;
        }
        return this.grid[y][x] !== WALL;
    }    

    get({x,y}: Coord) {        
        return this.grid[y][x];
    }

    adjacentFreeCoords({x,y}: Coord) {
        const res: Coord[] = [];
        for (let offset of  [[0,1],[0,-1],[1,0],[-1,0]]) {
            if (this.isFree({x:x+offset[0], y:y+offset[1]})) {
                res.push({x:x+offset[0], y:y+offset[1]})
            }
        }
        return res;
    }

    isDeadend({x,y}: Coord) {
        if (x<0 || y<0 || x>=this.width() || y>=this.height()) {
            return false;
        }
        if (this.get({x,y})===FREE) {
            const up    = y > 0               ? this.grid[y-1][x] : WALL;
            const down  = y < this.height()-1 ? this.grid[y+1][x] : WALL;
            const right = x > 0               ? this.grid[y][x-1] : WALL;
            const left  = x < this.width()-1  ? this.grid[y][x+1] : WALL;

            if ( (up===WALL ? 1:0)+(down===WALL ? 1:0)+(left===WALL ? 1:0)+(right===WALL ? 1:0) === 3) {
                return true;
            }
        }
        return false;
    }

    findDeadend(): Coord | null {
        for (let y=0; y<this.height(); y++) {
            for (let x=0; x<this.width(); x++) {
                if (this.isDeadend({x,y})) {                   
                    return {x,y};                   
                }
            }
        }
        return null;
    }

    removeDeadend({x,y}: Coord) {
        if (this.isDeadend({x,y})) {
            this.grid[y][x] = WALL;
            this.removeDeadend({x:x-1, y:y});
            this.removeDeadend({x:x+1, y:y});
            this.removeDeadend({x:x, y:y-1});
            this.removeDeadend({x:x, y:y+1});
        }
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