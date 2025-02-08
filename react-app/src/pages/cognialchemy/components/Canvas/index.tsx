// Canvas.tsx
import React, { useEffect, useRef } from "react";
import bubbleData from "../../bubble.json";
import { radiusScale, fontSizeScale } from "../../utils/forceSimulation";
import * as d3 from "d3";

// 定义节点和连线的数据类型
// 注意：这里增加了 tag 属性，假设 bubbleData.nodes 中每个节点都包含 tag 字段
interface NodeDatum {
  id: string;
  tag: string; // 用于在节点中显示的 tag
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

    // 根据容器尺寸设置初始宽高
    let width = container.clientWidth;
    let height = container.clientHeight;

    // 在 container 中添加 SVG 元素，并设置 viewBox 使图形居中
    const svg = d3
      .select(container)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `${-width / 2} ${-height / 2} ${width} ${height}`)
      .attr("style", "max-width: 100%; height: auto;");

    // ─────────────────────────────
    // 将所有图形内容放入 zoomContainer 中，方便统一缩放和平移
    const zoomContainer = svg.append("g").attr("class", "zoom-container");

    // 从 JSON 数据中获取节点和连线
    const nodes: NodeDatum[] = bubbleData.nodes || [];
    const links: LinkDatum[] = bubbleData.links || [];

    // ─────────────────────────────
    // 1. 定义径向渐变：在 <defs> 中为每个节点生成一个 gradient
    // 节点内部半透明，边缘为节点的颜色
    const defs = svg.append("defs");
    const gradients = defs
      .selectAll("radialGradient")
      .data(nodes)
      .join("radialGradient")
      .attr("id", (d) => `grad-${d.id}`)
      .attr("cx", "50%")
      .attr("cy", "50%")
      .attr("r", "50%")
      .attr("fx", "50%")
      .attr("fy", "50%");

    gradients.each(function (d) {
      const grad = d3.select(this);
      grad
        .append("stop")
        .attr("offset", "0%")
        .attr("stop-color", d.color)
        .attr("stop-opacity", 0.4);
      grad
        .append("stop")
        .attr("offset", "100%")
        .attr("stop-color", d.color)
        .attr("stop-opacity", 1);
    });
    // ─────────────────────────────

    // 创建力导向 simulation
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
      .force("center", d3.forceCenter(0, 0))
      .force("x", d3.forceX())
      .force("y", d3.forceY());

    // ─────────────────────────────
    // 2. 添加连线（挂到 zoomContainer 内）
    const link = zoomContainer
      .append("g")
      .attr("class", "links")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", (d) => Math.sqrt(d.value));

    // 定义点击节点后要触发的修改方法
    function modifyNode(d: NodeDatum) {
      console.log("Clicked node:", d.id);
      // 在这里添加你需要的其他修改逻辑
    }

    // ─────────────────────────────
    // 3. 创建节点分组，每个节点使用 <g> 包含圆形和中间的 tag 文本
    const nodeGroup = zoomContainer
      .append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(nodes)
      .join("g")
      // 添加拖拽支持
      .call(
        d3
          .drag<SVGGElement, NodeDatum>()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
      )
      // 鼠标悬浮时显示 pointer
      .style("cursor", "pointer")
      // 鼠标悬浮与离开时的过渡效果
      .on("mouseover", function (event, d) {
        // 所有节点和连线先淡出
        nodeGroup
          .transition()
          .duration(400)
          .ease(d3.easeCubicOut)
          .style("opacity", 0.3);
        link
          .transition()
          .duration(300)
          .ease(d3.easeCubicOut)
          .style("opacity", 0.1);
        // 当前节点恢复全透明度
        d3.select(this)
          .transition()
          .duration(300)
          .ease(d3.easeCubicOut)
          .style("opacity", 1);
        // 显示当前节点对应的 id 文本
        nodeIdText
          .filter((nd) => nd.id === d.id)
          .transition()
          .duration(300)
          .ease(d3.easeCubicOut)
          .style("opacity", 1);
      })
      .on("mouseout", function () {
        // 恢复所有节点和连线的透明度
        nodeGroup
          .transition()
          .duration(400)
          .ease(d3.easeCubicOut)
          .style("opacity", 1);
        link
          .transition()
          .duration(400)
          .ease(d3.easeCubicOut)
          .style("opacity", 1);

        // 根据当前缩放比例决定是否隐藏 id 文本
        const currentTransform = d3.zoomTransform(svg.node() as SVGSVGElement);
        const scaleThreshold = 2;
        if (currentTransform.k <= scaleThreshold) {
          nodeIdText
            .transition()
            .duration(300)
            .ease(d3.easeCubicOut)
            .style("opacity", 0);
        } else {
          // 如果当前缩放比例大于阈值，则保持显示 id 文本
          nodeIdText
            .transition()
            .duration(300)
            .ease(d3.easeCubicOut)
            .style("opacity", 1);
        }
      })
      .on("click", function (event, d) {
        modifyNode(d);
      });

    // 节点中的圆形，填充使用上面定义的径向渐变
    nodeGroup
      .append("circle")
      .attr("r", (d) => radiusScale(d.usage || 1))
      .attr("fill", (d) => `url(#grad-${d.id})`);

    // 节点中显示 tag
    nodeGroup
      .append("text")
      .attr("class", "node-tag")
      .text((d) => d.tag)
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "middle")
      .attr("pointer-events", "none")
      .style("font-size", (d) => fontSizeScale(d.usage || 1) + "px")
      .style("user-select", "none");

    // ─────────────────────────────
    // 4. 创建一组独立的文本用于显示节点 id（默认隐藏，不受 nodeGroup 透明度影响）
    // 该文本将在 simulation tick 时根据节点位置更新，且定位在节点上方
    const nodeIdText = zoomContainer
      .append("g")
      .attr("class", "node-ids")
      .selectAll("text")
      .data(nodes)
      .join("text")
      .attr("class", "node-id")
      .text((d) => d.id)
      .attr("text-anchor", "middle")
      .attr("pointer-events", "none")
      .style("font-size", (d) => fontSizeScale(d.usage || 1) + "px")
      .style("user-select", "none")
      .style("opacity", 0); // 初始隐藏

    // ─────────────────────────────
    // simulation 每次 tick 时更新连线和节点的位置
    simulation.on("tick", () => {
      link
        .attr("x1", (d) => (d.source as NodeDatum).x!)
        .attr("y1", (d) => (d.source as NodeDatum).y!)
        .attr("x2", (d) => (d.target as NodeDatum).x!)
        .attr("y2", (d) => (d.target as NodeDatum).y!);

      nodeGroup.attr("transform", (d) => `translate(${d.x}, ${d.y})`);

      nodeIdText
        .attr("x", (d) => d.x!)
        .attr("y", (d) => d.y! - (radiusScale(d.usage || 1) + 5));
    });

    // ─────────────────────────────
    // 5. 定义 zoom 行为：支持鼠标滚轮缩放和左右键拖拽平移，并在滚轮缩放时加入过渡效果
    const zoomBehavior = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 10])
      .filter((event) => {
        return (
          event.type === "wheel" ||
          (event.type === "mousedown" &&
            (event.button === 0 || event.button === 2))
        );
      })
      .on("zoom", (event) => {
        // 如果事件是滚轮触发，则添加过渡效果，否则直接更新
        if (event.sourceEvent && event.sourceEvent.type === "wheel") {
          zoomContainer
            .transition()
            .duration(400)
            .ease(d3.easeCubicOut)
            .attr("transform", event.transform);
        } else {
          zoomContainer.attr("transform", event.transform);
        }
        // 根据缩放级别显示或隐藏节点 id 文本
        const scaleThreshold = 2;
        if (event.transform.k > scaleThreshold) {
          nodeIdText.style("opacity", 1);
        } else {
          nodeIdText.style("opacity", 0);
        }
      });
    svg.call(zoomBehavior).on("contextmenu", (event) => event.preventDefault());
    // ─────────────────────────────

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

  // 父容器需要有明确的尺寸
  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
};

export default Canvas;
