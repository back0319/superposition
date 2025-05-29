// Gate definitions for quantum circuit editor
// Based on Quirk's implementation - Only Specified Gates

import { Complex, Matrix } from './complexMath';
import React from 'react';

// Interface for gate properties
export interface GateDefinition {
  id: string;         // Unique identifier
  symbol: string;     // Symbol shown on the gate
  name: string;       // Full name
  description: string; // Description/tooltip
  category: string;   // Category for grouping
  color: string;      // CSS class for styling
  matrix: Matrix;     // Matrix representation
  customDrawer?: (props: any) => React.ReactElement; // Optional custom renderer
  params?: {          // Parameters for parameterized gates
    name: string;     // Parameter name
    defaultValue: number;  // Default value
    min?: number;     // Optional min value
    max?: number;     // Optional max value
    step?: number;    // Optional step value
  }[];
  // Function to update the matrix based on parameters
  updateMatrix?: (params: Record<string, number>) => Matrix;
  quirk?: boolean;    // Indicates if this gate uses Quirk's implementation
}

// Basic gates (H, I, X, Y, Z)
export const BasicGates: GateDefinition[] = [
  {
    id: "H",
    symbol: "H",
    name: "Hadamard",
    description: "Creates superposition by putting qubits in equal superposition",
    category: "basic",
    color: "gate-h",
    matrix: Matrix.HADAMARD,
    quirk: true
  },
  {
    id: "I",
    symbol: "I",
    name: "Identity",
    description: "Does nothing to the qubit state (no-op)",
    category: "basic",
    color: "gate-i",
    matrix: Matrix.identity(2),
    quirk: true
  },
  {
    id: "X",
    symbol: "X",
    name: "Pauli-X",
    description: "Quantum NOT gate - flips the qubit value (180° rotation around X-axis)",
    category: "basic",
    color: "gate-x",
    matrix: Matrix.PAULI_X,
    quirk: true
  },
  {
    id: "Y",
    symbol: "Y",
    name: "Pauli-Y",
    description: "Pauli-Y gate (180° rotation around Y-axis)",
    category: "basic",
    color: "gate-y",
    matrix: Matrix.PAULI_Y,
    quirk: true
  },
  {
    id: "Z",
    symbol: "Z",
    name: "Pauli-Z",
    description: "Phase flip gate (180° rotation around Z-axis)",
    category: "basic",
    color: "gate-z",
    matrix: Matrix.PAULI_Z,
    quirk: true
  }
];

// Phase and Universal gates (U, T, Td)
export const PhaseGates: GateDefinition[] = [
  {
    id: "T",
    symbol: "T",
    name: "T Gate",
    description: "π/8 phase gate (eighth turn around Z-axis)",
    category: "phase",
    color: "gate-t",
    matrix: Matrix.T_GATE,
    quirk: true
  },
  {
    id: "Td",
    symbol: "T†",
    name: "T-dagger",
    description: "Conjugate transpose of the T gate (-π/8 rotation around Z-axis)",
    category: "phase",
    color: "gate-tdg",
    matrix: new Matrix(2, 2, [
      Complex.ONE, Complex.ZERO,
      Complex.ZERO, Complex.fromPolar(1, -Math.PI/4)
    ]),
    quirk: true
  },
  {
    id: "U",
    symbol: "U",
    name: "Universal Gate",
    description: "Universal single-qubit rotation gate with arbitrary angles",
    category: "phase",
    color: "gate-u",
    matrix: new Matrix(2, 2, [
      Complex.ONE, Complex.ZERO,
      Complex.ZERO, Complex.fromPolar(1, Math.PI/4) // Default
    ]),
    params: [
      {
        name: "theta",
        defaultValue: Math.PI/2,
        min: 0,
        max: Math.PI*2,
        step: Math.PI/16
      },
      {
        name: "phi",
        defaultValue: 0,
        min: 0,
        max: Math.PI*2,
        step: Math.PI/16
      },
      {
        name: "lambda",
        defaultValue: 0,
        min: 0,
        max: Math.PI*2,
        step: Math.PI/16
      }
    ],
    updateMatrix: (params) => {
      const { theta, phi, lambda } = params;
      const cosTheta2 = Math.cos(theta/2);
      const sinTheta2 = Math.sin(theta/2);
      return new Matrix(2, 2, [
        new Complex(cosTheta2, 0), 
        Complex.fromPolar(-sinTheta2, phi),
        Complex.fromPolar(sinTheta2, lambda),
        Complex.fromPolar(cosTheta2, phi + lambda)
      ]);
    },
    quirk: true
  }
];

