import { useEffect } from "react";

const Live2D = () => {
  useEffect(() => {
    // 动态加载 Live2D 看板娘
    const script = document.createElement("script");
    script.src = "live2d/autoload.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script); // 卸载时删除脚本，防止重复加载
    };
  }, []);

  return null;
};

export default Live2D;
