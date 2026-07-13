import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/auth'; // Express Server Port

export const screenNewCandidate = createAsyncThunk(
    'screener/screenNewCandidate',
    async (formData, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/process`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials:true
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Network Processing Error');
        }
    }
);

export const fetchCandidates = createAsyncThunk(
    'screener/fetchCandidates',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/candidates`, { withCredentials: true });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to sync applications');
        }
    }
);


export const deleteCandidate = createAsyncThunk(
     'screener/deleteCandidate',
     async (id, { rejectWithValue }) => {
         try {
             await axios.delete(`${API_BASE_URL}/candidates/${id}`, { withCredentials: true });
             return id;
         } catch (error) {
             return rejectWithValue(error.response?.data?.error || 'Failed to remove candidate');
         }
     }
 );


const screenerSlice = createSlice({
    name: 'screener',
    initialState: {
        candidates: [],
        loading: false,
        error: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Screening Lifecycle
            .addCase(screenNewCandidate.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(screenNewCandidate.fulfilled, (state, action) => {
                state.loading = false;
                state.candidates.unshift(action.payload); // Add new entry on top
                state.candidates.sort((a, b) => b.score - a.score); // Re-rank on frontend
            })
            .addCase(screenNewCandidate.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch Lifecycle
            .addCase(fetchCandidates.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCandidates.fulfilled, (state, action) => {
                state.loading = false;
                state.candidates = action.payload;
            })
            .addCase(fetchCandidates.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            builder
            .addCase(deleteCandidate.fulfilled, (state, action) => {
                state.candidates = state.candidates.filter(c => c._id !== action.payload);
            })
            .addCase(deleteCandidate.rejected, (state, action) => {
                state.error = action.payload;
            });
            
            
            
    }
});

export default screenerSlice.reducer;