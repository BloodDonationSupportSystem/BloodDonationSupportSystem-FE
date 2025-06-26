import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '@/services/api/authService';

interface UserState {
  currentUser: User | null;
  isLoggedIn: boolean;
  loading: boolean;
}

const initialState: UserState = {
  currentUser: null,
  isLoggedIn: false,
  loading: false,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.currentUser = action.payload;
      state.isLoggedIn = !!action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    logout: (state) => {
      state.currentUser = null;
      state.isLoggedIn = false;
    },
  },
});

export const { setUser, setLoading, logout } = userSlice.actions;
export default userSlice.reducer; 