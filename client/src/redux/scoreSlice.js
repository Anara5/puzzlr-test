import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "http://localhost:5001/api/auth";

// Helper function to set up axios with auth header
const setupAxios = (token) => {
  if (!token) return null;
  return axios.create({
    baseURL: API_URL,
    headers: { Authorization: `Bearer ${token}` },
  })
}

// Async thunks
export const fetchUserScore = createAsyncThunk("score/fetchUserScore", async (_, { getState, rejectWithValue }) => {
  try {
    const { token } = getState().score;
    if (!token) return null;

    const api = setupAxios(token);
    const res = await api.get("/score");
    return res.data.score;
  } catch (error) {
    console.error("Error fetching score:", error);
    return rejectWithValue(error.response?.data?.msg || "Failed to fetch score");
  }
});

export const fetchLeaderboard = createAsyncThunk("score/fetchLeaderboard", async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get(`${API_URL}/leaderboard?limit=10`);
    return res.data.leaderboard || [];
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return rejectWithValue(error.response?.data?.msg || "Failed to fetch leaderboard");
  }
});

export const fetchRanking = createAsyncThunk("score/fetchRanking", async (_, { getState, rejectWithValue }) => {
  try {
    const { token } = getState().score;
    if (!token) return null;

    const api = setupAxios(token);
    const res = await api.get("/ranking");
    return res.data;
  } catch (error) {
    console.error("Error fetching ranking:", error);
    return rejectWithValue(error.response?.data?.msg || "Failed to fetch ranking");
  }
});

export const updateScore = createAsyncThunk(
  "score/updateScore",
  async (change, { getState, dispatch, rejectWithValue }) => {
    try {
      const { token } = getState().score;
      if (!token) return null;

      const api = setupAxios(token);
      const res = await api.post("/score", { change });

      // After updating score, refresh leaderboard and ranking
      dispatch(fetchLeaderboard());
      dispatch(fetchRanking());

      return res.data.newScore;
    } catch (error) {
      console.error("Error updating score:", error);
      return rejectWithValue(error.response?.data?.msg || "Failed to update score");
    }
  },
);

const scoreSlice = createSlice({
  name: "score",
  initialState: {
    user: null,
    token: localStorage.getItem("token") || "",
    score: 0,
    leaderboard: [],
    ranking: null,
    loading: {
      score: false,
      leaderboard: false,
      ranking: false,
      updateScore: false,
    },
    error: null,
    socket: null,
    lastUpdated: null,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setToken: (state, action) => {
      state.token = action.payload;
      if (action.payload) {
        localStorage.setItem("token", action.payload);
      } else {
        localStorage.removeItem("token");
      }
    },
    setSocket: (state, action) => {
      state.socket = action.payload;
    },
    updateLeaderboard: (state, action) => {
      state.leaderboard = action.payload;
      state.lastUpdated = Date.now();
    },
    clearState: (state) => {
      state.user = null;
      state.token = "";
      state.score = 0;
      state.leaderboard = [];
      state.ranking = null;
      state.error = null;
      state.lastUpdated = null;
      localStorage.removeItem("token");
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch user score
      .addCase(fetchUserScore.pending, (state) => {
        state.loading.score = true;
        state.error = null;
      })
      .addCase(fetchUserScore.fulfilled, (state, action) => {
        state.loading.score = false;
        if (action.payload !== null) {
          state.score = action.payload;
          state.lastUpdated = Date.now();
        }
      })
      .addCase(fetchUserScore.rejected, (state, action) => {
        state.loading.score = false;
        state.error = action.payload;
      })

      // Fetch leaderboard
      .addCase(fetchLeaderboard.pending, (state) => {
        state.loading.leaderboard = true;
      })
      .addCase(fetchLeaderboard.fulfilled, (state, action) => {
        state.loading.leaderboard = false;
        state.leaderboard = action.payload;
        state.lastUpdated = Date.now();
      })
      .addCase(fetchLeaderboard.rejected, (state, action) => {
        state.loading.leaderboard = false;
        state.error = action.payload;
      })

      // Fetch ranking
      .addCase(fetchRanking.pending, (state) => {
        state.loading.ranking = true;
      })
      .addCase(fetchRanking.fulfilled, (state, action) => {
        state.loading.ranking = false;
        state.ranking = action.payload;
        state.lastUpdated = Date.now();
      })
      .addCase(fetchRanking.rejected, (state, action) => {
        state.loading.ranking = false;
        state.error = action.payload;
      })

      // Update score
      .addCase(updateScore.pending, (state) => {
        state.loading.updateScore = true;
        state.error = null;
      })
      .addCase(updateScore.fulfilled, (state, action) => {
        state.loading.updateScore = false;
        if (action.payload !== null) {
          state.score = action.payload;
          state.lastUpdated = Date.now();
        }
      })
      .addCase(updateScore.rejected, (state, action) => {
        state.loading.updateScore = false;
        state.error = action.payload;
      })
  },
});

export const { setUser, setToken, setSocket, updateLeaderboard, clearState } = scoreSlice.actions;

export default scoreSlice.reducer;