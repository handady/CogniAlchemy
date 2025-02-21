import React from "react";

export interface NodeDatum {
  id: string;
  tag: any;
  tagLabels?: any;
  color: string;
  blendedTagColor: string;
  usage: number | null;
  content: any;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface LinkDatum {
  source: string | NodeDatum;
  target: string | NodeDatum;
  value: number;
  virtual?: boolean;
  distance?: number;
  strength?: number;
}

export interface GraphData {
  nodes: NodeDatum[];
  links: LinkDatum[];
}

export interface UseD3ForceSimulationParams {
  containerRef: React.RefObject<HTMLElement>;
  data: GraphData | null;
  onNodeContextMenu?: (event: MouseEvent, node: NodeDatum) => void;
  onNodeClick?: (event: MouseEvent, node: NodeDatum) => void;
}
