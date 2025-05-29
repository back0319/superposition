// Complex number and matrix utilities for quantum gate operations
// Inspired by Quirk's implementation

export class Complex {
  constructor(public readonly r: number, public readonly i: number) {}

  static ZERO = new Complex(0, 0);
  static ONE = new Complex(1, 0);
  static I = new Complex(0, 1);

  static fromPolar(r: number, theta: number): Complex {
    return new Complex(r * Math.cos(theta), r * Math.sin(theta));
  }
  
  equals(other: Complex): boolean {
    // Compare real and imaginary parts within a small epsilon for floating point comparison
    const epsilon = 1e-10;
    return Math.abs(this.r - other.r) < epsilon && Math.abs(this.i - other.i) < epsilon;
  }

  add(other: Complex): Complex {
    return new Complex(this.r + other.r, this.i + other.i);
  }

  sub(other: Complex): Complex {
    return new Complex(this.r - other.r, this.i - other.i);
  }

  mul(other: Complex): Complex {
    return new Complex(
      this.r * other.r - this.i * other.i,
      this.r * other.i + this.i * other.r
    );
  }

  scale(scalar: number): Complex {
    return new Complex(this.r * scalar, this.i * scalar);
  }

  conjugate(): Complex {
    return new Complex(this.r, -this.i);
  }
  toString(): string {
    if (this.i === 0) return `${this.r}`;
    if (this.r === 0) return `${this.i}i`;
    return `${this.r}${this.i >= 0 ? '+' : ''}${this.i}i`;
  }

  abs(): number {
    return Math.sqrt(this.r * this.r + this.i * this.i);
  }
  phase(): number {
    return Math.atan2(this.i, this.r);
  }
}

export class Matrix {
  // Matrix data is stored as a flat array of complex numbers in row-major order
  private data: Complex[];
  
  constructor(public readonly rows: number, public readonly cols: number, data?: Complex[]) {
    this.data = data || Array(rows * cols).fill(Complex.ZERO);
  }

