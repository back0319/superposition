// Quantum gate QASM generator
// Based on Quirk's implementation patterns

import { GatePlacement } from "../types";
import { getGateById } from "./gateDefinitions";

// Utility to format angles for QASM output
const formatAngle = (angle: number): string => {
  const PI = Math.PI;
  // Check if angle is a simple fraction of PI
  if (Math.abs(angle - PI) < 1e-10) return "pi";
  if (Math.abs(angle - PI/2) < 1e-10) return "pi/2";
  if (Math.abs(angle - PI/4) < 1e-10) return "pi/4";
  if (Math.abs(angle - PI/8) < 1e-10) return "pi/8";
  if (Math.abs(angle - 3*PI/4) < 1e-10) return "3*pi/4";
  if (Math.abs(angle - 3*PI/2) < 1e-10) return "3*pi/2";
  if (Math.abs(angle - 2*PI) < 1e-10) return "2*pi";
  if (Math.abs(angle - 0) < 1e-10) return "0";
  
  // Otherwise return the actual value
  return angle.toString();
};

export const generateQASM = (circuit: GatePlacement[], qubitCount: number = 3): string => {
  // QASM header
  let qasm = `OPENQASM 2.0;\ninclude "qelib1.inc";\nqreg q[${qubitCount}];\ncreg c[${qubitCount}];\n`;
  // Generate QASM code based on circuit gates
  circuit.forEach((gate) => {
    // Skip barrier gates in QASM output (or include them if needed)
    if (gate.type === "Barrier") {
      qasm += `barrier q[${gate.x}];\n`;
      return;
    }
    
    // Get gate metadata if available
    const gateInfo = getGateById(gate.type);
      switch (gate.type) {
      // Basic gates
      case "I":
      case "H":
      case "X":
      case "Y":
      case "Z":
        qasm += `${gate.type.toLowerCase()} q[${gate.x}];\n`;
        break;
        
      // Phase gates
      case "T":
        qasm += `t q[${gate.x}];\n`;
        break;
      case "Td":
        qasm += `tdg q[${gate.x}];\n`;
        break;
        
      // Universal gate
      case "U":
        {
          // Universal rotation gate with theta, phi, lambda
          const theta = gate.params?.theta !== undefined ? gate.params.theta : Math.PI/2;
          const phi = gate.params?.phi !== undefined ? gate.params.phi : 0;
          const lambda = gate.params?.lambda !== undefined ? gate.params.lambda : 0;
          
          const thetaStr = formatAngle(theta);
          const phiStr = formatAngle(phi);
          const lambdaStr = formatAngle(lambda);
          
          qasm += `u(${thetaStr}, ${phiStr}, ${lambdaStr}) q[${gate.x}];\n`;
        }
        break;
        
      // Square root gates (as in Quirk)
      case "SqrtX":
        qasm += `sx q[${gate.x}];\n`;  // OpenQASM 3 supports sx
        break;
      case "SqrtY":
        // OpenQASM doesn't have built-in sqrt(Y), decompose it
        qasm += `// SqrtY decomposition\n`;
        qasm += `sdg q[${gate.x}];\n`;
        qasm += `sx q[${gate.x}];\n`;
        qasm += `s q[${gate.x}];\n`;
        break;
      case "SqrtZ":
        qasm += `s q[${gate.x}];\n`;  // S gate is sqrt(Z)
        break;
          // Rotation gates
      case "Rx":
        {
          // Use parameter if available or default to PI/2
          const theta = gate.params?.theta !== undefined ? gate.params.theta : Math.PI/2;
          // Format the angle as a fraction of PI if it matches common values
          const angle = formatAngle(theta);
          qasm += `rx(${angle}) q[${gate.x}];\n`;
        }
        break;
      case "Ry":
        {
          const theta = gate.params?.theta !== undefined ? gate.params.theta : Math.PI/2;
          const angle = formatAngle(theta);
          qasm += `ry(${angle}) q[${gate.x}];\n`;
        }
        break;
      case "Rz":
        {
          const theta = gate.params?.theta !== undefined ? gate.params.theta : Math.PI/2;
          const angle = formatAngle(theta);
          qasm += `rz(${angle}) q[${gate.x}];\n`;
        }
        break;
          // Multi-qubit gates
      case "CNOT":
        if (gate.control !== undefined && gate.target !== undefined) {
          qasm += `cx q[${gate.control}], q[${gate.target}];\n`;
        }
        break;
      case "CZ":
        if (gate.control !== undefined && gate.target !== undefined) {
          qasm += `cz q[${gate.control}], q[${gate.target}];\n`;
        }
        break;      case "CCNOT":
        if (gate.control !== undefined && gate.target !== undefined) {
          // Assuming the second control qubit is at control+1
          const control1 = gate.control;
          const control2 = control1 + 1; // This would need proper handling in a real implementation
          qasm += `ccx q[${control1}], q[${control2}], q[${gate.target}];\n`;
        }
        break;
      case "CCZ":
        if (gate.control !== undefined && gate.target !== undefined) {
          // Assuming the second control qubit is at control+1
          const control1 = gate.control;
          const control2 = control1 + 1; // This would need proper handling in a real implementation
          // QASM doesn't have a ccz directly, so implement with h+ccx+h
          qasm += `// CCZ implementation using h+ccx+h\n`;
          qasm += `h q[${gate.target}];\n`;
          qasm += `ccx q[${control1}], q[${control2}], q[${gate.target}];\n`;
          qasm += `h q[${gate.target}];\n`;
        }
        break;
        
      // Measurement gates
      case "Measure":
        qasm += `measure q[${gate.x}] -> c[${gate.x}];\n`;
        break;
      case "Reset":
        qasm += `reset q[${gate.x}];\n`;
        break;
        
      default:
        // Unsupported gates are added as comments
        qasm += `// Unsupported gate: ${gate.type} at position (${gate.x}, ${gate.y})\n`;
    }  });

  // Add measurements if not already in circuit
  // Check if we have any measurement gates in the circuit

  return qasm;
};
