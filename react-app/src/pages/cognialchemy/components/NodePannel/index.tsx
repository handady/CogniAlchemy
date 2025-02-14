// src/components/NodePannel.tsx
import React from "react";
import { NodeDatum } from "../Canvas/hooks/useD3ForceSimulation";
import styles from "./index.module.scss";

export interface NodePannelProps {
  x: number;
  y: number;
  node: NodeDatum | null;
  onRefresh: () => void;
  onClose: () => void;
}

const NodePannel: React.FC<NodePannelProps> = ({
  x,
  y,
  node,
  onRefresh,
  onClose,
}) => {
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
          //   onRefresh();
          onClose();
        }}
      >
        修改
      </button>
      <button
        className={`${styles.btn} ${styles.connect}`}
        onClick={() => {
          //   onRefresh();
          onClose();
        }}
      >
        连接
      </button>
      <button
        className={`${styles.btn} ${styles.disconnect}`}
        onClick={() => {
          //   onRefresh();
          onClose();
        }}
      >
        断开
      </button>
      <button
        className={`${styles.btn} ${styles.delete}`}
        onClick={() => {
          //   onRefresh();
          onClose();
        }}
      >
        删除
      </button>
    </div>
  );
};

export default NodePannel;
