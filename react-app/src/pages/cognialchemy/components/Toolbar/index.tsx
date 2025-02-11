// Toolbar.tsx
import React from "react";
import styles from "./index.module.scss";
import { Tooltip } from "antd";
import { PlusCircleOutlined, ReloadOutlined } from "@ant-design/icons";

interface ToolbarProps {
  onAdd?: () => void;
  onReset?: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ onAdd, onReset }) => {
  return (
    <div
      className={`${styles.Toolbar} absolute top-2 right-3 flex flex-col gap-1 p-1`}
    >
      <Tooltip
        title="新增节点"
        placement="bottomRight"
        classNames={{ root: "custom-tooltip" }}
        color="var(--primary-color)"
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
        placement="bottomRight"
        classNames={{ root: "custom-tooltip" }}
        color="var(--primary-color)"
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
