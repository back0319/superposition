// Gate operations implementation based on Quirk's approach
import { Complex, Matrix, tensorProduct } from './complexMath';
import { getGateById } from './gateDefinitions';

// Represents a quantum state vector
export class StateVector {
  // Amplitudes are stored as a flat array of complex numbers
  private amplitudes: Complex[];
  private numQubits: number;
  
  constructor(numQubits: number) {
    this.numQubits = numQubits;
    const size = 1 << numQubits; // 2^numQubits states
    
    // Initialize to |0...0⟩ state
    this.amplitudes = new Array(size).fill(Complex.ZERO);
    this.amplitudes[0] = Complex.ONE;
  }
  
  // Get the amplitude of a specific basis state
  getAmplitude(basisState: number): Complex {
    if (basisState < 0 || basisState >= this.amplitudes.length) {
      throw new Error(`Invalid basis state: ${basisState}`);
    }
    return this.amplitudes[basisState];
  }
  
  // Set the amplitude of a specific basis state
  setAmplitude(basisState: number, amplitude: Complex): void {
    if (basisState < 0 || basisState >= this.amplitudes.length) {
      throw new Error(`Invalid basis state: ${basisState}`);
    }
    this.amplitudes[basisState] = amplitude;
  }
    // Apply a gate to specific qubits
  applyGate(gateId: string, targetQubits: number[], params?: Record<string, number>): void {
    const gateInfo = getGateById(gateId);
    if (!gateInfo) {
      console.error(`Unknown gate: ${gateId}`);
      return;
    }
    
    // Handle parameterized gates
    let gateMatrix = gateInfo.matrix;
    if (params && gateInfo.updateMatrix) {
      // Update the matrix with provided parameters
      gateMatrix = gateInfo.updateMatrix(params);
    }
    
    this.applyMatrix(gateMatrix, targetQubits);
  }
  
  // Apply a matrix operation to specific qubits
  applyMatrix(matrix: Matrix, targetQubits: number[]): void {
    // Sort qubits in descending order
    const sortedTargets = [...targetQubits].sort((a, b) => b - a);
    
    if (matrix.rows !== 1 << sortedTargets.length || matrix.cols !== 1 << sortedTargets.length) {
      throw new Error(`Matrix dimensions don't match target qubits: ${matrix.rows}x${matrix.cols} for ${targetQubits.length} qubits`);
    }
    
    // Create new amplitudes array
    const newAmplitudes = new Array(this.amplitudes.length).fill(Complex.ZERO);
    
    // For each basis state
    for (let i = 0; i < this.amplitudes.length; i++) {
      // Extract the bits for target qubits
      let targetBits = 0;
      for (let j = 0; j < sortedTargets.length; j++) {
        if ((i & (1 << sortedTargets[j])) !== 0) {
          targetBits |= (1 << j);
        }
      }
      
      // Apply matrix to this subspace
      for (let j = 0; j < (1 << sortedTargets.length); j++) {
        // Create new state by replacing target qubits with j
        let newState = i;
        for (let k = 0; k < sortedTargets.length; k++) {
          // Clear the bit
          newState &= ~(1 << sortedTargets[k]);
          
          // Set the bit if corresponding bit in j is set
          if ((j & (1 << k)) !== 0) {
            newState |= (1 << sortedTargets[k]);
          }
        }
        
        // Add the contribution of this amplitude
        const contribution = this.amplitudes[i].mul(matrix.get(j, targetBits));
        newAmplitudes[newState] = newAmplitudes[newState].add(contribution);
      }
    }
    
    this.amplitudes = newAmplitudes;
  }
  
