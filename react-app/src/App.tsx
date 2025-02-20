import React from "react";
import { HashRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
// 全局消息提示
import { GlobalMessageProvider } from "./components/GlobalMessageProvider";
// 布局
import BasicLayout from "@/layouts/basic-layout";
// 页面
import CogniAlchemy from "./pages/cognialchemy";
import NodeDetail from "./pages/NodeDetail";

const App: React.FC = () => {
  return (
    <GlobalMessageProvider>
      <Router>
        <Routes>
          <Route path="/" element={<BasicLayout />}>
            <Route index element={<div>home</div>} />
            <Route path="cogniAlchemy" element={<CogniAlchemy />} />
            <Route path="node/:nodeId" element={<NodeDetail />} />
            <Route path="learning" element={<div>learning</div>} />
          </Route>
        </Routes>
      </Router>
    </GlobalMessageProvider>
  );
};

export default App;
