// src/pages/cognialchemy/components/Bubble.tsx
import React, { useState, useRef, useEffect } from "react";
import * as d3 from "d3";

const Bubble: React.FC<any> = ({
  id,
  x: initialX,
  y: initialY,
  radius,
  fill,
}) => {
  // 使用本地 state 来管理泡泡的位置
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const circleRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    // 创建 d3 拖拽行为
    const dragBehavior = d3
      .drag<SVGCircleElement, { x: number; y: number }>()
      .on("start", (event) => {
        // 阻止事件冒泡
        event.sourceEvent.stopPropagation();
      })
      .on("drag", (event) => {
        // 在拖拽过程中更新位置 state
        setPosition({ x: event.x, y: event.y });
      });

    // 如果引用元素存在，则绑定拖拽行为
    if (circleRef.current) {
      d3.select<SVGCircleElement, { x: number; y: number }>(
        circleRef.current
      ).call(dragBehavior);
    }
  }, []);

  return (
    <circle
      ref={circleRef}
      data-id={id}
      cx={position.x}
      cy={position.y}
      r={radius}
      fill={fill || "#f5347f"}
      stroke="#fff"
      strokeWidth={2}
    />
  );
};

export default Bubble;
