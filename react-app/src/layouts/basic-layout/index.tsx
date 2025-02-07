// src/layouts/BasicLayout.tsx
import React from "react";
import Sidebar from "@/components/sidebar";
import { Outlet } from "react-router-dom";

const BasicLayout: React.FC = () => {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* 左侧侧边栏 */}
      <Sidebar />

      {/* 右侧内容区域 */}
      <main className="flex-1 p-6 overflow-auto bg-gray-50">
        <Outlet />
      </main>
    </div>
  );
};

export default BasicLayout;