// Rotation gates (Rx, Ry, Rz)
export const RotationGates: GateDefinition[] = [
  {
    id: "Rx",
    symbol: "Rx",
    name: "X-Rotation",
    description: "Rotation around X-axis by an arbitrary angle",
    category: "rotation",
    color: "gate-rx",
    matrix: Matrix.fromPauliRotation(0.25, 0, 0), // Default to π/2
    params: [
      {
        name: "theta",
        defaultValue: Math.PI/2,
        min: -Math.PI*2,
        max: Math.PI*2,
        step: Math.PI/16
      }
    ],
    updateMatrix: (params) => {
      // Convert angle to turn (1 turn = 2π)
      const turns = params.theta / (2 * Math.PI);
      return Matrix.fromPauliRotation(turns, 0, 0);
    },
    quirk: true
  },
  {
    id: "Ry",
    symbol: "Ry",
    name: "Y-Rotation",
    description: "Rotation around Y-axis by an arbitrary angle",
    category: "rotation",
    color: "gate-ry",
    matrix: Matrix.fromPauliRotation(0, 0.25, 0), // Default to π/2
    params: [
      {
        name: "theta",
        defaultValue: Math.PI/2,
        min: -Math.PI*2,
        max: Math.PI*2,
        step: Math.PI/16
      }
    ],
    updateMatrix: (params) => {
      // Convert angle to turn (1 turn = 2π)
      const turns = params.theta / (2 * Math.PI);
      return Matrix.fromPauliRotation(0, turns, 0);
    },
    quirk: true
  },
  {
    id: "Rz",
    symbol: "Rz",
    name: "Z-Rotation",
    description: "Rotation around Z-axis by an arbitrary angle", 
    category: "rotation",
    color: "gate-rz",
    matrix: Matrix.fromPauliRotation(0, 0, 0.25), // Default to π/2
    params: [
      {
        name: "theta",
        defaultValue: Math.PI/2,
        min: -Math.PI*2,
        max: Math.PI*2,
        step: Math.PI/16
      }
    ],
    updateMatrix: (params) => {
      // Convert angle to turn (1 turn = 2π)
      const turns = params.theta / (2 * Math.PI);
      return Matrix.fromPauliRotation(0, 0, turns);
    },
    quirk: true
  }
];

