// MultiQubitGateHandler.ts
import { GatePlacement } from './CircuitCanvas';

/**
 * 다중 큐빗 게이트 생성 핸들러
 * 컨트롤과 타겟 정보가 포함된 게이트 데이터를 생성
 * 
 * @param x 컨트롤 큐빗 위치
 * @param y 타임슬롯 위치
 * @param type 게이트 타입 (cx, cz, ccx, ccz 등)
 * @param target 타겟 큐빗 위치
 * @param control2 두번째 컨트롤 큐빗 위치 (CCNOT, CCZ와 같은 게이트에 사용)
 * @returns 다중 큐빗 게이트 배치 데이터
 */
export function createMultiQubitGate(
  x: number, 
  y: number, 
  type: string,
  target: number,
  control2?: number
): GatePlacement {
  const gatePlacement: GatePlacement = {
    x,       // 주 위치 (첫번째 컨트롤)
    y,       // 타임슬롯
    type,    // 게이트 타입
    control: x,  // 컨트롤 위치
    target   // 타겟 위치
  };
  
  // 두번째 컨트롤 포인트가 있는 경우 (CCNOT, CCZ)
  if (control2 !== undefined) {
    gatePlacement.control2 = control2;
  }
  
  return gatePlacement;
}

/**
 * 게이트 배치 핸들러 가이드
 * 
 * ComposerPage 또는 CircuitEditor와 같은 컴포넌트에서 다음과 같이 구현:
 * 
 * const handleDropGate = (x: number, y: number, type: string, target?: number, control2?: number) => {
 *   // 단일 큐빗 게이트
 *   if (!isMultiQubitGate(type)) {
 *     const newGate: GatePlacement = { x, y, type };
 *     setCircuit(prev => [...prev, newGate]);
 *     return;
 *   }
 *   
 *   // 다중 큐빗 게이트 - 컨트롤과 타겟 정보가 모두 있는 경우
 *   if (target !== undefined) {
 *     const newGate = createMultiQubitGate(x, y, type, target, control2);
 *     setCircuit(prev => [...prev, newGate]);
 *   }
 * };
 * 
 * 이 함수는 CircuitCanvas 컴포넌트에 onDropGate 속성으로 전달
 */

export function isMultiQubitGate(type: string): boolean {
  const multiQubitGates = ['cx', 'cz', 'ccx', 'ccz', 'swap', 'iswap', 'cp', 'crx', 'cry', 'crz'];
  return multiQubitGates.includes(type);
}
