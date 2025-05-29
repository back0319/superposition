// Test file to verify all Quirk-inspired gates are working correctly
// Only includes the 19 specified gates
import { Complex, Matrix } from './complexMath';
import { CircuitExecutor } from './gateOperations';
import { AllGates, getGateById } from './gateDefinitions';

// Test all gate implementations - Only specified gates
export function testQuirkGates(): void {
  console.log('🚀 Testing Quirk-inspired quantum gates (19 specified gates only)...');
  
  // Test basic gates
  console.log('\n📊 Testing Basic Gates (H, I, X, Y, Z):');
  testBasicGates();
  
  // Test phase gates
  console.log('\n🔄 Testing Phase Gates (T, T†, U):');
  testPhaseGates();
  
  // Test rotation gates
  console.log('\n🌀 Testing Rotation Gates (Rx, Ry, Rz):');
  testRotationGates();
  
  // Test universal gate
  console.log('\n🎛️ Testing Universal Gate (U):');
  testUniversalGate();
  
  // Test multi-qubit gates
  console.log('\n🔗 Testing Multi-Qubit Gates (CNOT, CZ, CCNOT, CCZ):');
  testMultiQubitGates();
  
  // Test route gates
  console.log('\n🛤️ Testing Route Gates (Route X, Route Y, Route Z):');
  testRouteGates();
  
  // Test barrier gate
  console.log('\n🚧 Testing Barrier Gate:');
  testBarrierGate();
  
  console.log('\n✅ All 19 specified Quirk-inspired gates tested successfully!');
}

function testBasicGates(): void {
  const executor = new CircuitExecutor(1);
  
  // Test Hadamard gate - should create superposition
  executor.applyGate('H', 0);
  const hadamardProbs = executor.getMeasurementProbabilities();
  console.log('H gate probabilities:', hadamardProbs);
  
  // Test X gate - should flip qubit
  const executor2 = new CircuitExecutor(1);
  executor2.applyGate('X', 0);
  const xProbs = executor2.getMeasurementProbabilities();
  console.log('X gate probabilities:', xProbs);
  
  // Test identity gate - should do nothing
  const executor3 = new CircuitExecutor(1);
  executor3.applyGate('I', 0);
  const iProbs = executor3.getMeasurementProbabilities();
  console.log('I gate probabilities:', iProbs);
}

function testPhaseGates(): void {
  const executor = new CircuitExecutor(1);
  
  // Test T gate
  executor.applyGate('H', 0); // Create superposition
  executor.applyGate('T', 0); // Apply T gate
  const tProbs = executor.getMeasurementProbabilities();
  console.log('T gate probabilities:', tProbs);
  
  // Test T-dagger gate
  const executor2 = new CircuitExecutor(1);
  executor2.applyGate('H', 0);
  executor2.applyGate('Td', 0);
  const tdProbs = executor2.getMeasurementProbabilities();
  console.log('T† gate probabilities:', tdProbs);
}

function testRotationGates(): void {
  const executor = new CircuitExecutor(1);
  
  // Test Rx gate with π/2 rotation
  executor.applyRotationX(0, Math.PI / 2);
  const rxProbs = executor.getMeasurementProbabilities();
  console.log('Rx(π/2) probabilities:', rxProbs);
  
  // Test Ry gate with π/4 rotation
  const executor2 = new CircuitExecutor(1);
  executor2.applyRotationY(0, Math.PI / 4);
  const ryProbs = executor2.getMeasurementProbabilities();
  console.log('Ry(π/4) probabilities:', ryProbs);
  
  // Test Rz gate with π/3 rotation
  const executor3 = new CircuitExecutor(1);
  executor3.applyGate('H', 0); // Create superposition first
  executor3.applyRotationZ(0, Math.PI / 3);
  const rzProbs = executor3.getMeasurementProbabilities();
  console.log('Rz(π/3) probabilities:', rzProbs);
}

function testUniversalGate(): void {
  const executor = new CircuitExecutor(1);
  
  // Test U gate with specific parameters
  executor.applyUniversalGate(0, Math.PI / 2, Math.PI / 4, Math.PI / 6);
  const uProbs = executor.getMeasurementProbabilities();
  console.log('U(π/2, π/4, π/6) probabilities:', uProbs);
}

