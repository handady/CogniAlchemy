// Toolbar.tsx
import React, { useState } from "react";
import styles from "./index.module.scss";
import { Tooltip } from "antd";
import {
  PlusCircleOutlined,
  ReloadOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import { v4 as uuidv4 } from "uuid";
import { useGlobalMessage } from "@/components/GlobalMessageProvider";
import NewNodeDialog, { NewNode } from "../NewNodeDialog";
import TagManagementDialog from "../TagManagementDialog";

interface ToolbarProps {
  onReset?: () => void;
  onRefresh: () => void; // 刷新数据回调
}

const Toolbar: React.FC<ToolbarProps> = ({ onReset, onRefresh }) => {
  const [dialogVisible, setDialogVisible] = useState(false);
  const globalMessage = useGlobalMessage();
  const [showTagManagement, setShowTagManagement] = useState(false);

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
        const nodeDetailResult = await window.electronAPI.createNodeDetail({
          id: uuidv4(),
          node_id: newNode.id,
          detail: "",
          created_by: "韩思远",
          updated_by: "韩思远",
        });
        if (nodeDetailResult.success) {
          globalMessage.success("新增节点成功");
          onRefresh && onRefresh();
        } else {
          globalMessage.error("新增节点失败");
          console.error("Failed to add node detail:", nodeDetailResult.message);
        }
      } else {
        globalMessage.error(result.message);
        console.error("Failed to add node:", result.message);
      }
    } catch (error: any) {
      globalMessage.error("新增节点失败");
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
        {/* 标签管理 */}
        <Tooltip
          title="标签管理"
          placement="left"
          color="var(--primary-color)"
          getPopupContainer={(trigger) => trigger.parentElement as HTMLElement}
        >
          <button
            className={`${styles.iconBtn} border-0 cursor-pointer text-xl transition-all duration-300 py-0.5 px-1.5`}
            onClick={() => setShowTagManagement(true)}
          >
            <AppstoreOutlined />
          </button>
        </Tooltip>
      </div>

      {/* 渲染新增节点 Dialog */}
      <NewNodeDialog
        visible={dialogVisible}
        onCancel={handleCloseDialog}
        onConfirm={handleConfirmDialog}
      />
      {/* 标签管理对话框 */}
      <TagManagementDialog
        visible={showTagManagement}
        onClose={() => {
          setShowTagManagement(false);
        }}
        refreshTags={onRefresh}
      />
    </>
  );
};

export default Toolbar;
