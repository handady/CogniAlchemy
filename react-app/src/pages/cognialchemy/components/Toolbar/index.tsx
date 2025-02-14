// Toolbar.tsx
import React, { useState } from "react";
import styles from "./index.module.scss";
import { Tooltip } from "antd";
import { PlusCircleOutlined, ReloadOutlined } from "@ant-design/icons";
import NewNodeDialog, { NewNode } from "../NewNodeDialog"; // 根据实际路径引入

interface ToolbarProps {
  onReset?: () => void;
  onRefresh?: () => void; // 刷新数据回调
}

const Toolbar: React.FC<ToolbarProps> = ({ onReset, onRefresh }) => {
  const [dialogVisible, setDialogVisible] = useState(false);

  // 打开新增节点 Dialog
  const handleOpenDialog = () => {
    setDialogVisible(true);
  };

  // 关闭 Dialog
  const handleCloseDialog = () => {
    setDialogVisible(false);
  };

  // 点击确认后调用新增节点接口
  const handleConfirmDialog = async (newNode: NewNode) => {
    try {
      const result = await window.electronAPI.createGraphNode(newNode);
      if (result.success) {
        console.log("Node added successfully");
        onRefresh && onRefresh();
      } else {
        console.error("Failed to add node:", result.message);
      }
    } catch (error: any) {
      console.error("Error adding node:", error);
    }
    setDialogVisible(false);
  };

  return (
    <>
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
            onClick={handleOpenDialog}
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

      {/* 渲染新增节点 Dialog */}
      <NewNodeDialog
        visible={dialogVisible}
        onCancel={handleCloseDialog}
        onConfirm={handleConfirmDialog}
      />
    </>
  );
};

export default Toolbar;
