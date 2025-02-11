// src/components/Canvas.tsx
import React, { useEffect, useRef } from "react";
import Toolbar from "../Toolbar";
import { useD3ForceSimulation } from "./hooks/useD3ForceSimulation";

const Canvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  useD3ForceSimulation({
    containerRef: containerRef as React.RefObject<HTMLElement>,
  });

  // 新增节点处理函数（具体逻辑自行补充）
  const handleAddNode = () => {
    console.log("新增节点");
  };

  // 重置画布处理函数（具体逻辑自行补充）
  const handleResetCanvas = () => {
    console.log("重置画布");
  };

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%", position: "relative" }}
    >
      <Toolbar onAdd={handleAddNode} onReset={handleResetCanvas} />
    </div>
  );
};

export default Canvas;
