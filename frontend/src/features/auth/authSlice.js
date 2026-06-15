import { createSlice, nanoid } from "@reduxjs/toolkit";


const initialState = {
  requests: [] 
};

export const authSlice = createSlice({
  name: "requests",
  initialState,
  reducers: {
    addRequest: (state, action) => {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      
      const newRequest = {   
        id: nanoid(),
        username: storedUser?.username || 'Employee',
        email: storedUser?.email || '',
        role: storedUser?.role || 'employee',
        days: action.payload.days,
        leaveType: action.payload.leaveType,
      };
      
      state.requests.push(newRequest);
    },
    approveRequest: (state, action) => {
      state.requests = state.requests.filter((request) => request.id !== action.payload);
    },
  }
});

export const { addRequest, approveRequest } = authSlice.actions;

export default authSlice.reducer;