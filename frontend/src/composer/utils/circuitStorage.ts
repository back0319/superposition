// 파일: frontend/src/composer/utils/circuitStorage.ts

interface GatePlacement {
  x: number;
  y: number;
  type: string;
  control?: number;
  target?: number;
}

export function saveCircuit(circuit: GatePlacement[]): void {
  localStorage.setItem("circuit", JSON.stringify(circuit));
}

export function loadCircuit(): GatePlacement[] {
  const saved = localStorage.getItem("circuit");
  return saved ? JSON.parse(saved) : [];
}
