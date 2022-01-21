import { configureStore, combineReducers, getDefaultMiddleware } from "@reduxjs/toolkit";

import graphSlice from "./graphSlice";

export const rootReducer = combineReducers({
    graphSlice,

});

const store = configureStore(
    { reducer: rootReducer,
        middleware: (getDefaultMiddleware) => getDefaultMiddleware({serializableCheck: false}),
    });

export default store;


