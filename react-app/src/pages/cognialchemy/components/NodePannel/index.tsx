// src/components/NodePannel.tsx
import React, { useState } from "react";
import { NodeDatum } from "../Canvas/hooks/types";
import styles from "./index.module.scss";
import { useGlobalMessage } from "@/components/GlobalMessageProvider";
import NewNodeDialog, { NewNode } from "../NewNodeDialog";
import { Popconfirm } from "antd";
import ForgingModal from "../ForgingModal";

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
  const [forgingModalVisible, setForgingModalVisible] = useState(false);

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
      {/* 锻造按钮 */}
      <button
        className={`${styles.btn} ${styles.forge}`}
        onClick={() => setForgingModalVisible(true)} // 打开锻造弹框
      >
        锻造
      </button>
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
      <Popconfirm
        title="确定要删除此节点吗？"
        onConfirm={onDeleteNode}
        okText="确定"
        cancelText="取消"
      >
        <button className={`${styles.btn} ${styles.delete}`}>删除</button>
      </Popconfirm>
      {/* 渲染新增节点 Dialog */}
      <NewNodeDialog
        visible={dialogVisible}
        onCancel={handleCloseDialog}
        onConfirm={handleConfirmDialog}
        node={node as any}
      />
      {/* 锻造 Modal 弹框 */}
      <ForgingModal
        visible={forgingModalVisible}
        onCancel={() => setForgingModalVisible(false)}
        nodeId={(node as any).id} // 传递节点 ID 到 ForgingModal
      />
    </div>
  );
};

export default NodePannel;
