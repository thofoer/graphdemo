import { NavItem } from "./NavItem";
import { Link } from "react-router-dom";
import { FC } from "react";
import { useSelector } from "react-redux";
import { graphSelector } from "../../store/graphObjectSlice";
import { Graph, Maze } from "../../types";


export const NavBar: FC = () => {
  
    const graph = useSelector(graphSelector).graphObject;

    return (
        <div className="d-flex justify-content-start mt-3">
          {graph && graph instanceof Graph ?
          (<>
            <NavItem>
              <Link to="/pathfinder">Pfadsuche</Link>
            </NavItem>
            <NavItem>
              <Link to="/roundtrip">Rundreise</Link>
            </NavItem>
            <NavItem>
              <Link to="/tspga">TSP GA</Link>
            </NavItem>
          </>)
          : graph && graph instanceof Maze ? (
          
            <NavItem>
              <Link to="/maze">Maze</Link>
            </NavItem>
          )
          : (<div></div>)
        }
        </div>
    );
};