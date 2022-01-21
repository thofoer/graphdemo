import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { rootReducer } from "./index";
import { Graph } from "../types";

const initialState: GraphState = {graph: null};

interface GraphState {
    graph: Graph | null;
}

type SetGraphAction = PayloadAction<Graph>;

const graphSlice = createSlice({
    name: "graph",
    initialState,    
    reducers: {
        setGraph(state, action: SetGraphAction) {
            return {
                ...state,
                graph: action.payload
            }
        }
    }
})

// Actions generated via `createSlice`
export const { setGraph } = graphSlice.actions;

// Selector
export const graphSelector = (state: ReturnType<typeof rootReducer>) => state.graphSlice;

// Reducer
export default graphSlice.reducer;