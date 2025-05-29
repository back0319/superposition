// 파일: frontend/src/composer/components/GatePalette.tsx

import React, { FC, useState, ReactElement } from "react";
import { useDrag, useDrop } from "react-dnd/dist/hooks";
import "../../component/layout/circuit.scss";
import { AllGates, getGatesByCategory } from "../utils/gateDefinitions";

interface GatePaletteProps {
  save: () => void;
  load: () => void;
}

const GatePalette: FC<GatePaletteProps> = ({ save, load }): ReactElement => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentCategory, setCurrentCategory] = useState("all");
    // Gate categories for Quirk-like organization
  const gateCategories = [
    { id: "all", label: "All Gates" },
    { id: "basic", label: "Basic" },
    { id: "phase", label: "Phase" },
    { id: "rotation", label: "Rotation" },
    { id: "multi", label: "Multi-Qubit" },
    { id: "special", label: "Special" },
    { id: "advanced", label: "Advanced" }
  ];
  
  // Create simplified list of gates for display in palette with custom ordering
  const gateOrder = [
    'H', 'I', 'X', 'Y', 'Z', 'U', 'Rx', 'Ry', 'Rz', 'T', 'Td', 
    'CNOT', 'CZ', 'CCNOT', 'CCZ', 'Barrier', 'RouteX', 'RouteY', 'RouteZ'
  ];
  
  const gateMap = new Map(AllGates.map(gate => [gate.id, gate]));
  
  const gates = gateOrder.map(gateId => {
    const gate = gateMap.get(gateId === 'B' ? 'Barrier' : gateId);
    if (!gate) return null;
    return {
      id: gate.id,
      label: gate.symbol,
      color: gate.color,
      category: gate.category,
      tooltip: gate.name
    };
  }).filter(Boolean) as Array<{
    id: string;
    label: string;
    color: string;
    category: string;
    tooltip: string;
  }>;  // 검색 및 카테고리 필터링
  const filteredGates = gates.filter(gate => 
    (currentCategory === "all" || gate.category === currentCategory) &&
    (gate.label.toLowerCase().includes(searchTerm.toLowerCase()) || 
     gate.tooltip.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // 회로에서 드래그된 게이트를 받아들이는 드롭 존 구현
  const [{ isOver }, drop] = useDrop({
    accept: "CIRCUIT_GATE", // 회로의 게이트만 받음
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
    // 드롭 시 아무것도 하지 않아도 됨 (CircuitCanvas에서 onRemoveGate가 호출됨)
  });
  
  // div 엘리먼트 참조를 위한 ref 생성
  const dropTargetRef = React.useRef<HTMLDivElement>(null);
  
  // 참조 연결을 위해 useEffect 사용
  React.useEffect(() => {
    if (dropTargetRef.current) {
      drop(dropTargetRef);
    }
  }, [drop]);
  
  return (
    <div 
      className={`gate-palette ${isOver ? 'palette-drop-zone' : ''}`}
      ref={dropTargetRef}
    >
      <div className="gate-search">
        <input
          type="text"
          placeholder="Search gates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>      <div className="gate-categories">
        {gateCategories.map((category: { id: string; label: string }) => (
          <button
            key={category.id}
            className={`category-button ${currentCategory === category.id ? 'active' : ''}`}
            onClick={() => setCurrentCategory(category.id)}
          >
            {category.label}
          </button>
        ))}
      </div>

      <div className="gate-grid">
        {filteredGates.map((gate) => (
          <GateButton
            key={gate.id}
            id={gate.id}
            label={gate.label}
            color={gate.color}
            tooltip={gate.tooltip}
          />
        ))}
      </div>

      <div className="palette-footer">
        <button onClick={save} className="palette-button save-button">
          Save Circuit
        </button>
        <button onClick={load} className="palette-button load-button">
          Load Circuit
        </button>
      </div>
    </div>
  );
};

interface GateButtonProps {
  id: string;
  label: string;
  color: string;
  tooltip: string;
}

const GateButton: FC<GateButtonProps> = ({ id, label, color, tooltip }): ReactElement => {
  const [{ isDragging }, drag] = useDrag({
    type: "GATE",
    item: { type: id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging()
    })
  });
  
  // div 엘리먼트 참조를 위한 ref 생성
  const dragSourceRef = React.useRef<HTMLDivElement>(null);
  
  // 참조 연결을 위해 useEffect 사용
  React.useEffect(() => {
    if (dragSourceRef.current) {
      drag(dragSourceRef);
    }
  }, [drag]);

  return (
    <div 
      ref={dragSourceRef}
      className={`gate-button ${color} ${isDragging ? "dragging" : ""}`}
      title={tooltip}
    >
      {label}
    </div>
  );
};

export default GatePalette;