import React, { useState } from "react";
import "./circuit.scss";

type Session = { id: number; name: string; modifiedTime: number; };
type PlacedGate = { qubit: number; gate: string; slot: number; left: number; };

const gates = ["H", "+", "⊕", "X", "I", "T", "S", "Z", "T†", "S†", "P", "RZ", "●", "■", "√", "√†", "Y", "RX", "RY", "U"];

export default function Circuit() {
  // 초기 세션 3개
  const [sessions, setSessions] = useState<Session[]>([
    { id: 1, name: "Session 1", modifiedTime: Date.now() - 1000 * 60 * 60 },
    { id: 2, name: "Session 2", modifiedTime: Date.now() - 1000 * 60 * 30 },
    { id: 3, name: "Session 3", modifiedTime: Date.now() },
  ]);

  // 새 세션 추가
  const handleNewSession = () => {
    const id = sessions.length ? Math.max(...sessions.map(s => s.id)) + 1 : 1;
    const newSession: Session = {
      id,
      name: `Session ${id}`,
      modifiedTime: Date.now(),
    };
    setSessions(prev => [...prev, newSession]);
  };

  // 세션 제거
  const handleRemoveSession = (id: number) => {
    setSessions(prev => prev.filter(s => s.id !== id));
  };

  // 수정 시간 내림차순 정렬
  const ordered = [...sessions].sort((a, b) => b.modifiedTime - a.modifiedTime);

  const lines = ["q[0]", "q[1]", "q[2]", "+", "c[3]"];
  const [placedGates, setPlacedGates] = useState<PlacedGate[]>([]);

  const LABEL_OFFSET = 56;    // q-label + padding
  const GATE_SIZE    = 32;    // 게이트 박스 크기
  const GATE_GAP     = 8;     // 게이트 간격
  const SLOT_SIZE    = GATE_SIZE + GATE_GAP;

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, gate: string) => {
    e.dataTransfer.setData("gate", gate);
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  const handleDrop = (qubit: number, e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const gate = e.dataTransfer.getData("gate");
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    // raw offset
    const raw = e.clientX - rect.left - LABEL_OFFSET;
    // 슬롯 인덱스 계산
    const slot = Math.max(0, Math.round(raw / SLOT_SIZE));
    // 이미 같은 슬롯에 존재하면 무시
    if (placedGates.some(pg => pg.qubit === qubit && pg.slot === slot)) {
      return;
    }
    // 최종 left 위치
    const left = LABEL_OFFSET + slot * SLOT_SIZE;
    setPlacedGates(prev => [...prev, { qubit, gate, slot, left }]);
  };

  return (
    <div className="circuit-grid">
      {/* 1. 왼쪽 세션 패널 */}
      <div className="sessions-panel">
        <button className="btn-new-session" onClick={handleNewSession}>
          + New Session
        </button>
        <ul className="sessions-list">
          {ordered.map(s => (
            <li key={s.id}>
              <span className="session-name">{s.name}</span>
              <span className="session-time">
                {new Date(s.modifiedTime).toLocaleString()}
              </span>
              <button
                className="btn-remove"
                onClick={() => handleRemoveSession(s.id)}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* 2. 가운데 회로 캔버스 */}
      <div className="circuit-panel">
        <div className="canvas-toolbar">
          <span>File</span>
          <span>Edit</span>
          <span>Inspect</span>
          <span>View</span>
          <span>Share</span>
        </div>
        <div className="ops-strip">
          {gates.map((g, i) => (
            <div
              key={i}
              className="op-icon"
              draggable
              onDragStart={e => handleDragStart(e, g)}
            >
              {g}
            </div>
          ))}
          <a href="#" className="add-btn">+ Add</a>
        </div>
        <div className="canvas-body">
          <div className="qubit-lines">
            {lines.map((lbl, i) => (
              <div
                key={i}
                className="qubit-line"
                onDragOver={handleDragOver}
                onDrop={e => handleDrop(i, e)}
              >
                <span className="qubit-label">{lbl}</span>
                {placedGates
                  .filter(pg => pg.qubit === i)
                  .map((pg, idx) => (
                    <div
                      key={idx}
                      className={`placed-gate gate-${pg.gate}`}
                      style={{ left: pg.left }}
                    >
                      <span className="gate-label">{pg.gate}</span>
                    </div>
                  ))}
              </div>
            ))}
          </div>
          <div className="line-controls">
            {lines.map((_, i) => (
              <div key={i} className="ctrl-btn">⊖</div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. 우측 QASM 코드 */}
      <div className="code-panel">
        <div className="code-header">OpenQASM 2.0</div>
        <pre className="code-body">
{`OPENQASM 2.0;
include "qelib1.inc";
qreg q[3];
creg c[3];
h q[0];
cx q[0],q[1];
measure q[0] -> c[0];`}
        </pre>
      </div>

      {/* 4. 하단 차트 */}
      <div className="charts-panel">
        <div className="chart prob">Measurement Probabilities</div>
        <div className="chart bloch">Q-sphere</div>
      </div>
    </div>
  );
}