// API 기본 URL 설정
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

// API 엔드포인트들
export const API_ENDPOINTS = {
  CIRCUIT: '/circuit',
  CONCEPT: '/concept',
  SUPERPOSITION: '/superposition',
  ENTANGLE: '/entangle',
  QUBIT: '/qubit',
  QUBIT_INFO: '/qubit-info',
  SIMULATE: '/simulate',
  CONVERT_QASM: '/convert-qasm',
  ANALYZE_QASM: '/analyze-qasm',
  QUANTUM_COMPUTER: '/quantum-computer',
  GATE: '/gate',
} as const;

// 완전한 URL을 생성하는 헬퍼 함수
export const getApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`;
};
