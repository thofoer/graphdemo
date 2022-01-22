
import {Route } from "react-router-dom";
import classes from "./SideBar.module.scss";
import { NavBar } from './NavBar';
import { FC } from "react";
import { PathfinderComp } from "../Pathfinder/PathfinderComp";
import { RoundtripComp } from "../Roundtrip/RoundtripComp";
 
interface OwnProps {  
  setGraphDefModalOpen: (b: boolean) => void;
}

export const SideBar: FC<OwnProps> = ({setGraphDefModalOpen}) => {

    return (
        <div className={classes.nav}>
          <NavBar setGraphDefModalOpen={setGraphDefModalOpen}/>
          <Route path="/pathfinder">            
            <PathfinderComp/>
          </Route>
          <Route path="/roundtrip">
            <RoundtripComp/>
          </Route>
          
        </div>
    );
};