import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const loginRequest = createAsyncThunk(
  'auth/login',
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:5000'}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-API-KEY': (import.meta.env.VITE_API_KEY || 'dev-secret-key') },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return rejectWithValue(data.error || 'Login failed');
      }
      return data.user || { username };
    } catch (err) {
      return rejectWithValue(err.message || 'Network error');
    }
  }
);

const initialState = {
  isAuthenticated: localStorage.getItem('isAuthenticated') === 'true',
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null,
};

// Removed async login. Using hardcoded credentials.

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.isAuthenticated = false;
      state.user = null;
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('user');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginRequest.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload;
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('user', JSON.stringify(state.user));
      })
      .addCase(loginRequest.rejected, (state) => {
        state.isAuthenticated = false;
        state.user = null;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;