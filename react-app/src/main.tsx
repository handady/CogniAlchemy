import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// 导入iconfont
import "./assets/iconfont/iconfont.js";
// 导入样式
import "./styles/index.scss";
import "./index.css";
import App from "./App.tsx";
import { ConfigProvider } from "antd";
// redux以及持久化
import { Provider } from "react-redux";
import { store, persistor } from "./store/store";
import { PersistGate } from "redux-persist/integration/react";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: "#f5347f",
              fontSize: 16,
              fontFamily: "Muyao-Softbrush",
            },
          }}
        >
          <App />
        </ConfigProvider>
      </PersistGate>
    </Provider>
  </StrictMode>
);
