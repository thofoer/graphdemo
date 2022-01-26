import { NavItem } from "./NavItem";
import { Link } from "react-router-dom";
import { FC } from "react";


export const NavBar: FC = () => {

    return (
        <div className="d-flex justify-content-start mt-3">
          <NavItem>
            <Link to="/pathfinder">Pfadsuche</Link>
          </NavItem>
          <NavItem>
             <Link to="/roundtrip">Rundreise</Link>
          </NavItem>
          <NavItem>
             <Link to="/tspga">TSP GA</Link>
          </NavItem>
        </div>
    );
};