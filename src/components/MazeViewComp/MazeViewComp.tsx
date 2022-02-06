import { useCallback, useEffect, useState, VFC } from "react";
import { Button } from "react-bootstrap";
import { Maze } from "../../types";
import { WALL, FREE, START_FIELD } from "../../types/Maze";
import classes from "./MazeViewComp.module.scss"; 


interface OwnProps {
    maze: Maze;
}

export const TILE_SIZE = 20;
export const FONT_SIZE = 10;

export const MazeViewComp: VFC<OwnProps> = ({maze}) => {
    
    const [tiles, setTiles] = useState<HTMLCollection>();
    const [r, setR]=useState(0);

    const renderMaze = useCallback( () => {
        if (maze) {
            const dest = document.getElementById("maze")!;

            for(let x=0; x<maze.width(); x++) {
                for(let y=0; y<maze.height(); y++) {

                    const newTile = document.createElement("span");                
                    newTile.className=`${classes.tile}`                
                    newTile.style.left=`${TILE_SIZE*x}px`;
                    newTile.style.top=`${TILE_SIZE*y}px`;
                    newTile.style.height=`${TILE_SIZE}px`;                    
                    newTile.style.width=`${TILE_SIZE}px`;
                    newTile.style.fontSize=`${FONT_SIZE}px`;
                    const c = maze.get({x,y});

                    if (x===0 || x===maze.width()-1) {                        
                        if (y%5===0) {
                            newTile.style.color = "white";
                            newTile.textContent = ""+y;
                        }
                    
                    }
                    if (y===0 || y===maze.height()-1) {                        
                        if (x%5===0) {
                            newTile.style.color = "white";
                            newTile.textContent = ""+x;
                        }
                    }

                    if (c === WALL) {
                        newTile.style.backgroundColor="red";
                    }
                    else if (c!==FREE){
                        newTile.textContent = c;
                        if (c===START_FIELD) {
                            newTile.style.backgroundColor = "lightgreen";
                        }  
                        else if (c!==FREE && c!==WALL){
                            newTile.style.backgroundColor = "lightblue";
                        }                    
                    }
                   
                    dest.appendChild(newTile);
                }
            }            
            setTiles(dest.children);
        }
    },
    [maze, r]);

    useEffect( ()=> {
        if (maze) {           
           renderMaze();
        }
    }, 
    [ maze, renderMaze]);


    const rerender = () => {
        setR((n)=>n+1)
    }

    return (
        <div className={classes.root} style={{width: `${1+TILE_SIZE*maze.width()}px`, height: `${1+TILE_SIZE*maze.height()}px`}}>Key Maze                
            <p>
                <Button onClick={rerender}>Rerender</Button>
            </p>            
            <div className="d-flex" style={{overflow: "scroll",width: `${1+TILE_SIZE*maze.width()}px`, height: "800px"}}>
                <div className={classes.maze} id="maze"/>
            </div>
        </div>
    );
}