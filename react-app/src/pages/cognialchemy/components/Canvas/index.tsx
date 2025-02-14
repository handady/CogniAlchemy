// src/components/Canvas.tsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import Toolbar from "../Toolbar";
import {
  useD3ForceSimulation,
  NodeDatum,
  LinkDatum,
} from "./hooks/useD3ForceSimulation";
import NodePannel from "../NodePannel"; // 根据实际路径引入

interface GraphData {
  nodes: NodeDatum[];
  links: LinkDatum[];
}

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  node: NodeDatum | null;
}

const Canvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    node: null,
  });

  // 加载数据
  const fetchGraphData = useCallback(async () => {
    const res = await window.electronAPI.getGraphData();
    if (res.success) {
      const { nodes: dbNodes, edges: dbEdges } = res.data;
      setGraphData({
        nodes: dbNodes,
        links: dbEdges,
      });
    } else {
      console.error("Failed to get graph data:", res.message);
    }
  }, []);

  useEffect(() => {
    fetchGraphData();
  }, [fetchGraphData]);

  // 定义右键菜单的回调
  const handleNodeContextMenu = (event: MouseEvent, node: NodeDatum) => {
    event.preventDefault();
    // 获取鼠标点击位置
    const x = event.offsetX + 24;
    const y = event.offsetY - 16;
    setContextMenu({
      visible: true,
      x,
      y,
      node,
    });
  };

  // 当点击其他地方时隐藏右键菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenu.visible) {
        setContextMenu((prev) => ({ ...prev, visible: false }));
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [contextMenu.visible]);

  // 初始化 D3 力导向图，同时传入 handleNodeContextMenu 回调
  const { resetCanvas } = useD3ForceSimulation({
    containerRef: containerRef as React.RefObject<HTMLElement>,
    data: graphData,
    onNodeContextMenu: handleNodeContextMenu,
  });

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%", position: "relative" }}
    >
      <Toolbar onReset={resetCanvas} onRefresh={fetchGraphData} />

      {/* 使用独立的 NodePannel 组件 */}
      {contextMenu.visible && (
        <NodePannel
          x={contextMenu.x}
          y={contextMenu.y}
          node={contextMenu.node}
          onRefresh={fetchGraphData}
          onClose={() =>
            setContextMenu((prev) => ({ ...prev, visible: false }))
          }
        />
      )}
    </div>
  );
};

export default Canvas;
