import { configureStore, combineReducers, getDefaultMiddleware } from "@reduxjs/toolkit";

import graphObjectSlice from "./graphObjectSlice";

export const rootReducer = combineReducers({
    graphObjectSlice,

});

const store = configureStore(
    { reducer: rootReducer,
        middleware: (getDefaultMiddleware) => getDefaultMiddleware({serializableCheck: false}),
    });

export default store;


