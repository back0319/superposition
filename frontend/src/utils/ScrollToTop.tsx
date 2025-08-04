import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * 라우트 변경 시 스크롤을 최상단으로 이동시키는 컴포넌트
 * 각 페이지 전환 시 자동으로 스크롤이 최상단으로 이동합니다.
 */
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // 페이지 이동 시 스크롤을 맨 위로 이동
    window.scrollTo(0, 0);
  }, [pathname]);

  return null; // 이 컴포넌트는 UI를 렌더링하지 않음
}

export default ScrollToTop;
