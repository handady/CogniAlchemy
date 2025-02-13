// src/components/Canvas.tsx
import React, { useEffect, useRef } from "react";
import Toolbar from "../Toolbar";
import { useD3ForceSimulation } from "./hooks/useD3ForceSimulation";

const Canvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { resetCanvas } = useD3ForceSimulation({
    containerRef: containerRef as React.RefObject<HTMLElement>,
  });

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%", position: "relative" }}
    >
      <Toolbar onReset={resetCanvas} />
    </div>
  );
};

export default Canvas;
