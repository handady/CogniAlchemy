// CustomControls.tsx
import React from "react";
import { useReactFlow } from "@xyflow/react";
import { Tooltip, Button } from "antd";
import {
  ZoomInOutlined,
  ZoomOutOutlined,
  ExpandOutlined,
  LockOutlined,
  UnlockOutlined,
  TableOutlined,
  BorderlessTableOutlined,
  SaveOutlined,
} from "@ant-design/icons";

interface CustomControlsProps {
  snapEnabled: boolean;
  readOnly: boolean;
  toggleSnap: () => void;
  toggleReadOnly: () => void;
  onSave: () => void;
}

const CustomControls: React.FC<CustomControlsProps> = ({
  snapEnabled,
  readOnly,
  toggleSnap,
  toggleReadOnly,
  onSave,
}) => {
  const { zoomIn, zoomOut, fitView } = useReactFlow() as any;

  return (
    <div style={{ position: "absolute", top: 10, right: 10, zIndex: 4 }}>
      <div className={`$absolute top-3 right-3 flex flex-col gap-1 p-1`}>
        <Tooltip
          mouseEnterDelay={0.8}
          title="放大"
          placement="left"
          color="var(--primary-color)"
        >
          <Button icon={<ZoomInOutlined />} onClick={zoomIn} />
        </Tooltip>
        <Tooltip
          mouseEnterDelay={0.8}
          title="缩小"
          placement="left"
          color="var(--primary-color)"
        >
          <Button icon={<ZoomOutOutlined />} onClick={zoomOut} />
        </Tooltip>
        <Tooltip
          mouseEnterDelay={0.8}
          title="适应视图"
          placement="left"
          color="var(--primary-color)"
        >
          <Button icon={<ExpandOutlined />} onClick={fitView} />
        </Tooltip>
        <Tooltip
          title={`${snapEnabled ? "关闭" : "开启"}网格捕捉`}
          placement="left"
          mouseEnterDelay={0.8}
          color="var(--primary-color)"
        >
          <Button
            onClick={toggleSnap}
            icon={snapEnabled ? <TableOutlined /> : <BorderlessTableOutlined />}
          ></Button>
        </Tooltip>
        <Tooltip
          title={`${readOnly ? "关闭" : "开启"}只读模式`}
          placement="left"
          mouseEnterDelay={0.8}
          color="var(--primary-color)"
        >
          <Button
            onClick={toggleReadOnly}
            icon={readOnly ? <LockOutlined /> : <UnlockOutlined />}
          ></Button>
        </Tooltip>
        <Tooltip title="保存" placement="left" mouseEnterDelay={0.8}>
          <Button icon={<SaveOutlined />} onClick={onSave} />
        </Tooltip>
      </div>
    </div>
  );
};

export default CustomControls;
