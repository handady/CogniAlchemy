import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import BasicLayout from "@/layouts/basic-layout";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<BasicLayout />}>
          <Route index element={<div>home</div>} />
          <Route path="cogniAlchemy" element={<div>cogniAlchemy</div>} />
          <Route path="learning" element={<div>learning</div>} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
