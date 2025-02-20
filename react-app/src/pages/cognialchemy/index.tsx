import React from "react";
import Canvas from "./components/Canvas/index";
import styles from "./index.module.scss";

const CogniAlchemy: React.FC = () => {
  return (
    <div className={styles.pageContainer}>
      <Canvas />
    </div>
  );
};

export default CogniAlchemy;
