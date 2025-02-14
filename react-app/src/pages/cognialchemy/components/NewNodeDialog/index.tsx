// src/components/NewNodeDialog.tsx
import React, { useRef, useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Row,
  Col,
  Button,
  ColorPicker,
  Tag,
  Space,
  Divider,
} from "antd";
import type { SelectProps, InputRef } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { v4 as uuidv4 } from "uuid";
import styles from "./index.module.scss";

export interface NewNode {
  id: string;
  tag: string[]; // 标签为数组
  content: string;
  color: string;
  usage: number;
  pos_x: number;
  pos_y: number;
  state: object;
  created_by?: string;
  updated_by?: string;
}

interface NewNodeDialogProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: (node: NewNode) => void;
}

type TagRender = SelectProps["tagRender"];

const NewNodeDialog: React.FC<NewNodeDialogProps> = ({
  visible,
  onCancel,
  onConfirm,
}) => {
  const [form] = Form.useForm();
  const inputRef = useRef<InputRef>(null);
  const [inputValue, setInputValue] = useState("");
  const [color, setColor] = useState("#f5347f");
  // 标签选项状态，从数据库获取，每个选项包含标签文本和颜色（可选）
  const [tagOptions, setTagOptions] = useState<
    { value: string; color: string }[]
  >([]);

  // 当 Dialog 打开时，获取已有标签
  useEffect(() => {
    if (visible) {
      fetchTags();
    }
  }, [visible]);

  const fetchTags = async () => {
    try {
      const result = await window.electronAPI.getTags(); // 假设返回数组，每项至少包含 label 和 color
      // 将标签转换为 Select 组件的 options 格式
      const tags = result.tags || [];
      const options = tags.map((tag: any) => ({
        value: tag.label,
        color: tag.color || "#f5347f",
      }));
      setTagOptions(options);
    } catch (error) {
      console.error("获取标签失败：", error);
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const newNode: NewNode = {
        id: uuidv4(),
        tag: values.tag, // 多选标签数组
        content: values.content,
        color: values.color, // 颜色值
        usage: 1,
        pos_x: 0,
        pos_y: 0,
        state: {},
        created_by: "韩思远",
        updated_by: "韩思远",
      };
      onConfirm(newNode);
      form.resetFields();
      setColor("#f5347f");
    } catch (error) {
      console.error("验证失败：", error);
    }
  };

  // 自定义标签渲染，使用最新颜色
  const tagRender: TagRender = (props) => {
    const { label, closable, onClose } = props;
    const onPreventMouseDown = (event: React.MouseEvent<HTMLSpanElement>) => {
      event.preventDefault();
      event.stopPropagation();
    };
    return (
      <Tag
        color={color}
        onMouseDown={onPreventMouseDown}
        closable={closable}
        onClose={onClose}
        style={{ marginInlineEnd: 4 }}
      >
        {label}
      </Tag>
    );
  };

  const onNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  // 调用 electron 接口新增标签，并更新下拉选项
  const handleAddNewTag = async () => {
    if (inputValue) {
      const newTag = {
        id: uuidv4(),
        label: inputValue,
        color: color,
      };
      try {
        const result = await window.electronAPI.createTag(newTag);
        if (result.success) {
          await fetchTags(); // 刷新下拉选项
          // 将新增的标签加入表单中
          const currentTags: string[] = form.getFieldValue("tag") || [];
          form.setFieldsValue({ tag: [...currentTags, inputValue] });
          setInputValue("");
        } else {
          console.error("新增标签失败：", result.message);
        }
      } catch (error) {
        console.error("新增标签错误：", error);
      }
    }
  };

  return (
    <Modal
      title="新增节点"
      className={styles.NewNodeDialog}
      open={visible}
      centered
      onCancel={() => {
        form.resetFields();
        onCancel();
        setColor("#f5347f");
      }}
      footer={
        <div style={{ textAlign: "center" }}>
          <Button
            onClick={() => {
              form.resetFields();
              onCancel();
              setColor("#f5347f");
            }}
            style={{ marginRight: 16 }}
            type="default"
          >
            取消
          </Button>
          <Button onClick={handleOk} type="primary">
            确认
          </Button>
        </div>
      }
      onValuesChange={(changedValues: any) => {
        if (changedValues.color) {
          setColor(changedValues.color);
        }
      }}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ color: "#f5347f", tag: [] }}
      >
        <Form.Item label="标签">
          <Row gutter={8}>
            <Col>
              <Form.Item
                name="color"
                noStyle
                rules={[{ required: true, message: "请选择颜色" }]}
              >
                <ColorPicker
                  value={color}
                  onChange={(newColor) => {
                    const hex = newColor.toHexString();
                    setColor(hex);
                    form.setFieldsValue({ color: hex });
                  }}
                />
              </Form.Item>
            </Col>
            <Col flex="auto">
              <Form.Item
                name="tag"
                noStyle
                rules={[{ required: true, message: "请输入标签" }]}
              >
                <Select
                  mode="multiple"
                  placeholder="没有值"
                  tagRender={tagRender}
                  style={{ width: "100%" }}
                  options={tagOptions}
                  dropdownRender={(menu) => (
                    <>
                      {menu}
                      <Divider style={{ margin: "8px 0" }} />
                      <Space style={{ padding: "0 8px 4px" }}>
                        <Input
                          placeholder="请输入标签"
                          ref={inputRef}
                          value={inputValue}
                          onChange={onNameChange}
                          onKeyDown={(e) => e.stopPropagation()}
                        />
                        <Button
                          type="text"
                          icon={<PlusOutlined />}
                          onClick={handleAddNewTag}
                        >
                          新增标签
                        </Button>
                      </Space>
                    </>
                  )}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form.Item>
        <Form.Item
          name="content"
          label="内容"
          rules={[{ required: true, message: "请输入内容" }]}
        >
          <Input.TextArea rows={2} placeholder="请输入节点内容" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default NewNodeDialog;
