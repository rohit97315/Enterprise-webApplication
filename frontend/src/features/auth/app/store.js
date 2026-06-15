import { configureStore } from "@reduxjs/toolkit";
import { authSlice } from "../authSlice";
import screenReducer from "../screenerSlice"

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    screener:screenReducer,
  },
});