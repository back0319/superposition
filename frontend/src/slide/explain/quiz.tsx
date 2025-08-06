import React, { useState, useEffect, useCallback } from "react";

// 퀴즈 데이터 상수
export const QUIZ_DATA: { [key: number]: { [key: number]: { question: string; answer: boolean; explanation: string } } } = {
  0: { // 양자 컴퓨터
    0: { // 정의
      question: "양자 컴퓨터는 큐비트(qubit)를 사용하여 정보를 처리한다.",
      answer: true,
      explanation: "맞습니다! 양자 컴퓨터는 고전 컴퓨터의 비트 대신 큐비트를 사용하여 정보를 처리합니다."
    },
    1: { // 고전 컴퓨터와의 차이
      question: "양자 컴퓨터와 고전 컴퓨터는 동일한 원리로 작동한다.",
      answer: false,
      explanation: "틀렸습니다. 양자 컴퓨터는 양자역학의 원리(중첩, 얽힘 등)를 이용하여 고전 컴퓨터와는 완전히 다른 방식으로 작동합니다."
    },
    2: { // 양자 컴퓨터의 역사
      question: "양자 컴퓨터의 개념은 1980년대에 처음 제안되었다.",
      answer: true,
      explanation: "맞습니다! 리처드 파인만과 폴 베니오프가 1980년대에 양자 컴퓨터의 개념을 처음 제안했습니다."
    },
    3: { // 양자 컴퓨터의 응용
      question: "양자 컴퓨터는 암호화 분야에만 응용될 수 있다.",
      answer: false,
      explanation: "틀렸습니다. 양자 컴퓨터는 암호화뿐만 아니라 약물 개발, 금융 모델링, 인공지능 등 다양한 분야에 응용될 수 있습니다."
    }
  },
  1: { // 큐비트
    0: { // 정의
      question: "큐비트는 0과 1의 상태를 동시에 가질 수 있다.",
      answer: true,
      explanation: "맞습니다! 큐비트는 중첩 상태를 통해 0과 1을 동시에 나타낼 수 있습니다."
    }
  }
};

// 기본 퀴즈 데이터 상수
export const DEFAULT_QUIZ = {
  question: "이 섹션의 내용을 잘 이해하셨나요?",
  answer: true,
  explanation: "계속해서 학습을 진행해보세요!"
};

// QuizComponent 인터페이스
export interface QuizComponentProps {
  selectedChapter: number;
  currentSectionIndex: number;
  currentQuizData: { question: string; answer: boolean; explanation: string };
  currentChapterData: { title: string; details: string[] };
  onQuizComplete: () => void;
  onNextSection: () => void;
}

// QuizComponent (Hooks 오류 해결)
export const QuizComponent: React.FC<QuizComponentProps> = ({ 
  selectedChapter, 
  currentSectionIndex, 
  currentQuizData, 
  currentChapterData,
  onQuizComplete, 
  onNextSection 
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [localQuizCompleted, setLocalQuizCompleted] = useState(false);

  // 새로운 섹션으로 이동시 퀴즈 상태 초기화
  useEffect(() => {
    setSelectedAnswer(null);
    setIsSubmitted(false);
    setShowResult(false);
    setLocalQuizCompleted(false);
  }, [selectedChapter, currentSectionIndex]);

  const handleSubmit = useCallback(() => {
    if (selectedAnswer !== null) {
      setIsSubmitted(true);
      setShowResult(true);
      setLocalQuizCompleted(true);
      onQuizComplete();
    }
  }, [selectedAnswer, onQuizComplete]);

  const isCorrect = selectedAnswer === currentQuizData.answer;

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <h3>📝 퀴즈</h3>
        <div className="quiz-progress">
          {currentChapterData.title} - {currentChapterData.details[currentSectionIndex]}
        </div>
      </div>
      
      <div className="quiz-question">
        <p>{currentQuizData.question}</p>
      </div>
      
      <div className="quiz-options">
        <button 
          className={`quiz-option ${selectedAnswer === true ? 'selected' : ''} ${isSubmitted && currentQuizData.answer === true ? 'correct' : ''} ${isSubmitted && selectedAnswer === true && !isCorrect ? 'incorrect' : ''}`}
          onClick={() => !isSubmitted && setSelectedAnswer(true)}
          disabled={isSubmitted}
        >
          ⭕ O (맞다)
        </button>
        <button 
          className={`quiz-option ${selectedAnswer === false ? 'selected' : ''} ${isSubmitted && currentQuizData.answer === false ? 'correct' : ''} ${isSubmitted && selectedAnswer === false && !isCorrect ? 'incorrect' : ''}`}
          onClick={() => !isSubmitted && setSelectedAnswer(false)}
          disabled={isSubmitted}
        >
          ❌ X (틀리다)
        </button>
      </div>

      {showResult && (
        <div className="quiz-result">
          <div className="result-header">
            <span className="result-icon">
              {isCorrect ? '🎉' : '❌'}
            </span>
            <span className="result-text">
              {isCorrect ? '정답입니다!' : '오답입니다.'}
            </span>
          </div>
          <div className="result-explanation">{currentQuizData.explanation}</div>
        </div>
      )}

      <div className="quiz-submit">
        {!localQuizCompleted ? (
          <button 
            className="submit-btn"
            onClick={handleSubmit}
            disabled={selectedAnswer === null || isSubmitted}
          >
            {isSubmitted ? '채점 완료' : '정답 제출'}
          </button>
        ) : (
          <button 
            className="next-section-btn"
            onClick={onNextSection}
          >
            다음 소단원 
          </button>
        )}
      </div>
    </div>
  );
};

// 퀴즈 데이터 가져오기 유틸리티 함수
export const getQuizData = (selectedChapter: number, currentSectionIndex: number) => {
  return QUIZ_DATA[selectedChapter]?.[currentSectionIndex] || DEFAULT_QUIZ;
};
