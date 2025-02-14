// src/layouts/BasicLayout.tsx
import React from "react";
import Sidebar from "@/components/sidebar";
import styles from "./index.module.scss";
import { Outlet } from "react-router-dom";

const BasicLayout: React.FC = () => {
  return (
    <div className="flex h-full overflow-hidden">
      {/* 左侧侧边栏 */}
      <Sidebar />

      {/* 右侧内容区域 */}
      <main className={`flex-1 overflow-hidden ${styles.mainContent}`}>
        <Outlet />
      </main>
    </div>
  );
};

export default BasicLayout;
