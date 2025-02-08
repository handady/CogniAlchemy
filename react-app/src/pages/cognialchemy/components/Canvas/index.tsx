// Canvas.tsx
import React, { useEffect, useRef } from "react";
import bubbleData from "../../bubble.json";
import { radiusScale } from "../../utils/forceSimulation";
import * as d3 from "d3";

// 定义节点和连线的数据类型
interface NodeDatum {
  id: string;
  color: string;
  usage: number | null;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface LinkDatum {
  source: string | NodeDatum;
  target: string | NodeDatum;
  value: number;
}

const Canvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 根据当前容器尺寸设置初始宽高
    let width = container.clientWidth;
    let height = container.clientHeight;

    // 在 container 中添加 SVG 元素，并根据容器尺寸设置 viewBox，使图形居中
    const svg = d3
      .select(container)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      // viewBox 格式为 "minX minY width height"，这里设置为居中
      .attr("viewBox", `${-width / 2} ${-height / 2} ${width} ${height}`)
      .attr("style", "max-width: 100%; height: auto;");

    // 从 JSON 数据中获取节点和连线
    const nodes: NodeDatum[] = bubbleData.nodes || [];
    const links: LinkDatum[] = bubbleData.links || [];

    // 创建力导向图 simulation
    const simulation = d3
      .forceSimulation<NodeDatum>(nodes)
      .force(
        "link",
        d3
          .forceLink<NodeDatum, LinkDatum>(links)
          .id((d) => d.id)
          .distance(50)
      )
      .force("charge", d3.forceManyBody().strength(-200))
      // 使用 (0,0) 作为中心（因为 viewBox 已经居中）
      .force("center", d3.forceCenter(0, 0))
      .force("x", d3.forceX())
      .force("y", d3.forceY());

    // 添加连线
    const link = svg
      .append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", (d) => Math.sqrt(d.value));

    // 添加节点
    const node = svg
      .append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("r", (d) => radiusScale(d.usage || 1))
      // 根据 group 使用 d3.schemeCategory10 设置颜色
      .attr("fill", (d) => d.color)
      .call(
        d3
          .drag<SVGCircleElement, NodeDatum>()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
      );

    // 为每个节点添加提示文本
    node.append("title").text((d) => d.id);

    // simulation 每次 tick 时更新连线和节点的位置
    simulation.on("tick", () => {
      link
        .attr("x1", (d) => (d.source as NodeDatum).x!)
        .attr("y1", (d) => (d.source as NodeDatum).y!)
        .attr("x2", (d) => (d.target as NodeDatum).x!)
        .attr("y2", (d) => (d.target as NodeDatum).y!);

      node.attr("cx", (d) => d.x!).attr("cy", (d) => d.y!);
    });

    // 拖拽事件处理函数
    function dragstarted(event: any, d: NodeDatum) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }
    function dragged(event: any, d: NodeDatum) {
      d.fx = event.x;
      d.fy = event.y;
    }
    function dragended(event: any, d: NodeDatum) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    // 监听容器尺寸变化，动态更新 SVG 的尺寸和 viewBox
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.target === container) {
          width = entry.contentRect.width;
          height = entry.contentRect.height;
          svg
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", `${-width / 2} ${-height / 2} ${width} ${height}`);
          // 更新 simulation 的中心力（保持 (0,0) 居中），并重新启动 simulation
          simulation.force("center", d3.forceCenter(0, 0));
          simulation.alpha(1).restart();
        }
      }
    });
    resizeObserver.observe(container);

    // 组件卸载时清理资源
    return () => {
      simulation.stop();
      svg.remove();
      resizeObserver.unobserve(container);
    };
  }, []);

  // 父容器需要有明确的尺寸，这里示例设置为 100% 宽高
  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
};

export default Canvas;
