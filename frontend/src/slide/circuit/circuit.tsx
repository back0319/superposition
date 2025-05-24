import React, { useState, useEffect } from "react";
import "./circuit.scss";

type Session = { id: number; name: string; modifiedTime: number; };
type PlacedGate = { qubit: number; gate: string; slot: number; left: number; };

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

  // placed gates state
  const [placedGates, setPlacedGates] = useState<PlacedGate[]>([]);
  const LABEL_OFFSET = 56;
  const GATE_SIZE    = 32;
  const GATE_GAP     = 8;
  const SLOT_SIZE    = GATE_SIZE + GATE_GAP;

  // slot 인덱스를 px 좌표로 변환
  const calcLeft = (slot: number) => LABEL_OFFSET + slot * SLOT_SIZE;

  const gates = ["H","X","Y","Z","S","T","CNOT"];
  const lines = ["q[0]","q[1]","q[2]","+","c[3]"];
  const MAX_SLOTS = 16;  // 최대 슬롯 수 (필요에 맞게 조정)

  // 드래그 시작 – 새 게이트
  const handleOpDragStart = (e: React.DragEvent<HTMLDivElement>, gate: string) => {
    e.dataTransfer.setData("gate", gate);
  };
  // 드래그 시작 – 이동 중인 placedGate
  const handlePlacedDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    pg: PlacedGate
  ) => {
    e.dataTransfer.setData(
      "moveGate",
      JSON.stringify({ qubit: pg.qubit, slot: pg.slot })
    );
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  // qubit-line 에 drop
  const handleDropOnLine = (qubit: number, e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    // 드래그된 데이터 확인
    const moveData = e.dataTransfer.getData("moveGate");
    const isMove   = !!moveData;
    const dragInfo = isMove ? JSON.parse(moveData) : undefined;

    // gate 타입 구하기
    const gate = isMove
      ? dragInfo.gate
      : e.dataTransfer.getData("gate");

    // drop 위치로부터 슬롯 인덱스 계산
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const raw  = e.clientX - rect.left - LABEL_OFFSET;
    let slot   = Math.max(0, Math.round(raw / SLOT_SIZE));

    setPlacedGates(prev => {
      // 1) 이동 중이면 기존 항목 제거
      let next = isMove
        ? prev.filter(p => !(p.qubit === dragInfo.qubit && p.slot === dragInfo.slot))
        : prev;

      // 2) 해당 qubit의 기존 슬롯 목록
      const slots  = next.filter(p => p.qubit === qubit).map(p => p.slot);
      const maxSlot = slots.length ? Math.max(...slots) : -1;

      // 3) 삽입 슬롯 조정: request가 끝 슬롯 이후면 maxSlot+1
      slot = slot > maxSlot ? maxSlot + 1 : slot;

      // 4) 슬롯 ≥ slot인 gate들 뒤로 밀기
      next = next.map(p =>
        p.qubit === qubit && p.slot >= slot
          ? { ...p, slot: p.slot + 1, left: calcLeft(p.slot + 1) }
          : p
      );

      // 5) 새로 추가된 gate 삽입
      return [
        ...next,
        { qubit, gate, slot, left: calcLeft(slot) }
      ];
    });
  };

  // 지정 슬롯이 차 있으면 가장 좌측 빈 슬롯을 찾음
  const findFreeSlot = (qubit: number, start: number): number => {
    // 0부터 MAX_SLOTS-1 까지 확인
    for (let offset = 0; offset < MAX_SLOTS; offset++) {
      // 왼쪽부터 우선 탐색
      const left = start - offset;
      if (left >= 0 && !placedGates.some(pg => pg.qubit === qubit && pg.slot === left))
        return left;
      const right = start + offset;
      if (right >= 0 && right < MAX_SLOTS && !placedGates.some(pg => pg.qubit === qubit && pg.slot === right))
        return right;
    }
    return -1;
  };

  // ① 세션 패널에 드롭하면 해당 게이트를 제거하는 핸들러 추가
  const handleRemoveGateDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const moveData = e.dataTransfer.getData("moveGate");
    if (!moveData) return;
    const { qubit, slot } = JSON.parse(moveData) as { qubit: number; slot: number };
    setPlacedGates(prev =>
      prev.filter(pg => !(pg.qubit === qubit && pg.slot === slot))
    );
  };

  // 세션 시간 내림차순 정렬
  const ordered = [...sessions].sort((a, b) => b.modifiedTime - a.modifiedTime);

  // ① QASM 문자열을 보관할 상태
  const [qasm, setQasm] = useState<string>(
    `OPENQASM 2.0;
include "qelib1.inc";`
  );

  // ② placedGates 변경 시 백엔드에 POST 요청
  useEffect(() => {
    fetch("http://localhost:5000/convert-qasm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ placedGates })
    })
      .then(res => res.json())
      .then(data => {
        if (data.qasm) setQasm(data.qasm);
      })
      .catch(console.error);
  }, [placedGates]);

  return (
    <div className="circuit-grid">
      {/* 1. 왼쪽 세션 패널 (기존 onDrop 핸들러를 이 함수로) */}
      <div
        className="sessions-panel"
        onDragOver={handleDragOver}
        onDrop={handleRemoveGateDrop}
      >
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
              >×</button>
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
          {gates.map(g => (
            <div
              key={g}
              className="op-icon"
              draggable
              onDragStart={e => handleOpDragStart(e, g)}
            >{g}</div>
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
                onDrop={e => handleDropOnLine(i, e)}
              >
                <span className="qubit-label">{lbl}</span>
                {placedGates
                  .filter(pg => pg.qubit === i)
                  .map((pg, idx) => (
                    <div
                      key={idx}
                      className={`placed-gate gate-${pg.gate}`}
                      style={{ left: pg.left }}
                      draggable
                      onDragStart={e => handlePlacedDragStart(e, pg)}
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
        <pre className="code-body">{qasm}</pre>
      </div>

      {/* 4. 하단 차트 */}
      <div className="charts-panel">
        <div className="chart prob">Measurement Probabilities</div>
        <div className="chart bloch">Q-sphere</div>
      </div>
    </div>
  );
}