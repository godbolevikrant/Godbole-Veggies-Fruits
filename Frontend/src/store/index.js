import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import productsReducer from './productsSlice';
import billsReducer from './billsSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productsReducer,
    bills: billsReducer,
  },
});

export default store;