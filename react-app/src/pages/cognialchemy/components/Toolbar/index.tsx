// Toolbar.tsx
import React from "react";
import styles from "./index.module.scss";
import { v4 as uuidv4 } from "uuid";
import { Tooltip } from "antd";
import { PlusCircleOutlined, ReloadOutlined } from "@ant-design/icons";

interface ToolbarProps {
  onReset?: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ onReset }) => {
  // 新增节点方法
  const onAdd = async () => {
    // 构造新节点数据（根据你的数据结构）
    const newNode = {
      id: uuidv4(), // 生成唯一 ID
      tag: "New Node",
      content: "This is a new node.", // 节点内容，可为 Markdown 文本
      color: "#f5347f",
      usage: 1,
      pos_x: 0, // 初始坐标，可根据需要调整
      pos_y: 0,
      state: {}, // 可以存储额外状态信息（以 JSON 对象保存）
    };

    try {
      // 通过 IPC 调用主进程接口新增节点
      // 这里假设你在 preload.js 中暴露了 electronAPI.createGraphNode
      const result = await window.electronAPI.createGraphNode(newNode);
      if (result.success) {
        console.log("Node added successfully");
        // 此处可以通知画布刷新或更新 UI
      } else {
        console.error("Failed to add node:", result.message);
      }
    } catch (error: any) {
      console.error("Error adding node:", error);
    }
  };

  return (
    <div
      className={`${styles.Toolbar} absolute top-3 right-3 flex flex-col gap-1 p-1`}
    >
      <Tooltip
        title="新增节点"
        placement="left"
        color="var(--primary-color)"
        getPopupContainer={(trigger) => trigger.parentElement as HTMLElement}
      >
        <button
          onClick={onAdd}
          className={`${styles.iconBtn} border-0 cursor-pointer text-xl transition-all duration-300 py-0.5 px-1.5`}
        >
          <PlusCircleOutlined />
        </button>
      </Tooltip>
      <Tooltip
        title="重置画布"
        placement="left"
        color="var(--primary-color)"
        getPopupContainer={(trigger) => trigger.parentElement as HTMLElement}
      >
        <button
          onClick={onReset}
          className={`${styles.iconBtn} border-0 cursor-pointer text-xl transition-all duration-300 py-0.5 px-1.5`}
        >
          <ReloadOutlined />
        </button>
      </Tooltip>
    </div>
  );
};

export default Toolbar;
