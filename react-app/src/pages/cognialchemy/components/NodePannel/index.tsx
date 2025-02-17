// src/components/NodePannel.tsx
import React, { useState } from "react";
import { NodeDatum } from "../Canvas/hooks/useD3ForceSimulation";
import styles from "./index.module.scss";
import { useGlobalMessage } from "@/components/GlobalMessageProvider";
import NewNodeDialog, { NewNode } from "../NewNodeDialog";

export interface NodePannelProps {
  x: number;
  y: number;
  node: NodeDatum | null;
  onRefresh: () => void;
  onClose: () => void;
  onConnect: (node: NodeDatum) => void;
}

const NodePannel: React.FC<NodePannelProps> = ({
  x,
  y,
  node,
  onRefresh,
  onClose,
  onConnect,
}) => {
  const globalMessage = useGlobalMessage();
  const [dialogVisible, setDialogVisible] = useState(false);

  // 关闭 Dialog
  const handleCloseDialog = () => {
    setDialogVisible(false);
  };

  // 根据nodeId修改节点的属性
  const handleConfirmDialog = async (newNode: NewNode) => {
    try {
      const result = await window.electronAPI.updateNode(newNode);
      if (result.success) {
        globalMessage.success("修改节点成功");
        onRefresh && onRefresh();
      } else {
        globalMessage.error(result.message);
        console.error("Failed to update node:", result.message);
      }
    } catch (error: any) {
      globalMessage.error("修改节点失败");
      console.error("Error updating node:", error);
    }
    setDialogVisible(false);
  };

  // 删除节点
  const onDeleteNode = async () => {
    if (node && node.id) {
      const result = await window.electronAPI.deleteNode(node.id);
      if (result.success) {
        globalMessage.success("删除节点成功");
        onRefresh();
        onClose();
      } else {
        globalMessage.error(result.message);
      }
    }
  };

  // 断开节点连线
  const onDisconnectNode = async () => {
    if (node && node.id) {
      const result = await window.electronAPI.disconnectNode(node.id);
      if (result.success) {
        globalMessage.success("断开节点连线成功");
        onRefresh();
        onClose();
      } else {
        globalMessage.error(result.message);
      }
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        top: y,
        left: x,
        zIndex: 1000,
      }}
      // 阻止点击面板时事件冒泡，防止立即被全局点击事件隐藏
      onClick={(e) => e.stopPropagation()}
      className={`${styles.nodePannel} p-2 gap-1`}
    >
      <button
        className={`${styles.btn} ${styles.edit}`}
        onClick={() => {
          setDialogVisible(true);
        }}
      >
        修改
      </button>
      <button
        className={`${styles.btn} ${styles.connect}`}
        onClick={() => {
          if (node) {
            onConnect(node);
          }
          onClose();
        }}
      >
        连接
      </button>
      <button
        className={`${styles.btn} ${styles.disconnect}`}
        onClick={() => {
          onDisconnectNode();
        }}
      >
        断开
      </button>
      <button
        className={`${styles.btn} ${styles.delete}`}
        onClick={() => {
          onDeleteNode();
        }}
      >
        删除
      </button>
      {/* 渲染新增节点 Dialog */}
      <NewNodeDialog
        visible={dialogVisible}
        onCancel={handleCloseDialog}
        onConfirm={handleConfirmDialog}
        node={node as any}
      />
    </div>
  );
};

export default NodePannel;
