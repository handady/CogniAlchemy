import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import BasicLayout from "@/layouts/basic-layout";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<BasicLayout />}>
          <Route index element={<div className="pl-50 h-50 bg-red-100">home</div>} />
          <Route path="movies" element={<div>movies</div>} />
          <Route path="learning" element={<div>learning</div>} />
          {/* 添加其他子路由 */}
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
