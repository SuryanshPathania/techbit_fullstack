
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "http://localhost:3000/movies";

// 🔹 Fetch Movies (For Logged-in User)
export const fetchMovies = createAsyncThunk("movies/fetchMovies", async (_, { getState, rejectWithValue }) => {
  try {
    const token = getState().auth.user?.token;
    if (!token) {
      return rejectWithValue("Unauthorized: Please log in");
    }

    const response = await axios.get(API_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch movies");
  }
});

// 🔹 Add New Movie
export const addMovie = createAsyncThunk("movies/addMovie", async (newMovie, { getState, rejectWithValue }) => {
  try {
    const token = getState().auth.user?.token;
    if (!token) {
      return rejectWithValue("Unauthorized: Please log in");
    }

    const response = await axios.post(API_URL, newMovie, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return response.data.movie;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to add movie");
  }
});

// 🔹 Edit Movie
export const editMovie = createAsyncThunk("movies/editMovie", async (updatedMovie, { getState, rejectWithValue }) => {
  try {
    const token = getState().auth.user?.token;
    if (!token) {
      return rejectWithValue("Unauthorized: Please log in");
    }

    const response = await axios.put(`${API_URL}/${updatedMovie._id}`, updatedMovie, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to update movie");
  }
});

// 🔹 Delete Movie
export const deleteMovie = createAsyncThunk("movies/deleteMovie", async (movieId, { getState, rejectWithValue }) => {
  try {
    const token = getState().auth.user?.token;
    if (!token) {
      return rejectWithValue("Unauthorized: Please log in");
    }

    await axios.delete(`${API_URL}/${movieId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return movieId;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to delete movie");
  }
});

const movieSlice = createSlice({
  name: "movies",
  initialState: {
    list: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMovies.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchMovies.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload;
      })
      .addCase(fetchMovies.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(addMovie.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })
      .addCase(editMovie.fulfilled, (state, action) => {
        const index = state.list.findIndex((movie) => movie._id === action.payload._id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })
      .addCase(deleteMovie.fulfilled, (state, action) => {
        state.list = state.list.filter((movie) => movie._id !== action.payload);
      });
  },
});

export default movieSlice.reducer;


