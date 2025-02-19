// src/pages/NodeDetail.tsx
import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { Spin } from "antd";
import { useGlobalMessage } from "@/components/GlobalMessageProvider";

const NodeDetail: React.FC = () => {
  const { nodeId } = useParams<{ nodeId: string }>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDetail() {
      const result = await window.electronAPI.getNodeDetail(nodeId as any);
      if (result.success) {
        console.log(result);
      }
      setLoading(false);
    }
    fetchDetail();
  }, [nodeId]);

  if (loading) {
    return <Spin />;
  }

  return <div style={{ width: "100%", height: "100%" }}></div>;
};

export default NodeDetail;
