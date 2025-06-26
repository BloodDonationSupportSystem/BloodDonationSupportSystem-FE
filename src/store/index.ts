import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import bloodInfoReducer from './slices/bloodInfoSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    bloodInfo: bloodInfoReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 