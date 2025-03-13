// src/pages/NodeDetail.tsx
import React, { useEffect, useState, useCallback } from "react";
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
import {
  uploadFileToCOS,
  convertBase64ToBlob,
  getSignedUrl,
  urlToBase64,
} from "@/utils/cos";

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
  // 原始的files数据
  const [originFiles, setOriginFiles] = useState<any>(null);

  useEffect(() => {
    async function fetchDetail() {
      const result = await window.electronAPI.getNodeDetail(nodeId);
      if (result.success && result.detail) {
        const detail = result.detail.detail;
        if (detail.files) {
          setOriginFiles(JSON.parse(JSON.stringify(detail.files)));
        } else {
          setOriginFiles({});
        }
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

        // 确保 `files` 里面的每个对象都包含 `url`
        if (detail.files) {
          const fileIds = Object.keys(detail.files);

          // 并行处理所有图片
          const filePromises = fileIds.map(async (fileId) => {
            if (detail.files[fileId].dataURL) {
              const signedUrl = await getSignedUrl(
                detail.files[fileId].id,
                detail.files[fileId].mimeType
              );
              detail.files[fileId].dataURL = await urlToBase64(signedUrl);
            }
          });

          await Promise.all(filePromises); // 等待所有图片转换完成
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
  const handleSave = useCallback(async () => {
    if (!excalidrawAPI) {
      console.error("Excalidraw API is not ready yet.");
      return;
    }

    const sceneElements = await excalidrawAPI.getSceneElements();
    const appState = excalidrawAPI.getAppState();
    const files = excalidrawAPI.getFiles(); // 这里获取所有的图片

    // 1. 处理 Base64 图片上传（只上传未上传过的）
    const uploadedFiles = {} as any;
    for (const [fileId, fileData] of Object.entries(files)) {
      if (fileData && (fileData as any).dataURL) {
        // ✅ 如果 `id` 在 `originFiles` 里已存在，则跳过上传
        if (originFiles && originFiles[fileId]) {
          uploadedFiles[fileId] = originFiles[fileId].dataURL;
          continue;
        }

        // ✅ `id` 不存在，则进行上传
        try {
          const blob = await convertBase64ToBlob((fileData as any).dataURL);
          // 从 `fileData.mimeType` 获取扩展名
          const mimeType = (fileData as any).mimeType || "image/webp"; // 默认 webp 避免错误
          const ext = mimeType.split("/")[1]; // 获取后缀，如 `png`、`jpeg`
          const fileUrl = await uploadFileToCOS(blob, `${fileId}.${ext}`); // 上传到腾讯云
          uploadedFiles[fileId] = fileUrl;
        } catch (error) {
          console.error("图片上传失败:", error);
        }
      }
    }

    // 2. 替换 `dataURL` 为 URL
    const updatedFiles = {} as any;
    for (const [fileId, fileData] of Object.entries(files)) {
      if (uploadedFiles[fileId]) {
        updatedFiles[fileId] = {
          ...(fileData as any),
          dataURL: uploadedFiles[fileId],
        };
      } else {
        updatedFiles[fileId] = fileData;
      }
    }

    setOriginFiles(updatedFiles);

    // 3. 生成最终保存的数据
    const saveData = {
      elements: sceneElements,
      appState,
      files: updatedFiles, // 只存 URL
    };

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
  }, [excalidrawAPI, globalMessage, nodeId, originFiles]);

  // 监听 Ctrl + S / Cmd + S 事件
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault(); // 阻止默认行为（浏览器另存为）
        event.stopPropagation(); // 阻止事件冒泡
        handleSave();
      }
    };

    // 绑定事件
    window.addEventListener("keydown", handleKeyDown, true); // 第三个参数 `true`捕获阶段执行
    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [handleSave]);

  if (loading) {
    return (
      <div className={`w-full h-full flex justify-center items-center`}>
        <Spin />
      </div>
    );
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
