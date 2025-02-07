import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// 导入iconfont
import "./assets/iconfont/iconfont.js";
// 导入样式
import "./styles/index.scss";
import "./index.css";
import App from "./App.tsx";
// react19兼容的antdesign
import "@ant-design/v5-patch-for-react-19";
import { ConfigProvider } from "antd";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#f5347f",
        },
      }}
    >
      <App />
    </ConfigProvider>
  </StrictMode>
);
