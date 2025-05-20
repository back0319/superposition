import { Routes, Route } from "react-router-dom";
import Home from "./Home";
import Content from "./slide/content";
import Qubit from "./slide/quantum/qubit";
import Qubit1 from "./slide/quantum/qubit1"; // qubit1 컴포넌트 임포트
import Qubit2 from "./slide/quantum/qubit2"; // qubit1 컴포넌트 임포트
import Circuit from "./slide/circuit/circuit";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/content" element={<Content />} />
      <Route path="/qubit" element={<Qubit />} /> {/* qubit 경로 추가 */}
      <Route path="/qubit1" element={<Qubit1 />} /> {/* qubit1 경로 추가 */}
      <Route path="/qubit2" element={<Qubit2 />} /> {/* qubit1 경로 추가 */}
      <Route path="/circuit" element={<Circuit />} /> {/* circuit 경로 추가 */}
      {/* 다른 경로들 추가 가능 */}
    </Routes>
  );
}

export default AppRoutes;