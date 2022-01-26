
import {Route } from "react-router-dom";
import classes from "./SideBar.module.scss";
import { NavBar } from './NavBar';
import { FC } from "react";
import { PathfinderComp } from "../Pathfinder/PathfinderComp";
import { RoundtripComp } from "../Roundtrip/RoundtripComp";
import { TspGeneticAlgorithmComp } from "../TspGeneticAlgorithm/TspGeneticAlgorithmComp";
 


export const SideBar: FC = () => {

    return (
        <div className={classes.nav}>
          <NavBar />
          <Route path="/pathfinder">            
            <PathfinderComp/>
          </Route>
          <Route path="/roundtrip">
            <RoundtripComp/>
          </Route>
          <Route path="/tspga">
            <TspGeneticAlgorithmComp/>
          </Route>
        </div>
    );
};