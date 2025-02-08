// src/app/store.ts
import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "redux";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // 默认使用 localStorage
import workbenchReducer from "./features/workbenchSlice";

const rootReducer = combineReducers({
  // 添加reducer
  workbench: workbenchReducer,
});

const persistConfig = {
  key: "root",
  storage,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  // 自定义中间件
  reducer: persistedReducer,
});

export const persistor = persistStore(store);

// 定义 RootState 和 AppDispatch 类型，方便后续使用
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