// Multi-qubit gates (CNOT, CZ, CCNOT, CCZ) with improved definitions
export const MultiQubitGates: GateDefinition[] = [
  {
    id: "CNOT",
    symbol: "CNOT",
    name: "Controlled-NOT",
    description: "Controlled-NOT gate (flips target qubit if control qubit is |1⟩)",
    category: "multi",
    color: "gate-cx",
    matrix: Matrix.CNOT_MATRIX, // Use the predefined matrix from complexMath.ts
    quirk: true
  },
  {
    id: "CZ",
    symbol: "CZ",
    name: "Controlled-Z",
    description: "Controlled-Z gate (applies phase flip if both qubits are |1⟩)",
    category: "multi",
    color: "gate-cz",
    matrix: Matrix.CZ_MATRIX, // Use the predefined matrix from complexMath.ts
    quirk: true
  },
  {
    id: "CCNOT",
    symbol: "CCNOT",
    name: "Toffoli Gate",
    description: "Controlled-Controlled-NOT gate (flips target if both controls are |1⟩)",
    category: "multi",
    color: "gate-ccnot",
    matrix: Matrix.CCNOT_MATRIX,
    quirk: true
  },
  {
    id: "CCZ",
    symbol: "CCZ",
    name: "Controlled-Controlled-Z",
    description: "Double-controlled Z gate (applies phase flip if all qubits are |1⟩)",
    category: "multi",
    color: "gate-ccz",
    matrix: Matrix.CCZ_MATRIX,
    quirk: true
  },
  // Controlled rotation gates
  {    id: "CRx",
    symbol: "CRx",
    name: "Controlled X-Rotation",
    description: "Controlled rotation around X-axis (applies Rx if control is |1⟩)",
    category: "multi",
    color: "gate-crx",
    matrix: Matrix.rotationCX(Math.PI/2), // Default to π/2
    params: [
      {
        name: "theta",
        defaultValue: Math.PI/2,
        min: -Math.PI*2,
        max: Math.PI*2,
        step: Math.PI/16
      }
    ],    updateMatrix: (params) => {
      return Matrix.rotationCX(params.theta);
    },
    quirk: true
  },
  {    id: "CRy",
    symbol: "CRy",
    name: "Controlled Y-Rotation",
    description: "Controlled rotation around Y-axis (applies Ry if control is |1⟩)",
    category: "multi",
    color: "gate-cry",
    matrix: Matrix.rotationCY(Math.PI/2), // Default to π/2
    params: [
      {
        name: "theta",
        defaultValue: Math.PI/2,
        min: -Math.PI*2,
        max: Math.PI*2,
        step: Math.PI/16
      }
    ],    updateMatrix: (params) => {
      return Matrix.rotationCY(params.theta);
    },
    quirk: true
  },
  {    id: "CRz",
    symbol: "CRz",
    name: "Controlled Z-Rotation",
    description: "Controlled rotation around Z-axis (applies Rz if control is |1⟩)",
    category: "multi",
    color: "gate-crz",
    matrix: Matrix.rotationCZ(Math.PI/2), // Default to π/2
    params: [
      {
        name: "theta",
        defaultValue: Math.PI/2,
        min: -Math.PI*2,
        max: Math.PI*2,
        step: Math.PI/16
      }
    ],    updateMatrix: (params) => {
      return Matrix.rotationCZ(params.theta);
    },
    quirk: true
  }
];

// Route gates (Route X, Route Y, Route Z)
export const RouteGates: GateDefinition[] = [
  {
    id: "RouteX",
    symbol: "⇄",
    name: "Route X",
    description: "Routes qubit state across X dimension in grid layout",
    category: "route",
    color: "gate-route-x",
    matrix: Matrix.identity(2), // Route gates don't change state, just layout
    quirk: true
  },
  {
    id: "RouteY",
    symbol: "⇵",
    name: "Route Y",
    description: "Routes qubit state across Y dimension in grid layout",
    category: "route",
    color: "gate-route-y",
    matrix: Matrix.identity(2), // Route gates don't change state, just layout
    quirk: true
  },
  {
    id: "RouteZ",
    symbol: "⊗",
    name: "Route Z",
    description: "Routes qubit state across Z dimension in grid layout",
    category: "route",
    color: "gate-route-z",
    matrix: Matrix.identity(2), // Route gates don't change state, just layout
    quirk: true
  }
];

// Special gates (Barrier)
export const SpecialGates: GateDefinition[] = [
  {
    id: "Barrier",
    symbol: "⦵",
    name: "Barrier",
    description: "Prevents optimizations across this boundary (no effect on simulation)",
    category: "special",
    color: "gate-barrier",
    matrix: Matrix.identity(2),
    quirk: true
  }
];

// Export all gates - Only the 19 specified gates
export const AllGates: GateDefinition[] = [
  ...BasicGates,         // H, I, X, Y, Z (5 gates)
  ...PhaseGates,         // T, Td, U (3 gates)
  ...RotationGates,      // Rx, Ry, Rz (3 gates)
  ...MultiQubitGates,    // CNOT, CZ, CCNOT, CCZ (4 gates)
  ...RouteGates,         // Route X, Route Y, Route Z (3 gates)
  ...SpecialGates        // Barrier (1 gate)
];                       // Total: 19 gates

// Utility function to get a gate by ID
export function getGateById(id: string): GateDefinition | undefined {
  return AllGates.find(gate => gate.id === id);
}

// Get matrix for a specific gate
export function getGateMatrix(id: string): Matrix | undefined {
  const gate = getGateById(id);
  return gate?.matrix;
}

// Filter gates by category
export function getGatesByCategory(category: string): GateDefinition[] {
  if (category === "all") {
    return AllGates;
  }
  return AllGates.filter(gate => gate.category === category);
}
