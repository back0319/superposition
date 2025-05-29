import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./component/button.scss";
import "./component/layout/home.scss";
import { useNavigate, Link } from "react-router-dom";
import "./Approutes";
import { getApiUrl, API_ENDPOINTS } from "./config/api";

function Home() {
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showConceptButtons, setShowConceptButtons] = useState(false);
  const [showCircuitButtons, setShowCircuitButtons] = useState(false);
  const [showPracticeButtons, setShowPracticeButtons] = useState(false);
  const [isAnyMenuExpanded, setIsAnyMenuExpanded] = useState(false);
  
  // 메뉴 사라짐 지연을 위한 타이머 Refs
  const conceptTimerRef = useRef<NodeJS.Timeout | null>(null);
  const circuitTimerRef = useRef<NodeJS.Timeout | null>(null);
  const practiceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const navigate = useNavigate();
    // 개념 메뉴 상태 제어 함수들  
  const showConceptMenu = () => {
    // 현재 활성화된 모든 타이머 초기화
    if (conceptTimerRef.current) {
      clearTimeout(conceptTimerRef.current);
      conceptTimerRef.current = null;
    }
    if (circuitTimerRef.current) {
      clearTimeout(circuitTimerRef.current);
      circuitTimerRef.current = null;
    }
    if (practiceTimerRef.current) {
      clearTimeout(practiceTimerRef.current);
      practiceTimerRef.current = null;
    }
    
    // 메뉴 전환 시 깜빡임 방지를 위해 먼저 확장 상태 설정
    setIsAnyMenuExpanded(true);
    
    // 다른 메뉴 먼저 숨기고 현재 메뉴만 표시
    setShowCircuitButtons(false);
    setShowPracticeButtons(false);
    
    // 상태 즉시 업데이트
    setShowConceptButtons(true);
  };
    const hideConceptMenu = () => {
    // 전체 메뉴 숨기기 위한 감지 타이머 설정
    // 다른 메뉴에 마우스가 있는지 확인 후 숨김
    conceptTimerRef.current = setTimeout(() => {
      if (!showCircuitButtons && !showPracticeButtons) {
        setShowConceptButtons(false);
        // 모든 메뉴가 숨겨진 경우에만 확장 상태 해제
        setIsAnyMenuExpanded(false);
      }
    }, 300); // 지연 시간 증가
  };
    // 회로 메뉴 상태 제어 함수들  
  const showCircuitMenu = () => {
    // 현재 활성화된 모든 타이머 초기화
    if (conceptTimerRef.current) {
      clearTimeout(conceptTimerRef.current);
      conceptTimerRef.current = null;
    }
    if (circuitTimerRef.current) {
      clearTimeout(circuitTimerRef.current);
      circuitTimerRef.current = null;
    }
    if (practiceTimerRef.current) {
      clearTimeout(practiceTimerRef.current);
      practiceTimerRef.current = null;
    }
    
    // 메뉴 전환 시 깜빡임 방지를 위해 먼저 확장 상태 설정
    setIsAnyMenuExpanded(true);
    
    // 다른 메뉴 먼저 숨기고 현재 메뉴만 표시
    setShowConceptButtons(false);
    setShowPracticeButtons(false);
    
    // 상태 즉시 업데이트
    setShowCircuitButtons(true);
  };
    const hideCircuitMenu = () => {
    // 전체 메뉴 숨기기 위한 감지 타이머 설정
    // 다른 메뉴에 마우스가 있는지 확인 후 숨김
    circuitTimerRef.current = setTimeout(() => {
      if (!showConceptButtons && !showPracticeButtons) {
        setShowCircuitButtons(false);
        // 모든 메뉴가 숨겨진 경우에만 확장 상태 해제
        setIsAnyMenuExpanded(false);
      }
    }, 300); // 지연 시간 증가
  };
    // 실습 메뉴 상태 제어 함수들  
  const showPracticeMenu = () => {
    // 현재 활성화된 모든 타이머 초기화
    if (conceptTimerRef.current) {
      clearTimeout(conceptTimerRef.current);
      conceptTimerRef.current = null;
    }
    if (circuitTimerRef.current) {
      clearTimeout(circuitTimerRef.current);
      circuitTimerRef.current = null;
    }
    if (practiceTimerRef.current) {
      clearTimeout(practiceTimerRef.current);
      practiceTimerRef.current = null;
    }
    
    // 메뉴 전환 시 깜빡임 방지를 위해 먼저 확장 상태 설정
    setIsAnyMenuExpanded(true);
    
    // 다른 메뉴 먼저 숨기고 현재 메뉴만 표시
    setShowConceptButtons(false);
    setShowCircuitButtons(false);
    
    // 상태 즉시 업데이트
    setShowPracticeButtons(true);
  };
  
  const hidePracticeMenu = () => {
    // 전체 메뉴 숨기기 위한 감지 타이머 설정
    // 다른 메뉴에 마우스가 있는지 확인 후 숨김
    practiceTimerRef.current = setTimeout(() => {
      if (!showConceptButtons && !showCircuitButtons) {
        setShowPracticeButtons(false);
        // 모든 메뉴가 숨겨진 경우에만 확장 상태 해제
        setIsAnyMenuExpanded(false);
      }
    }, 300); // 지연 시간 증가
  };
  const goToCircuit = async () => {
    try {
      await axios.get(getApiUrl(API_ENDPOINTS.CIRCUIT));
      navigate("/circuit");
    } catch (err) {
      console.error("서버 요청에 실패했습니다.", err);
    }
  };

  const goToContent = async () => {
    try {
      await axios.get(getApiUrl(API_ENDPOINTS.CONCEPT));
      navigate("/content");
    } catch (err) {
      console.error("서버 요청에 실패했습니다.", err);
    }
  };
  // 양자 버튼 클릭 → concept 페이지
  const handleConceptClick = async () => {
    try {
      await axios.get(getApiUrl(API_ENDPOINTS.CONCEPT));
      navigate("/concept");
    } catch (err) {
      console.error("서버 요청에 실패했습니다.", err);
    }
  };  // 중첩 버튼 클릭 → superposition 페이지로 이동
  const handleSpClick = async () => {
    try {
      await axios.get(getApiUrl(API_ENDPOINTS.SUPERPOSITION));
      navigate("/superposition");
    } catch (err) {
      console.error("서버 요청에 실패했습니다.", err);
    }
  };
  const handleEtmClick = async () => {
    try {
      await axios.get(getApiUrl(API_ENDPOINTS.ENTANGLE));
      navigate("/entangle");
    } catch (err) {
      console.error("서버 요청에 실패했습니다.", err);
      // 서버 요청이 실패해도 페이지로 이동
      navigate("/entangle");
    }
  };
  // 큐비트 버튼 클릭 → qubit 페이지
  const handleQubitClick = async () => {
    try {
      await axios.get(getApiUrl(API_ENDPOINTS.QUBIT));
      navigate("/qubit");
    } catch (err) {
      console.error("서버 요청에 실패했습니다.", err);
    }
  };

  // 회로 버튼 클릭 → circuit 페이지
  const handleCircuitClick = async () => {
    try {
      await axios.get(getApiUrl(API_ENDPOINTS.CIRCUIT));
      navigate("/circuit");
    } catch (err) {
      console.error("서버 요청에 실패했습니다.", err);
    }
  };return (
    <div className="home-container">
      <main className={`home-content ${isAnyMenuExpanded ? 'content-shifted' : ''}`}>
        <div className="logo-center">SuperPosition</div>
        <h1 className="title">양자 세계로의 첫걸음</h1>
        <p className="subtitle">
          양자 컴퓨팅의 기본 개념부터 양자 회로 설계까지, 
          SuperPosition과 함께 양자 세계를 탐험해보세요.
        </p>
      </main>
      
      <div className="category-menu">
        <div 
          className={`category-item ${showConceptButtons ? 'expanded' : ''}`}
          onMouseEnter={() => {
            // 먼저 다른 메뉴의 타이머를 제거하여 중첩 효과 방지
            if (circuitTimerRef.current) {
              clearTimeout(circuitTimerRef.current);
              circuitTimerRef.current = null;
            }
            if (practiceTimerRef.current) {
              clearTimeout(practiceTimerRef.current);
              practiceTimerRef.current = null;
            }
            showConceptMenu();
          }}
          onMouseLeave={hideConceptMenu}
        >
          <div className="category-title">개념</div>
          <div className="category-description">양자 컴퓨팅의 기본 개념을 배우는 과정</div>          <div 
            className="category-expanded"
            onMouseEnter={() => {
              // 다른 메뉴의 타이머 제거 및 다른 메뉴 즉시 숨김
              if (circuitTimerRef.current) {
                clearTimeout(circuitTimerRef.current);
                circuitTimerRef.current = null;
              }
              if (practiceTimerRef.current) {
                clearTimeout(practiceTimerRef.current);
                practiceTimerRef.current = null;
              }
              
              // 다른 메뉴 상태 초기화
              setShowCircuitButtons(false);
              setShowPracticeButtons(false);
              
              // 개념 메뉴 타이머 제거 및 상태 활성화
              if (conceptTimerRef.current) {
                clearTimeout(conceptTimerRef.current);
                conceptTimerRef.current = null;
              }
              setShowConceptButtons(true);
              setIsAnyMenuExpanded(true);
            }}
            onMouseLeave={hideConceptMenu}>
            <h3 className="expanded-title">개념</h3>
            <p className="expanded-description">양자 컴퓨팅의 기본 개념을 배우는 과정</p>
            <div className="expanded-buttons">
              <button className="btn-category" onClick={handleQubitClick}>큐비트</button>
              <button className="btn-category" onClick={handleSpClick}>중첩</button>
              <button className="btn-category" onClick={handleEtmClick}>얽힘</button>
            </div>
          </div>
        </div>        <div 
          className={`category-item ${showCircuitButtons ? 'expanded' : ''}`}
          onMouseEnter={() => {
            // 먼저 다른 메뉴의 타이머를 제거하여 중첩 효과 방지
            if (conceptTimerRef.current) {
              clearTimeout(conceptTimerRef.current);
              conceptTimerRef.current = null;
            }
            if (practiceTimerRef.current) {
              clearTimeout(practiceTimerRef.current);
              practiceTimerRef.current = null;
            }
            showCircuitMenu();
          }} 
          onMouseLeave={hideCircuitMenu}
        >
          <div className="category-title">회로</div>
          <div className="category-description">양자 회로 설계와 시뮬레이션 학습</div>          <div 
            className="category-expanded"
            onMouseEnter={() => {
              // 다른 메뉴의 타이머 제거 및 다른 메뉴 즉시 숨김
              if (conceptTimerRef.current) {
                clearTimeout(conceptTimerRef.current);
                conceptTimerRef.current = null;
              }
              if (practiceTimerRef.current) {
                clearTimeout(practiceTimerRef.current);
                practiceTimerRef.current = null;
              }
              
              // 다른 메뉴 상태 초기화
              setShowConceptButtons(false);
              setShowPracticeButtons(false);
              
              // 회로 메뉴 타이머 제거 및 상태 활성화
              if (circuitTimerRef.current) {
                clearTimeout(circuitTimerRef.current);
                circuitTimerRef.current = null;
              }
              setShowCircuitButtons(true);
              setIsAnyMenuExpanded(true);
            }}
            onMouseLeave={hideCircuitMenu}>
            <h3 className="expanded-title">회로</h3>
            <p className="expanded-description">양자 회로 설계와 시뮬레이션 학습</p>
            <div className="expanded-buttons">
              <button className="btn-category" onClick={handleCircuitClick}>기본 회로</button>
              <button className="btn-category">양자 게이트</button>
              <button className="btn-category">알고리즘 구현</button>
            </div>
          </div>
        </div>        <div 
          className={`category-item ${showPracticeButtons ? 'expanded' : ''}`}
          onMouseEnter={() => {
            // 먼저 다른 메뉴의 타이머를 제거하여 중첩 효과 방지
            if (conceptTimerRef.current) {
              clearTimeout(conceptTimerRef.current);
              conceptTimerRef.current = null;
            }
            if (circuitTimerRef.current) {
              clearTimeout(circuitTimerRef.current);
              circuitTimerRef.current = null;
            }
            showPracticeMenu();
          }} 
          onMouseLeave={hidePracticeMenu}
        >
          <div className="category-title">실습</div>
          <div className="category-description">직접 체험하는 양자 프로그래밍</div>          <div 
            className="category-expanded"
            onMouseEnter={() => {
              // 다른 메뉴의 타이머 제거 및 다른 메뉴 즉시 숨김
              if (conceptTimerRef.current) {
                clearTimeout(conceptTimerRef.current);
                conceptTimerRef.current = null;
              }
              if (circuitTimerRef.current) {
                clearTimeout(circuitTimerRef.current);
                circuitTimerRef.current = null;
              }
              
              // 다른 메뉴 상태 초기화
              setShowConceptButtons(false);
              setShowCircuitButtons(false);
              
              // 실습 메뉴 타이머 제거 및 상태 활성화
              if (practiceTimerRef.current) {
                clearTimeout(practiceTimerRef.current);
                practiceTimerRef.current = null;
              }
              setShowPracticeButtons(true);
              setIsAnyMenuExpanded(true);
            }}
            onMouseLeave={hidePracticeMenu}>
            <h3 className="expanded-title">실습</h3>
            <p className="expanded-description">직접 체험하는 양자 프로그래밍</p>
            <div className="expanded-buttons">
              <button className="btn-category">기초 실습</button>
              <button className="btn-category">응용 예제</button>
              <button className="btn-category">프로젝트</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
