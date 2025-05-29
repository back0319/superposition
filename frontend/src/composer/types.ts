// Quantum circuit types

export interface GatePlacement {
  x: number;        // Row (qubit) index
  y: number;        // Column (time step) index
  type: string;     // Gate type identifier
  control?: number; // Control qubit for multi-qubit gates
  control2?: number; // Second control qubit for three-qubit gates
  target?: number;  // Target qubit for multi-qubit gates
  params?: {        // Optional parameters for parametrized gates
    [key: string]: number;
  };
}

// Supported gate categories
export type GateCategory = 
  | 'basic'       // Basic gates like X, Y, Z, H
  | 'phase'       // Phase gates like S, T
  | 'multi'       // Multi-qubit gates like CX, SWAP
  | 'rotation'    // Rotation gates like Rx, Ry, Rz
  | 'measurement' // Measurement operations
  | 'advanced';   // Other advanced gates
