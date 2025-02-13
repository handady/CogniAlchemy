// src/hooks/useD3ForceSimulation.ts
import { useEffect, useRef, useCallback } from "react";
import * as d3 from "d3";
import debounce from "lodash/debounce";
// 移除对 bubbleData 的导入
import { radiusScale, fontSizeScale } from "../../../utils/forceSimulation";
import * as d3DragHandlers from "./d3DragHandlers";

export interface NodeDatum {
  id: string;
  tag: string;
  color: string;
  usage: number | null;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface LinkDatum {
  source: string | NodeDatum;
  target: string | NodeDatum;
  value: number;
}

interface UseD3ForceSimulationParams {
  containerRef: React.RefObject<HTMLElement>;
}

/**
 * 自定义 Hook：在指定容器中初始化 D3 力导向图
 * 使用数据库中的数据而不是静态 JSON
 */
export const useD3ForceSimulation = ({
  containerRef,
}: UseD3ForceSimulationParams) => {
  const svgRef = useRef<d3.Selection<
    SVGSVGElement,
    unknown,
    null,
    undefined
  > | null>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<
    SVGSVGElement,
    unknown
  > | null>(null);
  const didInit = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 如果已经初始化过，则直接返回清理函数
    if (didInit.current) return;
    didInit.current = true;

    let cleanupFunction: (() => void) | undefined;
    let cancelled = false;

    // 异步加载数据库数据
    async function init() {
      // 调用预先暴露的接口，获取数据库数据
      const res = await window.electronAPI.getGraphData();
      if (!res.success) {
        console.error("Failed to get graph data:", res.message);
        return;
      }
      const { nodes: dbNodes, edges: dbEdges } = res.data;

      // 将数据库数据转换为 D3 使用的数据格式
      const nodes: NodeDatum[] = dbNodes || [];
      // 这里我们假设边数据中已有 value 字段，可以根据需要进行调整
      const links: LinkDatum[] = dbEdges || [];

      // 初始宽高
      let width = container.clientWidth;
      let height = container.clientHeight;

      // 创建 SVG 并设置 viewBox（使图形居中）
      const svg = d3
        .select(container)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", `${-width / 2} ${-height / 2} ${width} ${height}`)
        .attr("style", "max-width: 100%; height: auto;");
      svgRef.current = svg;

      // 创建 zoomContainer
      const zoomContainer = svg.append("g").attr("class", "zoom-container");

      // 1. 定义径向渐变：为每个节点生成 gradient
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

      // 2. 创建力导向 simulation
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
        .force("y", d3.forceY())
        .force(
          "collision",
          d3
            .forceCollide<NodeDatum>()
            .radius((d) => radiusScale(d.usage || 1) + 5)
            .iterations(2)
        );

      // 3. 添加连线
      const link = zoomContainer
        .append("g")
        .attr("class", "links")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
        .selectAll("line")
        .data(links)
        .join("line")
        .attr("stroke-width", (d) => Math.sqrt(d.value));

      // 4. 创建节点分组，并添加拖拽和事件处理
      const nodeGroup = zoomContainer
        .append("g")
        .attr("class", "nodes")
        .selectAll<SVGGElement, NodeDatum>("g")
        .data(nodes)
        .join("g")
        .call(
          d3
            .drag<SVGGElement, NodeDatum>()
            .on("start", d3DragHandlers.dragStarted(simulation))
            .on("drag", d3DragHandlers.dragged)
            .on("end", d3DragHandlers.dragEnded(simulation))
        )
        .style("cursor", "pointer")
        .on("mouseover", function (event, d) {
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

          const connectedIds = new Set<string>();
          connectedIds.add(d.id);
          links.forEach((l) => {
            const sourceId =
              typeof l.source === "object" ? l.source.id : (l.source as string);
            const targetId =
              typeof l.target === "object" ? l.target.id : (l.target as string);
            if (sourceId === d.id) {
              connectedIds.add(targetId);
            } else if (targetId === d.id) {
              connectedIds.add(sourceId);
            }
          });

          nodeGroup
            .filter((nodeData) => connectedIds.has(nodeData.id))
            .transition()
            .duration(300)
            .ease(d3.easeCubicOut)
            .style("opacity", 1);

          link
            .filter((l) => {
              const sourceId =
                typeof l.source === "object"
                  ? l.source.id
                  : (l.source as string);
              const targetId =
                typeof l.target === "object"
                  ? l.target.id
                  : (l.target as string);
              return sourceId === d.id || targetId === d.id;
            })
            .transition()
            .duration(300)
            .ease(d3.easeCubicOut)
            .style("opacity", 1);

          nodeIdText
            .transition()
            .duration(300)
            .ease(d3.easeCubicOut)
            .style("opacity", (nd) => (connectedIds.has(nd.id) ? 1 : 0));
        })
        .on("mouseout", function () {
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

          const currentTransform = d3.zoomTransform(
            svg.node() as SVGSVGElement
          );
          const scaleThresholdHalf = 1.35;
          const scaleThreshold = 2;
          if (currentTransform.k <= scaleThresholdHalf) {
            nodeIdText
              .transition()
              .duration(300)
              .ease(d3.easeCubicOut)
              .style("opacity", 0);
          } else if (currentTransform.k <= scaleThreshold) {
            nodeIdText
              .transition()
              .duration(300)
              .ease(d3.easeCubicOut)
              .style("opacity", 0.5);
          } else {
            nodeIdText
              .transition()
              .duration(300)
              .ease(d3.easeCubicOut)
              .style("opacity", 1);
          }
        })
        .on("click", (event, d) => {
          console.log("Clicked node:", d.id);
        });

      // 节点中的圆形和 tag
      nodeGroup
        .append("circle")
        .attr("r", (d) => radiusScale(d.usage || 1))
        .attr("fill", (d) => `url(#grad-${d.id})`);

      nodeGroup
        .append("text")
        .attr("class", "node-tag")
        .text((d) => d.tag)
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .attr("pointer-events", "none")
        .style("font-size", (d) => `${fontSizeScale(d.usage || 1)}px`)
        .style("user-select", "none");

      // 4.1 创建一组独立文本，用于显示节点 id（默认隐藏）
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
        .style("font-size", (d) => `${fontSizeScale(d.usage || 1)}px`)
        .style("user-select", "none")
        .style("opacity", 0);

      // simulation 每次 tick 时更新连线、节点和 id 文本的位置
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

      // 5. 设置 zoom 行为
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
          if (event.sourceEvent && event.sourceEvent.type === "wheel") {
            zoomContainer
              .transition()
              .duration(400)
              .ease(d3.easeCubicOut)
              .attr("transform", event.transform);
          } else {
            zoomContainer.attr("transform", event.transform);
          }
          const scaleThresholdHalf = 1.35;
          const scaleThreshold = 2;
          if (event.transform.k > scaleThreshold) {
            nodeIdText
              .transition()
              .duration(300)
              .ease(d3.easeCubicOut)
              .style("opacity", 1);
          } else if (event.transform.k > scaleThresholdHalf) {
            nodeIdText
              .transition()
              .duration(300)
              .ease(d3.easeCubicOut)
              .style("opacity", 0.5);
          } else {
            nodeIdText
              .transition()
              .duration(300)
              .ease(d3.easeCubicOut)
              .style("opacity", 0);
          }
        })
        .on("start", (event) => {
          if (event.sourceEvent && event.sourceEvent.type === "mousedown") {
            svg.style("cursor", "grabbing");
          }
        })
        .on("end", (event) => {
          if (event.sourceEvent && event.sourceEvent.type === "mouseup") {
            svg.style("cursor", "default");
          }
        });

