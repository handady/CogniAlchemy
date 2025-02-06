// src/layouts/BasicLayout.tsx
import React from "react";
import SideBar from "@/components/sidebar";

interface BasicLayoutProps {
  children: React.ReactNode;
}

const BasicLayout: React.FC<BasicLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen">
      {/* 左侧侧边栏 */}
      <SideBar />
      {/* 右侧内容区域 */}
      <main className="flex-1 p-6 bg-gray-50">{children}</main>
    </div>
  );
};

export default BasicLayout;