  // Apply a controlled gate
  applyControlledGate(gateId: string, controlQubits: number[], targetQubits: number[]): void {
    const gateMatrix = getGateById(gateId)?.matrix;
    if (!gateMatrix) {
      console.error(`Unknown gate: ${gateId}`);
      return;
    }
    
    // Create new amplitudes array
    const newAmplitudes = [...this.amplitudes];
    
    // For each basis state
    for (let i = 0; i < this.amplitudes.length; i++) {
      // Check if all control qubits are in state |1⟩
      let controlsActive = true;
      for (const controlQubit of controlQubits) {
        if ((i & (1 << controlQubit)) === 0) {
          controlsActive = false;
          break;
        }
      }
      
      // Only apply gate if controls are active
      if (controlsActive) {
        // Extract the bits for target qubits
        let targetBits = 0;
        for (let j = 0; j < targetQubits.length; j++) {
          if ((i & (1 << targetQubits[j])) !== 0) {
            targetBits |= (1 << j);
          }
        }
        
        // Apply matrix to this subspace
        for (let j = 0; j < (1 << targetQubits.length); j++) {
          // Create new state by replacing target qubits with j
          let newState = i;
          for (let k = 0; k < targetQubits.length; k++) {
            // Clear the bit
            newState &= ~(1 << targetQubits[k]);
            
            // Set the bit if corresponding bit in j is set
            if ((j & (1 << k)) !== 0) {
              newState |= (1 << targetQubits[k]);
            }
          }
          
          // Add the contribution of this amplitude
          const contribution = this.amplitudes[i].mul(gateMatrix.get(j, targetBits));
          newAmplitudes[newState] = contribution;
        }
      }
    }
    
    this.amplitudes = newAmplitudes;
  }
  
  // Get the probability of measuring a specific outcome
  getProbability(outcome: number): number {
    const amplitude = this.amplitudes[outcome];
    return amplitude.r * amplitude.r + amplitude.i * amplitude.i;
  }
  
  // Get all amplitudes
  getAllAmplitudes(): Complex[] {
    return [...this.amplitudes];
  }
  
  // Get all probabilities
  getAllProbabilities(): number[] {
    return this.amplitudes.map(amp => amp.r * amp.r + amp.i * amp.i);
  }
  
  // Convert to format used by QSphere visualization
  toQSphereFormat(): { amplitudes: Array<{r: number, i: number}>, states: string[] } {
    const states = [];
    const amplitudes = [];
    
    for (let i = 0; i < this.amplitudes.length; i++) {
      const binaryString = i.toString(2).padStart(this.numQubits, '0');
      states.push(`|${binaryString}⟩`);
      
      const amp = this.amplitudes[i];
      amplitudes.push({ r: amp.r, i: amp.i });
    }
    
    return { amplitudes, states };
  }
}

// Circuit execution based on gates and state vectors
export class CircuitExecutor {
  private stateVector: StateVector;
  
  constructor(numQubits: number) {
    this.stateVector = new StateVector(numQubits);
  }
    // Apply a gate to the circuit
  applyGate(gateId: string, qubitIndex: number, params?: Record<string, number>): void {
    this.stateVector.applyGate(gateId, [qubitIndex], params);
  }
  
  // Apply a multi-qubit gate
  applyMultiQubitGate(gateId: string, qubits: number[], params?: Record<string, number>): void {
    this.stateVector.applyGate(gateId, qubits, params);
  }
  
  // Apply a controlled gate
  applyControlledGate(gateId: string, controlQubit: number, targetQubit: number): void {
    this.stateVector.applyControlledGate(gateId, [controlQubit], [targetQubit]);
  }
  
  // Get the current state vector
  getStateVector(): StateVector {
    return this.stateVector;
  }
  
