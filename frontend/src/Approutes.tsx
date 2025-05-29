import { Routes, Route } from "react-router-dom";
import Home from "./Home";
import Content from "./slide/content";
import Concept from "./slide/concept/concept"; // concept 컴포넌트 임포트
import Etm1 from "./slide/entanglement/entangle";
import Qubit from "./slide/qubit/qubit";
import Circuit from "./composer/pages/CircuitEditor";
import Sp1 from "./slide/sp/sp1"; // sp1 컴포넌트 임포트 (중첩 원리)

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/content" element={<Content />} />
      <Route path="/concept" element={<Concept />} /> {/* concept 경로 추가 */}
      <Route path="/entangle" element={<Etm1 />} /> {/* entangle 경로 추가 */}
      <Route path="/qubit" element={<Qubit />} /> {/* qubit1 경로 추가 */}      
      <Route path="/circuit" element={<Circuit />} /> {/* circuit 경로 추가 */}
      <Route path="/sp1" element={<Sp1 />} /> {/* sp1 경로 추가 (중첩 원리) */}
      {/* 다른 경로들 추가 가능 */}
    </Routes>
  );
}

export default AppRoutes;