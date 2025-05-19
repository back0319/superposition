import { Routes, Route } from "react-router-dom";
import Home from "./Home";
import Content from "./slide/content";
import Qubit from "./slide/quantum/qubit";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/content" element={<Content />} />
      <Route path="/qubit" element={<Qubit />} /> {/* qubit 경로 추가 */}
    </Routes>
  );
}

export default AppRoutes;