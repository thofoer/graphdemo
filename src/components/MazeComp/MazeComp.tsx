import { useCallback, useEffect, useState, VFC } from "react";
import { Maze } from "../../types";
import { WALL, FREE } from "../../types/Maze";
import classes from "./MazeComp.module.scss"; 


interface OwnProps {
    maze: Maze;
}

export const TILE_SIZE = 20;

export const MazeComp: VFC<OwnProps> = ({maze}) => {
    
    const [tiles, setTiles] = useState<HTMLCollection>();

    const renderMaze = useCallback( () => {
        if (maze) {
            const dest = document.getElementById("maze")!;

            for(let x=0; x<maze.width(); x++) {
                for(let y=0; y<maze.height(); y++) {

                    const newTile = document.createElement("span");                
                    newTile.className=`${classes.tile}`                
                    newTile.style.left=`${TILE_SIZE*x}px`;
                    newTile.style.top=`${TILE_SIZE*y}px`;
                    const c = maze.get({x,y});

                    if (c === WALL) {
                        newTile.style.backgroundColor="red";
                    }
                    else if (c!==FREE){
                        newTile.textContent = c;
                        if (c==="@") {
                            newTile.style.backgroundColor = "lightgreen";
                        }                      
                    }
                    if (x===0 || x===maze.width()-1) {
                        newTile.style.backgroundColor="#777777";
                        if (y%5===0) {
                            newTile.style.color = "white";
                            newTile.textContent = ""+y;
                        }
                    
                    }
                    if (y===0 || y===maze.height()-1) {
                        newTile.style.backgroundColor="#777777";
                        if (x%5===0) {
                            newTile.style.color = "white";
                            newTile.textContent = ""+x;
                        }
                    }
                    dest.appendChild(newTile);
                }
            }            
            setTiles(dest.children);
        }
    },
    [maze]);

    useEffect( ()=> {
        if (maze) {           
           renderMaze();
        }
    }, 
    [ maze, renderMaze]);

    return (
        <div className={classes.root}>Key Maze                
            <p>
                Bla           
            </p>
            <div className={classes.maze} id="maze"/>
        </div>
    );
}