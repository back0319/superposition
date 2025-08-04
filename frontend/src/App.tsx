import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./Approutes"; // path.tsx에서 라우팅 정의
import { SlideMenuProvider } from "./context/SlideMenuContext";

function App() {
  return (
    <Router>
      <SlideMenuProvider>
        <AppRoutes />
      </SlideMenuProvider>
    </Router>
  );
}

export default App;
