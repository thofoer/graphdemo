
import {Route } from "react-router-dom";
import classes from "./SideBar.module.scss";
import { NavBar } from './NavBar';
import { GraphDefinitionModal } from "../GraphDefinition/GraphDefinitionModal";
import { FC } from "react";
import { PathfinderComp } from "../Pathfinder/PathfinderComp";
 
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
            <h1>Rundreise</h1>
          </Route>
          
        </div>
    );
};