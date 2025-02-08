import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface WorkbenchState {
  collapsed: boolean;
}

const initialState: WorkbenchState = {
  collapsed: window.innerWidth < 1360, // 根据窗口宽度初始化状态
};

const workbenchSlice = createSlice({
  name: "workbench",
  initialState,
  reducers: {
    setCollapsed(state, action: PayloadAction<boolean>) {
      state.collapsed = action.payload;
    },
  },
});

export const { setCollapsed } = workbenchSlice.actions;
export default workbenchSlice.reducer;