  get(row: number, col: number): Complex {
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
      throw new Error(`Matrix index out of bounds: (${row}, ${col})`);
    }
    return this.data[row * this.cols + col];
  }

  set(row: number, col: number, value: Complex): void {
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
      throw new Error(`Matrix index out of bounds: (${row}, ${col})`);
    }
    this.data[row * this.cols + col] = value;
  }

  static identity(size: number): Matrix {
    const result = new Matrix(size, size);
    for (let i = 0; i < size; i++) {
      result.set(i, i, Complex.ONE);
    }
    return result;
  }
  static fromPauliRotation(xTurns: number, yTurns: number, zTurns: number): Matrix {
    // Implements rotation around Pauli axes by given number of turns
    // Following quantum convention where a full turn = 2π
    const theta = 2 * Math.PI * Math.sqrt(xTurns * xTurns + yTurns * yTurns + zTurns * zTurns);
    if (Math.abs(theta) < 1e-8) {
      return Matrix.identity(2);
    }
    
    // Calculate rotation components
    const c = Math.cos(theta / 2);
    const s = Math.sin(theta / 2);
    
    // Avoid division by zero
    const norm = Math.sqrt(xTurns * xTurns + yTurns * yTurns + zTurns * zTurns);
    if (norm < 1e-10) {
      return Matrix.identity(2);
    }
    
    const scale = s / norm;
    
    const ix = scale * xTurns;
    const iy = scale * yTurns;
    const iz = scale * zTurns;
    
    return new Matrix(2, 2, [
      new Complex(c, -iz),  new Complex(-iy, -ix),
      new Complex(iy, -ix), new Complex(c, iz)
    ]);
  }

  multiply(other: Matrix): Matrix {
    if (this.cols !== other.rows) {
      throw new Error(`Matrix dimensions incompatible for multiplication: ${this.rows}x${this.cols} * ${other.rows}x${other.cols}`);
    }
    
    const result = new Matrix(this.rows, other.cols);
    
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < other.cols; j++) {
        let sum = Complex.ZERO;
        for (let k = 0; k < this.cols; k++) {
          sum = sum.add(this.get(i, k).mul(other.get(k, j)));
        }
        result.set(i, j, sum);
      }
    }
    
    return result;
  }

  // Common gate matrices
  static PAULI_X = new Matrix(2, 2, [
    Complex.ZERO, Complex.ONE,
    Complex.ONE,  Complex.ZERO
  ]);

  static PAULI_Y = new Matrix(2, 2, [
    Complex.ZERO,           new Complex(0, -1),
    new Complex(0, 1), Complex.ZERO
  ]);

  static PAULI_Z = new Matrix(2, 2, [
    Complex.ONE,   Complex.ZERO,
    Complex.ZERO, new Complex(-1, 0)
  ]);

  static HADAMARD = new Matrix(2, 2, [
    new Complex(1/Math.SQRT2, 0), new Complex(1/Math.SQRT2, 0),
    new Complex(1/Math.SQRT2, 0), new Complex(-1/Math.SQRT2, 0)
  ]);

  static SQRT_X = Matrix.fromPauliRotation(0.25, 0, 0);

  static SQRT_Y = Matrix.fromPauliRotation(0, 0.25, 0);

  static SQRT_Z = Matrix.fromPauliRotation(0, 0, 0.25); // Adding this for consistency

  static S_GATE = Matrix.fromPauliRotation(0, 0, 0.25);

  static T_GATE = Matrix.fromPauliRotation(0, 0, 0.125);

  // Add T-dagger (T†) gate
  static T_DAGGER = new Matrix(2, 2, [
    Complex.ONE, Complex.ZERO,
    Complex.ZERO, Complex.fromPolar(1, -Math.PI/4) // e^(-iπ/4)
  ]);

  // Universal gate (parameterized)
  static universalGate(theta: number, phi: number, lambda: number): Matrix {
    const cosTheta2 = Math.cos(theta / 2);
    const sinTheta2 = Math.sin(theta / 2);
    return new Matrix(2, 2, [
      new Complex(cosTheta2, 0),
      Complex.fromPolar(-sinTheta2, phi),
      Complex.fromPolar(sinTheta2, lambda),
      Complex.fromPolar(cosTheta2, phi + lambda)
    ]);
  }
  // Rotation gates with precise implementations following standard quantum conventions
  static rotationX(theta: number): Matrix {
    // Rx(θ) = exp(-i θ/2 X) = cos(θ/2)I - i sin(θ/2)X
    const halfTheta = theta / 2;
    const cosHalf = Math.cos(halfTheta);
    const sinHalf = Math.sin(halfTheta);
    
    return new Matrix(2, 2, [
      new Complex(cosHalf, 0),           new Complex(0, -sinHalf),
      new Complex(0, -sinHalf),          new Complex(cosHalf, 0)
    ]);
  }

  static rotationY(theta: number): Matrix {
    // Ry(θ) = exp(-i θ/2 Y) = cos(θ/2)I - i sin(θ/2)Y
    const halfTheta = theta / 2;
    const cosHalf = Math.cos(halfTheta);
    const sinHalf = Math.sin(halfTheta);
    
    return new Matrix(2, 2, [
      new Complex(cosHalf, 0),          new Complex(-sinHalf, 0),
      new Complex(sinHalf, 0),          new Complex(cosHalf, 0)
    ]);
  }

  static rotationZ(theta: number): Matrix {
    // Rz(θ) = exp(-i θ/2 Z) = cos(θ/2)I - i sin(θ/2)Z
    const halfTheta = theta / 2;
    const cosHalf = Math.cos(halfTheta);
    const sinHalf = Math.sin(halfTheta);
    
    return new Matrix(2, 2, [
      new Complex(cosHalf, -sinHalf),    new Complex(0, 0),
      new Complex(0, 0),                 new Complex(cosHalf, sinHalf)
    ]);
  }

  // Square root gates (Quirk-style quarter turns)
  static SQRT_X_DAGGER = new Matrix(2, 2, [
    new Complex(0.5, -0.5), new Complex(0.5, 0.5),
    new Complex(0.5, 0.5), new Complex(0.5, -0.5)
  ]);

  static SQRT_Y_DAGGER = new Matrix(2, 2, [
    new Complex(0.5, -0.5), new Complex(-0.5, -0.5),
    new Complex(0.5, 0.5), new Complex(0.5, -0.5)
  ]);

  // Identity matrix for various qubit counts
  static IDENTITY_1 = Matrix.identity(2);
  static IDENTITY_2 = Matrix.identity(4);
  static IDENTITY_3 = Matrix.identity(8);
  // Two-qubit gate matrices - using standard conventions for quantum computation
  // CNOT gate (Controlled NOT) - flips second qubit if first is |1⟩
  static CNOT_MATRIX = new Matrix(4, 4, [
    Complex.ONE,    Complex.ZERO,  Complex.ZERO,  Complex.ZERO, // |00⟩ → |00⟩
    Complex.ZERO,   Complex.ONE,   Complex.ZERO,  Complex.ZERO, // |01⟩ → |01⟩
    Complex.ZERO,   Complex.ZERO,  Complex.ZERO,  Complex.ONE,  // |10⟩ → |11⟩
    Complex.ZERO,   Complex.ZERO,  Complex.ONE,   Complex.ZERO  // |11⟩ → |10⟩
  ]);

  // CZ gate (Controlled-Z) - adds phase of -1 if both qubits are |1⟩
  static CZ_MATRIX = new Matrix(4, 4, [
    Complex.ONE,    Complex.ZERO,  Complex.ZERO,  Complex.ZERO,    // |00⟩ → |00⟩
    Complex.ZERO,   Complex.ONE,   Complex.ZERO,  Complex.ZERO,    // |01⟩ → |01⟩
    Complex.ZERO,   Complex.ZERO,  Complex.ONE,   Complex.ZERO,    // |10⟩ → |10⟩
    Complex.ZERO,   Complex.ZERO,  Complex.ZERO,  new Complex(-1, 0) // |11⟩ → -|11⟩
  ]);  // Enhanced control matrix helper (for controlled gates)
  static controlMat(controlCount: number, targetMatrix: Matrix): Matrix {
    const dim = 1 << (controlCount + targetMatrix.rows);
    const result = new Matrix(dim, dim);
    
    // Set identity for non-controlled parts
    for (let i = 0; i < dim; i++) {
      result.set(i, i, Complex.ONE);
    }
    
    // Calculate the control pattern to apply target matrix
    // This applies the target matrix only when all control bits are 1
    const controlMask = ((1 << controlCount) - 1) << (targetMatrix.rows - 1);
    const targetDim = targetMatrix.rows;
    
    // Apply target matrix when control condition is met
    for (let i = 0; i < targetDim; i++) {
      for (let j = 0; j < targetDim; j++) {
        // Calculate indices with control bits set to 1
        const rowIdx = (controlMask << 1) | i;
        const colIdx = (controlMask << 1) | j;
        
        // Only modify these specific elements (keeping identity elsewhere)
        const targetElement = targetMatrix.get(i, j);
        const epsilon = 1e-10;
        const isIdentity = i === j && Math.abs(targetElement.r - 1) < epsilon && Math.abs(targetElement.i) < epsilon;
        
        if (!isIdentity) {
          result.set(rowIdx, colIdx, targetElement);
        }
      }
    }
    
    return result;
  }
    // Create controlled versions of rotation gates with precise implementations
  static rotationCX(theta: number): Matrix {
    return Matrix.controlMat(1, Matrix.rotationX(theta));
  }
  
  static rotationCY(theta: number): Matrix {
    return Matrix.controlMat(1, Matrix.rotationY(theta));
  }
  
  static rotationCZ(theta: number): Matrix {
    return Matrix.controlMat(1, Matrix.rotationZ(theta));
  }
  // Three-qubit gate matrices with improved numerical stability and clarity
  // CCZ (Controlled-Controlled-Z) applies a Z gate when both controls are 1
  static CCZ_MATRIX = (() => {
    const mat = Matrix.identity(8);
    // Apply phase flip only to |111⟩ state 
    // (state index 7 because binary 111 = decimal 7)
    mat.set(7, 7, new Complex(-1, 0));
    return mat;
  })();

  // CCNOT (Toffoli) gate applies an X gate when both controls are 1
  static CCNOT_MATRIX = (() => {
    const mat = Matrix.identity(8);
    // Swap states |110⟩ and |111⟩
    // (state indices 6 and 7 because binary 110 = decimal 6, binary 111 = decimal 7)
    mat.set(6, 6, Complex.ZERO);
    mat.set(6, 7, Complex.ONE);
    mat.set(7, 6, Complex.ONE);
    mat.set(7, 7, Complex.ZERO);
    return mat;
  })();
}

// Tensor product utility function
export function tensorProduct(a: Matrix, b: Matrix): Matrix {
  const result = new Matrix(a.rows * b.rows, a.cols * b.cols);
  
  for (let i = 0; i < a.rows; i++) {
    for (let j = 0; j < a.cols; j++) {
      const aValue = a.get(i, j);
      for (let k = 0; k < b.rows; k++) {
        for (let l = 0; l < b.cols; l++) {
          result.set(
            i * b.rows + k,
            j * b.cols + l,
            aValue.mul(b.get(k, l))
          );
        }
      }
    }
  }
  
  return result;
}
