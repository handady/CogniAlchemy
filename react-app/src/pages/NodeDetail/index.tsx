// src/pages/NodeDetail.tsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { Spin } from "antd";
import { Excalidraw } from "@excalidraw/excalidraw";
import styles from "./index.module.scss";
import { useGlobalMessage } from "@/components/GlobalMessageProvider";
// 素材库
import bubblesJson from "@/assets/LibraryItems/bubbles.json";
import basicShapesJson from "@/assets/LibraryItems/basic-shapes.json";
import postItJson from "@/assets/LibraryItems/post-it.json";
import someHanddrawnSignsJson from "@/assets/LibraryItems/some-handdrawn-signs.json";
import customJson from "@/assets/LibraryItems/custom.json";
const libraryItems = [
  ...customJson,
  someHanddrawnSignsJson[0].elements,
  someHanddrawnSignsJson[1].elements,
  ...postItJson,
  ...bubblesJson,
  ...basicShapesJson,
] as any;

const NodeDetail: React.FC = () => {
  const { nodeId } = useParams<{ nodeId: string }>() as any;
  const [loading, setLoading] = useState(true);
  // 用来保存 Excalidraw 初始场景数据（如果有的话）
  const [initialData, setInitialData] = useState<any>({
    libraryItems: libraryItems,
    appState: {},
    elements: [],
  });
  const globalMessage = useGlobalMessage();
  const navigate = useNavigate();

  // 创建 ref 获取 Excalidraw 实例
  const excalidrawRef = useRef<any>(null);

  useEffect(() => {
    async function fetchDetail() {
      const result = await window.electronAPI.getNodeDetail(nodeId as any);
      if (result.success) {
        // 假设 result.data 包含 Excalidraw 的 scene 数据，比如：
        // { elements: [...], appState: {...} }
        setInitialData({
          ...initialData,
          ...result.data,
        });
      }
      setLoading(false);
    }
    fetchDetail();
  }, [nodeId]);

  // 示例保存函数，结合 Excalidraw API 获取当前场景数据后保存
  const handleSave = async () => {
    if (excalidrawRef.current) {
      const sceneElements = await excalidrawRef.current.getSceneElements();
      const appState = excalidrawRef.current.getAppState();
      const saveData = { elements: sceneElements, appState };
      try {
        const result = await window.electronAPI.updateNodeDetail(
          nodeId,
          saveData
        );
        if (result.success) {
          globalMessage.success("保存成功");
        } else {
          globalMessage.error(result.message || "保存失败");
        }
      } catch (error) {
        globalMessage.error("保存失败");
        console.error("保存错误：", error);
      }
    }
  };

  if (loading) {
    return <Spin />;
  }

  return (
    <div style={{ width: "100%", height: "100%" }} className="node-detail">
      <Excalidraw initialData={initialData} langCode="zh-CN" />
      <button className={styles["close-btn"]} onClick={() => navigate(-1)}>
        返回
      </button>
      <button className={styles["export-btn"]} onClick={handleSave}>
        保存
      </button>
    </div>
  );
};

export default NodeDetail;
