import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // 로컬 스토리지 사용
import userReducer from './slices/userSlice'; // 기존 userReducer 가져오기

// redux-persist 설정
const persistConfig = {
  key: 'root', // 저장 키 (스토리지에 저장될 키)
  storage,     // 로컬 스토리지 사용
};

const persistedReducer = persistReducer(persistConfig, userReducer);

const store = configureStore({
  reducer: {
    user: persistedReducer, // persistReducer로 감싼 reducer 사용
  },
});

export const persistor = persistStore(store); // Redux 상태를 persist

export default store;