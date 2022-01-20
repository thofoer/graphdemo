import { NavItem } from "./NavItem";
import { Link } from "react-router-dom";
import { FC } from "react";

interface OwnProps {  
  setGraphDefModalOpen: (b: boolean) => void;
}

export const NavBar: FC<OwnProps> = ({setGraphDefModalOpen}) => {

    return (
        <div className="d-flex justify-content-start mt-3">
          <NavItem>
            <Link to="/pathfinder">Pfadsuche</Link>
          </NavItem>
          <NavItem>
             <Link to="/roundtrip">Rundreise</Link>
          </NavItem>
          <NavItem>
             <Link to="/"  onClick={()=>setGraphDefModalOpen(true)}>Graph laden</Link>
          </NavItem>
        </div>
    );
};