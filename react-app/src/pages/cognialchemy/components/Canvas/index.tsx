// Canvas.tsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import Toolbar from "../Toolbar";
import {
  useD3ForceSimulation,
  NodeDatum,
  LinkDatum,
} from "./hooks/useD3ForceSimulation";

interface GraphData {
  nodes: NodeDatum[];
  links: LinkDatum[];
}

const Canvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [graphData, setGraphData] = useState<GraphData | null>(null);

  // 封装一个刷新数据的方法
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

  // 初始加载数据
  useEffect(() => {
    fetchGraphData();
  }, [fetchGraphData]);

  // 将 fetchGraphData 传递给 Toolbar，当新增节点后刷新数据
  const { resetCanvas } = useD3ForceSimulation({
    containerRef: containerRef as React.RefObject<HTMLElement>,
    data: graphData,
  });

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%", position: "relative" }}
    >
      <Toolbar onReset={resetCanvas} onRefresh={fetchGraphData} />
    </div>
  );
};

export default Canvas;
