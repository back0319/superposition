import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./Approutes"; // path.tsx에서 라우팅 정의

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
