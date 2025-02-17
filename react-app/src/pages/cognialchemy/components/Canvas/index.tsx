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
  const [tagData, setTagData] = useState<any[]>([]);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    node: null,
  });

  // 新增“连接模式”状态和临时连线坐标
  const connectionSourceRef = useRef<NodeDatum | null>(null);
  const [connectionSourceEvent, setConnectionSourceEvent] =
    useState<MouseEvent | null>(null);
  const [tempLine, setTempLine] = useState<{
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  } | null>(null);

  // 加载数据
  const fetchGraphData = useCallback(async () => {
    const tagRes = await window.electronAPI.getTags();
    if (tagRes.success) {
      setTagData(tagRes.tags);
    }
    const res = await window.electronAPI.getGraphData();
    console.log("获取图数据：", res.data);
    if (res.success) {
      const { nodes: dbNodes, edges: dbEdges } = res.data;
      setGraphData({
        nodes: dbNodes,
        links: dbEdges.map((edge: any) => ({
          source: edge.source_node_id,
          target: edge.target_node_id,
          value: edge.weight,
        })),
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
    setConnectionSourceEvent(event);
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

  // 关闭右键菜单
  const handleCloseContextMenu = () => {
    setContextMenu((prev) => ({ ...prev, visible: false }));
  };

  // 当点击其他地方时隐藏右键菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenu.visible) {
        handleCloseContextMenu();
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [contextMenu.visible]);

  // 进入连接模式时，记录起始节点
  const handleConnect = (node: NodeDatum) => {
    connectionSourceRef.current = node;
  };
  // 当处于连接模式时，点击节点完成连接
  const handleNodeClick = (event: MouseEvent, node: NodeDatum) => {
    if (connectionSourceRef.current) {
      if (node.id === connectionSourceRef.current.id) {
        console.log("不能连接同一个节点。");
        return;
      }
      // 调用接口连接两个节点
      window.electronAPI
        .connectNodes(connectionSourceRef.current.id, node.id)
        .then((result: any) => {
          if (result.success) {
            console.log("连接成功。");
            fetchGraphData();
          } else {
            console.error("连接失败：", result.message);
          }
        })
        .catch((error: any) => {
          console.error("连接错误：", error);
        });
      // 清除连接模式和临时连线
      connectionSourceRef.current = null;
      setTempLine(null);
      setConnectionSourceEvent(null);
    } else {
      console.log("非连接模式：", node.id);
    }
  };

  // 当处于连接模式时，根据鼠标移动更新临时连线终点
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (event: MouseEvent) => {
      if (connectionSourceRef.current) {
        const rect = container.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        // 假设 connectionSource 的 x、y 与容器坐标一致（如有缩放或平移需转换坐标）
        setTempLine({
          x1: connectionSourceEvent?.offsetX || 0,
          y1: connectionSourceEvent?.offsetY || 0,
          x2: mouseX,
          y2: mouseY,
        });
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        connectionSourceRef.current = null;
        setTempLine(null);
        setConnectionSourceEvent(null);
      }
    };

    container.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [connectionSourceRef.current]);

  // 初始化 D3 力导向图，同时传入 handleNodeContextMenu 回调
  const { resetCanvas } = useD3ForceSimulation({
    containerRef: containerRef as React.RefObject<HTMLElement>,
    data: graphData,
    tagData: tagData,
    onNodeContextMenu: handleNodeContextMenu,
    onNodeClick: handleNodeClick,
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
          onConnect={handleConnect}
          onClose={handleCloseContextMenu}
        />
      )}

      {/* 绘制临时连线（连接模式激活时） */}
      {connectionSourceRef.current && tempLine && (
        <svg
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            zIndex: 500,
          }}
        >
          <line
            x1={tempLine.x1}
            y1={tempLine.y1}
            x2={tempLine.x2}
            y2={tempLine.y2}
            stroke="var(--temp-line-color)"
            strokeWidth={2}
          />
        </svg>
      )}
    </div>
  );
};

export default Canvas;