  // Get outcomes and probabilities
  getMeasurementProbabilities(): Record<string, number> {
    const probabilities = this.stateVector.getAllProbabilities();
    const result: Record<string, number> = {};
    
    for (let i = 0; i < probabilities.length; i++) {
      const prob = probabilities[i];
      if (prob > 0.000001) { // Only include non-zero probabilities
        const binaryString = i.toString(2).padStart(Math.log2(probabilities.length), '0');
        result[binaryString] = prob;
      }
    }
    
    return result;
  }
    // Execute a full circuit given gate placements
  executeCircuit(circuit: Array<{type: string, x: number, y: number, control?: number, target?: number, params?: Record<string, number>}>): {
    stateVector: { amplitudes: Array<{r: number, i: number}>, states: string[] },
    probabilities: Record<string, number>
  } {
    // Sort gates by column (y-coordinate) to ensure correct execution order
    const sortedCircuit = [...circuit].sort((a, b) => a.y - b.y);
      // Execute each gate in order
    for (const gate of sortedCircuit) {
      // Skip barrier gates as they're just visual cues with no effect on simulation
      if (gate.type === 'Barrier') {
        continue;
      }
      
      // Handle multi-qubit gates with proper Quirk-style implementation
      switch (gate.type) {
        case 'CNOT':
          if (gate.control !== undefined && gate.target !== undefined) {
            this.applyControlledX(gate.control, gate.target);
          }
          break;
          
        case 'CZ':
          if (gate.control !== undefined && gate.target !== undefined) {
            this.applyControlledZ(gate.control, gate.target);
          }
          break;
          
        case 'CCNOT':
          if (gate.control !== undefined && gate.target !== undefined) {
            const control1 = gate.control; 
            const control2 = gate.control + 1; // Second control qubit
            this.applyToffoli(control1, control2, gate.target);
          }
          break;
          
        case 'CCZ':
          if (gate.control !== undefined && gate.target !== undefined) {
            const control1 = gate.control; 
            const control2 = gate.control + 1; // Second control qubit
            this.applyCCZ(control1, control2, gate.target);
          }
          break;
          
        // Rotation gates with parameters
        case 'Rx':
          if (gate.params?.theta !== undefined) {
            this.applyRotationX(gate.x, gate.params.theta);
          } else {
            this.applyRotationX(gate.x, Math.PI / 2); // Default π/2 rotation
          }
          break;
          
        case 'Ry':
          if (gate.params?.theta !== undefined) {
            this.applyRotationY(gate.x, gate.params.theta);
          } else {
            this.applyRotationY(gate.x, Math.PI / 2); // Default π/2 rotation
          }
          break;
          
        case 'Rz':
          if (gate.params?.theta !== undefined) {
            this.applyRotationZ(gate.x, gate.params.theta);
          } else {
            this.applyRotationZ(gate.x, Math.PI / 2); // Default π/2 rotation
          }
          break;
          
        // Universal gate
        case 'U':
          if (gate.params) {
            const theta = gate.params.theta ?? Math.PI / 2;
            const phi = gate.params.phi ?? 0;
            const lambda = gate.params.lambda ?? 0;
            this.applyUniversalGate(gate.x, theta, phi, lambda);
          } else {
            this.applyGate('U', gate.x, gate.params);
          }
          break;
            // T-dagger gate
        case 'Td':
          this.applyTDagger(gate.x);
          break;
          
        // Route gates - these don't affect quantum state, only layout/visualization
        case 'RouteX':
        case 'RouteY':
        case 'RouteZ':
          // Route gates are no-ops in simulation but provide visual routing information
          // They don't change the quantum state, only help with circuit layout
          break;
          break;
          
        // All other single-qubit gates
        default:
          this.applyGate(gate.type, gate.x, gate.params);
          break;
      }
    }
    
    return {
      stateVector: this.stateVector.toQSphereFormat(),
      probabilities: this.getMeasurementProbabilities()
    };
  }
  
  // Enhanced Quirk-inspired gate execution methods
  
  // Apply controlled gates with proper Quirk-style implementation
  applyControlledX(controlQubit: number, targetQubit: number): void {
    this.stateVector.applyMatrix(Matrix.CNOT_MATRIX, [controlQubit, targetQubit]);
  }
  
  applyControlledZ(controlQubit: number, targetQubit: number): void {
    this.stateVector.applyMatrix(Matrix.CZ_MATRIX, [controlQubit, targetQubit]);
  }
  
  // Apply Toffoli (CCNOT) gate
  applyToffoli(control1: number, control2: number, target: number): void {
    this.stateVector.applyMatrix(Matrix.CCNOT_MATRIX, [control1, control2, target]);
  }
  
  // Apply CCZ gate
  applyCCZ(control1: number, control2: number, target: number): void {
    this.stateVector.applyMatrix(Matrix.CCZ_MATRIX, [control1, control2, target]);
  }
  
  // Apply rotation gates with proper angle handling
  applyRotationX(qubit: number, theta: number): void {
    const matrix = Matrix.rotationX(theta);
    this.stateVector.applyMatrix(matrix, [qubit]);
  }
  
  applyRotationY(qubit: number, theta: number): void {
    const matrix = Matrix.rotationY(theta);
    this.stateVector.applyMatrix(matrix, [qubit]);
  }
  
  applyRotationZ(qubit: number, theta: number): void {
    const matrix = Matrix.rotationZ(theta);
    this.stateVector.applyMatrix(matrix, [qubit]);
  }
  
  // Apply universal gate
  applyUniversalGate(qubit: number, theta: number, phi: number, lambda: number): void {
    const matrix = Matrix.universalGate(theta, phi, lambda);
    this.stateVector.applyMatrix(matrix, [qubit]);
  }
    // Apply T-dagger gate
  applyTDagger(qubit: number): void {
    this.stateVector.applyMatrix(Matrix.T_DAGGER, [qubit]);
  }
}
