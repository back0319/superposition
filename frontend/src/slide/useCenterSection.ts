import { useEffect, useState, useRef, RefObject } from 'react';

/**
 * 현재 화면 중앙에 위치한 섹션을 감지하여 강조하는 훅
 * @param sectionSelector 섹션 요소의 CSS 선택자
 * @param threshold 교차 영역 임계값 (0.0 ~ 1.0)
 */
export function useCenterSection(sectionSelector: string = '.content-section', threshold: number = 0.6) {
  const [centerSection, setCenterSection] = useState<Element | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // 이전 옵저버 정리
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // IntersectionObserver 옵션 설정
    const options = {
      root: null, // 뷰포트를 루트로 사용
      rootMargin: '0px',
      threshold: threshold // 요소가 임계값 이상 보일 때 콜백 실행
    };

    // 교차 상태를 추적하는 객체
    const intersectionRatios = new Map<Element, number>();
    
    // IntersectionObserver 콜백 함수
    const callback: IntersectionObserverCallback = (entries) => {
      entries.forEach(entry => {
        // 교차 비율 저장
        intersectionRatios.set(entry.target, entry.intersectionRatio);
      });

      // 교차 비율이 가장 높은 섹션 찾기
      let maxRatio = 0;
      let maxSection: Element | null = null;
      
      intersectionRatios.forEach((ratio, section) => {
        if (ratio > maxRatio) {
          maxRatio = ratio;
          maxSection = section;
        }
      });

      // 이전 섹션의 클래스 제거
      if (centerSection && centerSection !== maxSection) {
        centerSection.classList.remove('in-center');
      }

      // 새로운 중앙 섹션 설정 및 클래스 추가
      if (maxSection && maxRatio >= threshold) {
        setCenterSection(maxSection);
        // Type assertion to tell TypeScript this is an Element
        (maxSection as Element).classList.add('in-center');
      }
    };

    // IntersectionObserver 생성
    observerRef.current = new IntersectionObserver(callback, options);

    // 모든 섹션 요소 관찰 시작
    const sections = document.querySelectorAll(sectionSelector);
    sections.forEach(section => {
      observerRef.current?.observe(section);
      
      // 초기 교차 상태 설정
      intersectionRatios.set(section, 0);
    });

    // 컴포넌트 언마운트 시 정리
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      
      // 모든 섹션에서 'in-center' 클래스 제거
      sections.forEach(section => {
        section.classList.remove('in-center');
      });
    };
  }, [sectionSelector, threshold]);

  return centerSection;
}