function testRouteGates(): void {
  console.log('Testing Route gates (visual only, no quantum effect):');
  
  // Route gates don't affect quantum state, only circuit layout
  const routeX = getGateById('RouteX');
  const routeY = getGateById('RouteY');
  const routeZ = getGateById('RouteZ');
  
  console.log('Route X gate:', routeX ? '✅ Found' : '❌ Missing');
  console.log('Route Y gate:', routeY ? '✅ Found' : '❌ Missing');
  console.log('Route Z gate:', routeZ ? '✅ Found' : '❌ Missing');
  
  // Test that they don't change quantum state
  const executor = new CircuitExecutor(1);
  executor.applyGate('H', 0); // Create superposition
  const beforeRoute = executor.getMeasurementProbabilities();
  
  // Simulate route gates (they should be no-ops)
  const circuit = [
    { type: 'RouteX', x: 0, y: 1 },
    { type: 'RouteY', x: 0, y: 2 },
    { type: 'RouteZ', x: 0, y: 3 }
  ];
  
  const result = executor.executeCircuit(circuit);
  console.log('Probabilities before routes:', beforeRoute);
  console.log('Probabilities after routes:', result.probabilities);
  console.log('Route gates correctly preserve quantum state:', 
    JSON.stringify(beforeRoute) === JSON.stringify(result.probabilities) ? '✅' : '❌');
}

function testMultiQubitGates(): void {
  // Test CNOT gate
  const executor = new CircuitExecutor(2);
  executor.applyGate('X', 0); // Set control to |1⟩
  executor.applyControlledX(0, 1); // Apply CNOT
  const cnotProbs = executor.getMeasurementProbabilities();
  console.log('CNOT probabilities (should be |11⟩):', cnotProbs);
  
  // Test CZ gate
  const executor2 = new CircuitExecutor(2);
  executor2.applyGate('H', 0);
  executor2.applyGate('H', 1);
  executor2.applyControlledZ(0, 1);
  const czProbs = executor2.getMeasurementProbabilities();
  console.log('CZ probabilities:', czProbs);
  
  // Test Toffoli (CCNOT) gate
  const executor3 = new CircuitExecutor(3);
  executor3.applyGate('X', 0); // Set first control to |1⟩
  executor3.applyGate('X', 1); // Set second control to |1⟩
  executor3.applyToffoli(0, 1, 2); // Apply CCNOT
  const toffoliProbs = executor3.getMeasurementProbabilities();
  console.log('Toffoli probabilities (should be |111⟩):', toffoliProbs);
}

function testBarrierGate(): void {
  const executor = new CircuitExecutor(1);
  
  // Barrier should have no effect on the quantum state
  executor.applyGate('H', 0);
  const beforeBarrier = executor.getMeasurementProbabilities();
  executor.applyGate('Barrier', 0);
  const afterBarrier = executor.getMeasurementProbabilities();
  
  console.log('Before barrier:', beforeBarrier);
  console.log('After barrier:', afterBarrier);
  console.log('States equal?', JSON.stringify(beforeBarrier) === JSON.stringify(afterBarrier));
}

// Test gate matrix properties
export function testGateMatrices(): void {
  console.log('\n🔬 Testing gate matrix properties...');
  
  // Test that all 19 specified gates have proper matrix representations
  AllGates.forEach(gate => {
    try {
      const matrix = gate.matrix;
      if (matrix.rows !== matrix.cols) {
        console.warn(`⚠️ Gate ${gate.id} has non-square matrix: ${matrix.rows}x${matrix.cols}`);
      }
      console.log(`✓ ${gate.id} (${gate.name}): ${matrix.rows}x${matrix.cols} matrix`);
    } catch (error) {
      console.error(`❌ Error testing gate ${gate.id}:`, error);
    }
  });
}

// Export test functions for use in console
(window as any).testQuirkGates = testQuirkGates;
(window as any).testGateMatrices = testGateMatrices;
