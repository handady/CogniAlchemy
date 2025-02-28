import React, { useState, useEffect, useRef } from "react";
import { Modal, Input, Space, Button, Timeline } from "antd";
import { useGlobalMessage } from "@/components/GlobalMessageProvider";
import styles from "./index.module.scss";
import { v4 as uuidv4 } from "uuid";

const ForgingModal: React.FC<any> = ({ visible, onCancel, nodeId }: any) => {
  const [forgingContent, setForgingContent] = useState(""); // 锻造内容
  const globalMessage = useGlobalMessage();
  const [forgingRecords, setForgingRecords] = useState([]); // 锻造记录
  const containerRef = useRef(null) as any;

  // 提交锻造内容
  const handleForgingSubmit = async () => {
    if (!forgingContent) {
      globalMessage.error("内容不能为空");
      return;
    }
    const result = await window.electronAPI.addForgingRecord(
      nodeId,
      forgingContent,
      "韩思远",
      "韩思远",
      uuidv4()
    );
    if (result.success) {
      globalMessage.success("锻造记录成功");
      // 重新获取锻造记录
      fetchForgingRecord();
      setForgingContent(""); // 清空锻造内容
    } else {
      globalMessage.error("新增锻造记录失败");
    }
  };

  // 根据nodeId获取锻造记录
  const fetchForgingRecord = async () => {
    if (nodeId) {
      const result = await window.electronAPI.getForgingRecordsByNodeId(nodeId);
      if (result.success) {
        // 处理获取到的锻造记录
        const records: any = [];
        result.records.forEach((record: any) => {
          records.push({
            label: record.created_at,
            children: record.forging_content,
          });
        });
        setForgingRecords(records);
      } else {
        globalMessage.error("获取锻造记录失败");
      }
    }
  };

  useEffect(() => {
    fetchForgingRecord();
  }, [nodeId]);
  // 关闭模态框时清空锻造内容
  const handleCancel = () => {
    setForgingContent("");
    onCancel();
  };

  useEffect(() => {
    if (!visible) {
      setForgingContent("");
    } else {
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
      }, 0);
    }
  }, [visible]);

  // 渲染模态框
  if (!visible) return null;

  return (
    <Modal
      title="新增锻造记录"
      open={visible}
      onCancel={handleCancel}
      onOk={handleForgingSubmit}
      footer={null}
      width={"45%"}
    >
      <div className={`flex gap-10`}>
        {/* 操作面板 */}
        <div className={`flex-2`}>
          <Space direction="vertical" style={{ width: "100%" }}>
            <Input.TextArea
              value={forgingContent}
              onChange={(e) => setForgingContent(e.target.value)}
              rows={4}
              placeholder="请输入锻造内容"
            />
            <div className={`flex justify-center`}>
              <Button type="primary" onClick={handleForgingSubmit}>
                锻造
              </Button>
            </div>
          </Space>
        </div>
        {/* 时间轴 */}
        <div
          ref={containerRef}
          className={`flex-3 mt-2 min-w-[320px] max-h-[160px] ${styles["scroll-container"]}`}
          style={{ overflowY: "auto", overflowX: "hidden" }}
        >
          <Timeline mode="alternate" items={forgingRecords} />
        </div>
      </div>
    </Modal>
  );
};

export default ForgingModal;
