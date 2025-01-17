import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ChatBot from "./components/ChatBot";
import FileSharingComponent from "./components/FileSharingComponent";
import ErrorPage from "./components/ErrorPage";

const App = () => {
  return (
    <Router>
        {/* Routes */}
        <Routes>
          <Route path="/" element={<ErrorPage />} />
          <Route path="/hello" element={<Info />} />
        </Routes>
    </Router>
  );
};

// Home Component
const Info = () => (
  <div className="container mt-4">
    <ChatBot />
    <FileSharingComponent />
  </div>
);

export default App;