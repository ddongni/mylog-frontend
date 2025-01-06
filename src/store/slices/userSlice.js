import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const updateNickname = createAsyncThunk(
    'user/updateNickname',
    async (requestData) => {
      try {
        const { data } = await axios.put(`${process.env.REACT_APP_SERVER_URL}/v1/users/nickname`, requestData, {
          withCredentials: true
        });
        return data;
      } catch (error) {
        throw error;
      }
    }
);

const userSlice = createSlice({
  name: 'user',
  initialState: {
    email: null,
    nickname: null,
  },
  reducers: {
    setEmail: (state, action) => {
      state.email = action.payload;
    },
    setNickname: (state, action) => {
      state.nickname = action.payload;
    },
  }
});

export const { setEmail, setNickname } = userSlice.actions;

export default userSlice.reducer;