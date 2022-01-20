import { FC } from "react";
import classes from "./SideBar.module.scss";

export const NavItem: FC = (props) => {

    return (
        <div className={classes.navItem}>
          {props.children}
        </div>
    );
};