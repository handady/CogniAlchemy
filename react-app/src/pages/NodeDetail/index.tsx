// src/pages/NodeDetail.tsx
import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import {
  ReactFlow,
  MiniMap,
  Background,
  useNodesState,
  useEdgesState,
  useReactFlow,
  useViewport,
  addEdge,
  BackgroundVariant,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import "./index.css";
import { Spin } from "antd";
import { useGlobalMessage } from "@/components/GlobalMessageProvider";
import CustomControls from "./components/CustomControls";
import CustomResizerNode from "./components/CustomResizerNode";

interface NodeDetailData {
  // 定义你的节点详情数据结构，包括节点、边等
  nodes: any[];
  edges: any[];
}

const nodeTypes = {
  CustomResizerNode,
};

const ReactFlowInstance: React.FC = () => {
  const { nodeId } = useParams<{ nodeId: string }>() as any;
  const proOptions = { hideAttribution: true };
  const globalMessage = useGlobalMessage();
  const reactFlowInstance = useReactFlow();

  // 网格捕捉和只读
  const [snapEnabled, setSnapEnabled] = useState(false);
  const [readOnly, setReadOnly] = useState(false);

  // 初始化数据
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  // 双击画布空白处添加节点
  const handlePaneDoubleClick = (event: React.MouseEvent) => {
    if (!reactFlowInstance) return;
    // 将屏幕坐标转换为 ReactFlow 坐标
    const position = reactFlowInstance.screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });

    // 创建新节点
    const newNode = {
      id: uuidv4(),
      position,
      type: "CustomResizerNode",
      data: { label: "New Node" },
      origin: [0.5, 0.5],
      style: { width: 100, height: 40 },
    };

    setNodes((nds) => nds.concat(newNode as any));
  };

  // 保存函数
  const handleSave = useCallback(() => {
    if (!reactFlowInstance) return;

    // 获取当前节点、连线及视图变换信息
    const currentNodes = reactFlowInstance.getNodes();
    const currentEdges = reactFlowInstance.getEdges();
    const transform = reactFlowInstance.getViewport(); // [x, y, zoom]

    console.log(currentNodes, currentEdges, transform);

    // 构造保存数据对象
    const saveData = {
      nodes: currentNodes,
      edges: currentEdges,
      transform, // 视口信息
      readOnly, // 是否只读
      snapEnabled, // 是否启用网格捕捉
    };

    // 调用 Electron API 保存到数据库
    window.electronAPI
      .updateNodeDetail(nodeId, saveData)
      .then((result: any) => {
        if (result.success) {
          globalMessage.success("保存成功");
        } else {
          globalMessage.error(result.message || "保存失败");
        }
      })
      .catch((error: any) => {
        globalMessage.error("保存失败");
        console.error("保存错误：", error);
      });
  }, [reactFlowInstance, readOnly, snapEnabled]);

  // 监听ctrl+s保存
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleSave]);

  return (
    <div
      style={{ width: "100%", height: "100%" }}
      onDoubleClick={handlePaneDoubleClick}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        proOptions={proOptions}
        snapToGrid={snapEnabled}
        zoomOnDoubleClick={false}
        snapGrid={[15, 15]}
        elementsSelectable={!readOnly}
        nodesDraggable={!readOnly}
        nodeTypes={nodeTypes}
        minZoom={0.2}
        maxZoom={4}
      >
        <CustomControls
          snapEnabled={snapEnabled}
          readOnly={readOnly}
          toggleSnap={() => setSnapEnabled((prev) => !prev)}
          toggleReadOnly={() => setReadOnly((prev) => !prev)}
          onSave={handleSave}
        />
        <MiniMap />
        <Background variant={BackgroundVariant.Lines} gap={15} size={1} />
      </ReactFlow>
    </div>
  );
};

const NodeDetail: React.FC = () => {
  const { nodeId } = useParams<{ nodeId: string }>();
  const [data, setData] = useState<NodeDetailData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDetail() {
      const result = await window.electronAPI.getNodeDetail(nodeId as any);
      if (result.success) {
        console.log(result);
        setData(result.data);
      }
      setLoading(false);
    }
    fetchDetail();
  }, [nodeId]);

  if (loading) {
    return <Spin />;
  }

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <ReactFlowProvider>
        <ReactFlowInstance />
      </ReactFlowProvider>
    </div>
  );
};

export default NodeDetail;
