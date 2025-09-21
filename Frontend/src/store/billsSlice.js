import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  bills: [],
};

const billsSlice = createSlice({
  name: 'bills',
  initialState,
  reducers: {
    addBill(state, action) {
      state.bills.push({ id: Date.now(), date: new Date().toISOString(), ...action.payload });
    },
  },
});

export const { addBill } = billsSlice.actions;
export default billsSlice.reducer;