      svg
        .call(zoomBehavior)
        .on("contextmenu", (event) => event.preventDefault());
      zoomBehaviorRef.current = zoomBehavior;

      // 6. ResizeObserver 逻辑
      const updateSVG = debounce((entry: ResizeObserverEntry) => {
        const { width, height } = entry.contentRect;
        svg
          .attr("width", width)
          .attr("height", height)
          .attr("viewBox", `${-width / 2} ${-height / 2} ${width} ${height}`);
        simulation.force("center", d3.forceCenter(0, 0));
        simulation.alpha(1).restart();
      }, 50);

      const resizeObserver = new ResizeObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.target === container) {
            updateSVG(entry);
          }
        });
      });
      resizeObserver.observe(container);

      // 清理函数
      if (!cancelled) {
        cleanupFunction = () => {
          simulation.stop();
          svg.remove();
          resizeObserver.unobserve(container);
        };
      }
    }

    // 调用初始化函数
    init();
    return () => {
      // 标记已取消，防止后续异步操作设置 cleanupFunction
      // 并执行已获得的清理函数
      if (cleanupFunction) cleanupFunction();
    };
  }, [containerRef]);

  const resetCanvas = useCallback(() => {
    if (svgRef.current && zoomBehaviorRef.current) {
      svgRef.current
        .transition()
        .duration(300)
        .call(zoomBehaviorRef.current.transform, d3.zoomIdentity);
    }
  }, []);

  return { resetCanvas };
};
