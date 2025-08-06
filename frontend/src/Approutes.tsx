import { Routes, Route } from "react-router-dom";
import Home from "./Home";

import Etm1 from "./slide/explain/entanglement/entangle";
import Qubit from "./slide/explain/qubit/qubit";
import Circuit from "./composer/pages/CircuitEditor";
import Sp1 from "./slide/explain/superposition/superpsotion"; // sp1 컴포넌트 임포트 (중첩 원리)
import QuantumComputing from "./slide/explain/concept/compute"; // 양자 컴퓨팅 컴포넌트 임포트
import Difference from "./slide/explain/concept/difference";
import History from "./slide/explain/concept/history"; // 양자 컴퓨터 역사 컴포넌트 임포트
import Applications from "./slide/explain/concept/applications"; // 양자 컴퓨터 응용 컴포넌트 임포트


function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/entangle" element={<Etm1 />} /> {/* entangle 경로 추가 */}      
      <Route path="/qubit" element={<Qubit />} /> {/* qubit 경로 추가 */}     
      <Route path="/circuit" element={<Circuit />} /> {/* circuit 경로 추가 */}      
      <Route path="/sp1" element={<Sp1 />} /> {/* sp1 경로 추가 (중첩 원리) */}
      <Route path="/superposition" element={<Sp1 />} /> {/* superposition 경로도 추가 */}
      <Route path="/compute" element={<QuantumComputing />} /> {/* 양자 컴퓨팅이란? 페이지 추가 */}
      <Route path="/compute/difference" element={<Difference />} /> {/* 양자 컴퓨터와 고전 컴퓨터의 차이 페이지 추가 */}
      <Route path="/compute/history" element={<History />} /> {/* 양자 컴퓨터의 역사 페이지 추가 */}
      <Route path="/compute/applications" element={<Applications />} /> {/* 양자 컴퓨터의 응용 페이지 추가 */}
      {/* 다른 경로들 추가 가능 */}
    </Routes>
  );
}

export default AppRoutes;