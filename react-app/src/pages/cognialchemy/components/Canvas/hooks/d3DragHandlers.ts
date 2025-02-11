// /d3DragHandlers.ts
import * as d3 from "d3";
import { NodeDatum } from "./useD3ForceSimulation.ts";

/**
 * 拖拽开始
 * @param simulation D3 force simulation 实例
 */
export const dragStarted = (
  simulation: d3.Simulation<NodeDatum, undefined>
) => {
  return function (event: any, d: NodeDatum) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  };
};

/**
 * 拖拽中
 */
export const dragged = function (event: any, d: NodeDatum) {
  d.fx = event.x;
  d.fy = event.y;
};

/**
 * 拖拽结束
 * @param simulation D3 force simulation 实例
 */
export const dragEnded = (simulation: d3.Simulation<NodeDatum, undefined>) => {
  return function (event: any, d: NodeDatum) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  };
};

// 导出一个统一对象，方便引用
export const d3DragHandlers = {
  dragStarted: (simulation: d3.Simulation<NodeDatum, undefined>) =>
    dragStarted(simulation),
  dragged,
  dragEnded: (simulation: d3.Simulation<NodeDatum, undefined>) =>
    dragEnded(simulation),
};
