// src/pages/cognialchemy/components/Canvas.tsx
import React, { useRef } from "react";
import Bubble from "../Bubble/index";
import styles from "./index.module.scss";
import bubblesData from "../../bubble.json";

const Canvas: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const bubbles = bubblesData;

  return (
    <svg ref={svgRef} className={styles.canvas} width="100%" height="100%">
      {bubbles.map((bubble) => (
        <Bubble
          key={bubble.id}
          id={bubble.id}
          x={bubble.x}
          y={bubble.y}
          radius={bubble.radius}
        />
      ))}
    </svg>
  );
};

export default Canvas;
