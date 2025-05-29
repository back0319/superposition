import { useState, useEffect } from 'react';
import { GatePlacement } from './CircuitCanvas';
import { isMultiQubitGate } from './MultiQubitGateHandler';

interface CircuitPlacementProps {
  qubitCount: number;
  timeSlots: number;
  onPlaceGate: (gatePlacement: GatePlacement) => void;
}

// Custom hook으로 변경
const useCircuitPlacement = ({ qubitCount, timeSlots, onPlaceGate }: CircuitPlacementProps) => {
  // 게이트 배치를 위한 상태 관리
  const [placingGateType, setPlacingGateType] = useState<string | null>(null);
  const [placingStep, setPlacingStep] = useState<number>(0); // 0: 시작 안함, 1: 컨트롤 선택, 2: 컨트롤2 선택(CCNOT/CCZ), 3: 타겟 선택
  const [placingTimeSlot, setPlacingTimeSlot] = useState<number | null>(null);
  const [placingControl, setPlacingControl] = useState<number | null>(null);
  const [placingControl2, setPlacingControl2] = useState<number | null>(null);
    // 다중 큐빗 게이트 확인 함수 사용

  // 게이트 배치 시작
  const startGatePlacement = (gateType: string) => {
    setPlacingGateType(gateType);
    setPlacingStep(1); // 컨트롤 선택 단계
    setPlacingTimeSlot(null);
    setPlacingControl(null);
    setPlacingControl2(null);
  };

  // 셀 클릭 핸들러
  const handleCellClick = (x: number, y: number) => {
    if (!placingGateType) return;
      // 단일 큐빗 게이트인 경우 바로 배치
    if (!isMultiQubitGate(placingGateType)) {
      onPlaceGate({
        x,
        y,
        type: placingGateType
      });
      resetGatePlacement();
      return;
    }
    
    // 다중 큐빗 게이트인 경우 단계별 처리
    
    // 처음 클릭할 때 타임슬롯 저장
    if (placingTimeSlot === null) {
      setPlacingTimeSlot(y);
    } else if (y !== placingTimeSlot) {
      // 타임슬롯이 다르면 무시
      return;
    }
    
    if (placingStep === 1) {
      // 컨트롤 선택
      setPlacingControl(x);
      
      if (placingGateType.startsWith('cc')) { // CCNOT, CCZ
        setPlacingStep(2); // 두 번째 컨트롤 선택 단계
      } else { // CNOT, CZ
        setPlacingStep(3); // 타겟 선택 단계
      }
    } else if (placingStep === 2 && placingGateType.startsWith('cc')) {
      // 두 번째 컨트롤 선택 (CCNOT, CCZ)
      if (x !== placingControl) {
        setPlacingControl2(x);
        setPlacingStep(3); // 타겟 선택 단계
      }
    } else if (placingStep === 3) {
      // 타겟 선택
      if (x !== placingControl && (placingControl2 === null || x !== placingControl2)) {
        // 게이트 배치
        const newGate: GatePlacement = {
          x: placingControl!, // 메인 위치는 컨트롤 포인트
          y: placingTimeSlot!,
          type: placingGateType!,
          control: placingControl!,
          target: x
        };
        
        if (placingControl2 !== null) {
          newGate.control2 = placingControl2;
        }
        
        // 게이트 배치 콜백 호출
        onPlaceGate(newGate);
        
        // 상태 초기화
        resetGatePlacement();
      }
    }
  };
  // 게이트 배치 상태 초기화
  const resetGatePlacement = () => {
    setPlacingGateType(null);
    setPlacingStep(0);
    setPlacingTimeSlot(null);
    setPlacingControl(null);
    setPlacingControl2(null);
  };
  
  // 게이트 배치 취소
  const cancelGatePlacement = () => {
    resetGatePlacement();
  };
  
  // ESC 키로 게이트 배치 취소
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && placingGateType) {
        resetGatePlacement();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [placingGateType]);
    // 게이트 타입에 따른 시각적 가이드 구하기
  const getCellClassName = (x: number, y: number) => {
    if (!placingGateType || placingTimeSlot === null || placingTimeSlot !== y) {
      return '';
    }
    
    let classes = [];
    
    // 게이트 배치 단계에 따라 모든 셀에 적절한 기본 클래스 추가
    if (placingStep === 1) {
      classes.push('cell-placing-control');
    } else if (placingStep === 2) {
      classes.push('cell-placing-control2');
    } else if (placingStep === 3) {
      // X 또는 Z 게이트에 따른 타겟 클래스
      const isXGate = placingGateType === 'cx' || placingGateType === 'ccx';
      const isZGate = placingGateType === 'cz' || placingGateType === 'ccz';
      classes.push(`cell-placing-target ${isXGate ? 'x-gate' : ''} ${isZGate ? 'z-gate' : ''}`);
    }
    
    // 이미 선택된 컨트롤 포인트 표시
    if (placingStep >= 1 && placingControl === x) {
      classes.push('placing-control-point');
    }
    
    // 이미 선택된 두 번째 컨트롤 포인트 표시
    if (placingStep >= 2 && placingControl2 === x) {
      classes.push('placing-control-point');
    }
    
    // 타겟 표시 (마지막 단계)
    if (placingStep === 3 &&
        x !== placingControl && 
        (placingControl2 === null || x !== placingControl2)) {
      
      let targetClass = 'placing-target-point';
      
      // X 타입 또는 Z 타입에 따라 다른 표시
      if (placingGateType === 'cx' || placingGateType === 'ccx') {
        targetClass += ' x-type';
      } else if (placingGateType === 'cz' || placingGateType === 'ccz') {
        targetClass += ' z-type';
      }
      
      classes.push(targetClass);
    }
    
    // 연결선 표시
    if (placingStep >= 1 && placingControl !== null) {
      const minX = Math.min(placingControl, x);
      const maxX = Math.max(placingControl, x);
      
      if (placingControl !== x && 
          minX < x && x < maxX && 
          (placingStep === 3 || (placingStep === 2 && placingControl2 === null))) {
        classes.push('placing-connecting-line');
      }
    }
    
    return classes.join(' ');
  };
  
  return {
    startGatePlacement,
    handleCellClick,
    cancelGatePlacement,
    getCellClassName,
    placingGateType,
    placingStep
  };
};

export default useCircuitPlacement;
