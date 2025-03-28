import { configureStore } from '@reduxjs/toolkit';
import scoreReducer from './scoreSlice';
import { setupListeners } from "@reduxjs/toolkit/query"

const store = configureStore({
  reducer: {
    score: scoreReducer,
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({ 
        ignoredActionPaths: ["payload.socket"],
        ignoredPaths: ["score.socket"],
    })
});

setupListeners(store.dispatch);

export default store;