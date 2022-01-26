import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { rootReducer } from "./index";
import { GraphObject } from "../types";

const initialState: GraphState = {graphObject: null};

interface GraphState {
    graphObject: GraphObject | null;
}

type SetGraphObjectAction = PayloadAction<GraphObject>;

const graphObjectSlice = createSlice({
    name: "graph",
    initialState,    
    reducers: {
        setGraphObject(state, action: SetGraphObjectAction) {
            return {
                ...state,
                graphObject: action.payload
            }
        },
    }
})

// Actions generated via `createSlice`
export const { setGraphObject } = graphObjectSlice.actions;

// Selector
export const graphSelector = (state: ReturnType<typeof rootReducer>) => state.graphObjectSlice;

// Reducer
export default graphObjectSlice.reducer;