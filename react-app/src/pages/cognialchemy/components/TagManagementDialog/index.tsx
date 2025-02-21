// src/components/TagManagementDialog.tsx
import React, { useEffect, useState } from "react";
import {
  Modal,
  Table,
  Button,
  Input,
  Space,
  Popconfirm,
  ColorPicker,
} from "antd";
import { useGlobalMessage } from "@/components/GlobalMessageProvider";

interface TagData {
  id: string;
  label: string;
  color: string;
}

interface TagManagementDialogProps {
  visible: boolean;
  onClose: () => void;
  refreshTags: () => void;
}

const TagManagementDialog: React.FC<TagManagementDialogProps> = ({
  visible,
  onClose,
  refreshTags,
}) => {
  const [tags, setTags] = useState<TagData[]>([]);
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [editedLabel, setEditedLabel] = useState("");
  const [editedColor, setEditedColor] = useState(""); // 新增编辑颜色状态
  const globalMessage = useGlobalMessage();

  useEffect(() => {
    if (visible) {
      fetchTags();
    }
  }, [visible]);

  const fetchTags = async () => {
    try {
      const result = await window.electronAPI.getTags();
      const fetchedTags = result.tags || [];
      setTags(fetchedTags);
    } catch (error) {
      console.error("获取标签失败：", error);
    }
  };

  const handleEdit = (tag: TagData) => {
    setEditingTagId(tag.id);
    setEditedLabel(tag.label);
    setEditedColor(tag.color); // 设置当前标签颜色
  };

  const handleSave = async (tag: TagData) => {
    try {
      const result = await window.electronAPI.updateTag({
        id: tag.id,
        label: editedLabel,
        color: editedColor, // 使用编辑时修改的颜色
      });
      if (result.success) {
        globalMessage.success("标签更新成功");
        refreshTags();
        await fetchTags();
      } else {
        globalMessage.error(result.message);
      }
    } catch (error) {
      console.error("更新标签错误：", error);
    }
    setEditingTagId(null);
  };

  const handleDelete = async (tag: TagData) => {
    try {
      const result = await window.electronAPI.deleteTag(tag.id);
      if (result.success) {
        globalMessage.success("标签删除成功");
        refreshTags();
        await fetchTags();
      } else {
        globalMessage.error(result.message);
      }
    } catch (error) {
      console.error("删除标签错误：", error);
    }
  };

  const columns = [
    {
      title: "标签",
      dataIndex: "label",
      key: "label",
      render: (_: any, record: TagData) => {
        if (editingTagId === record.id) {
          return (
            <Input
              value={editedLabel}
              onChange={(e) => setEditedLabel(e.target.value)}
              onPressEnter={() => handleSave(record)}
            />
          );
        }
        return record.label;
      },
    },
    {
      title: "颜色",
      dataIndex: "color",
      key: "color",
      render: (color: string, record: TagData) => {
        if (editingTagId === record.id) {
          return (
            <ColorPicker
              value={editedColor}
              onChange={(newColor) => {
                const hex = newColor.toHexString();
                setEditedColor(hex);
              }}
            />
          );
        }
        return (
          <div
            style={{
              backgroundColor: color,
              width: 50,
              height: 20,
              borderRadius: 4,
            }}
          />
        );
      },
    },
    {
      title: "操作",
      key: "action",
      render: (_: any, record: TagData) => {
        return editingTagId === record.id ? (
          <Space>
            <Button type="link" onClick={() => handleSave(record)}>
              保存
            </Button>
            <Button type="link" onClick={() => setEditingTagId(null)}>
              取消
            </Button>
          </Space>
        ) : (
          <Space>
            <Button type="link" onClick={() => handleEdit(record)}>
              编辑
            </Button>
            <Popconfirm
              title="确定要删除此标签吗？"
              onConfirm={() => handleDelete(record)}
              okText="是"
              cancelText="否"
            >
              <Button type="link" danger>
                删除
              </Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <Modal
      open={visible}
      title="标签管理"
      onCancel={onClose}
      footer={null}
      width={"40%"}
    >
      <Table
        dataSource={tags}
        columns={columns}
        rowKey="id"
        pagination={false}
      />
    </Modal>
  );
};

export default TagManagementDialog;
