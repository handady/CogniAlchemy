// src/pages/NodeDetail.tsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  });
  const globalMessage = useGlobalMessage();
  const navigate = useNavigate();

  // 用来保存 Excalidraw 的 API 对象
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);

  useEffect(() => {
    async function fetchDetail() {
      const result = await window.electronAPI.getNodeDetail(nodeId as any);
      if (result.success && result.detail) {
        const detail = result.detail.detail;
        if (detail.appState && detail.appState.collaborators) {
          // 如果 collaborators 是一个对象而不是数组，则转换为数组
          if (
            typeof detail.appState.collaborators === "object" &&
            !Array.isArray(detail.appState.collaborators)
          ) {
            detail.appState.collaborators = Object.entries(
              detail.appState.collaborators
            );
          }
        }
        setInitialData((prevData: any) => ({
          ...prevData,
          ...detail,
        }));
      }
      setLoading(false);
    }
    fetchDetail();
  }, [nodeId]);

  // 示例保存函数，结合 Excalidraw API 获取当前场景数据后保存
  const handleSave = async () => {
    if (excalidrawAPI) {
      const sceneElements = await excalidrawAPI.getSceneElements();
      const appState = excalidrawAPI.getAppState();
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
    } else {
      console.error("Excalidraw API is not ready yet.");
    }
  };

  if (loading) {
    return <Spin />;
  }

  return (
    <div style={{ width: "100%", height: "100%" }} className="node-detail">
      <Excalidraw
        initialData={initialData}
        langCode="zh-CN"
        excalidrawAPI={(api) => setExcalidrawAPI(api)}
      />
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
