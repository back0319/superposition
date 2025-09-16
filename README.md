# 🚀 Superposition - Quantum Computing Visualization

Superposition은 양자 컴퓨팅의 기본 개념을 시각적으로 학습할 수 있는 웹 애플리케이션입니다. React 기반 프론트엔드와 Go 기반 백엔드로 구성되어 있으며, Docker를 통해 쉽게 배포할 수 있습니다.

## ✨ 주요 기능

- 🎯 **양자 상태 시뮬레이션**: Bloch Sphere를 통한 양자 상태 시각화
- 📚 **인터랙티브 학습**: 단계별 양자 컴퓨팅 개념 학습
- 🔬 **실시간 계산**: 양자 게이트 연산 및 상태 변화 시뮬레이션
- 📱 **반응형 디자인**: 데스크톱 및 모바일 환경 지원

## 🏗️ 아키텍처

```
Frontend (React) ← → Backend (Go/Gin) ← → Firebase (인증)
     ↓                    ↓
   Port 80              Port 8080
```

## 🚀 빠른 시작

### 로컬 개발 환경

```bash
# 프로젝트 클론
git clone https://github.com/back0319/superposition.git
cd superposition

# Docker로 실행
docker-compose up --build -d

# 접속
# Frontend: http://localhost
# Backend:  http://localhost:8080
```

### EC2 배포 (1분 설치)

```bash
curl -fsSL https://raw.githubusercontent.com/back0319/superposition/main/install-ec2.sh | bash
```

## 📚 문서

| 문서 | 설명 |
|------|------|
| [QUICK_START.md](QUICK_START.md) | 빠른 시작 가이드 |
| [EC2_DEPLOYMENT_GUIDE.md](EC2_DEPLOYMENT_GUIDE.md) | 상세 EC2 배포 가이드 |
| [TROUBLESHOOTING.md](TROUBLESHOOTING.md) | 문제 해결 가이드 |
├── backend/           # Go + Gin 백엔드 서버
├── frontend/          # React + TypeScript 프론트엔드
├── backend_flask_backup/  # 기존 Python Flask 백엔드 (백업)
├── docker-compose.yml     # 프로덕션 환경 설정
└── docker-compose.dev.yml # 개발 환경 설정
```

## 🚀 현재 개발 상태

### ✅ 백엔드 (Go + Gin) - **완료**

**기술 스택:**
- Go 1.23
- Gin Web Framework
- Firebase/Firestore
- Docker

**구현된 기능:**
- ✅ 기본 서버 설정 및 라우팅
- ✅ Firebase 연동 (사용자 인증 및 데이터베이스)
- ✅ CORS 미들웨어
- ✅ 로깅 미들웨어 (요청/응답 로그)
- ✅ 양자 시뮬레이션 API
- ✅ 큐비트 정보 API
- ✅ 양자 알고리즘 정보 API
- ✅ 사용자 관리 API (CRUD)
- ✅ 진행상황 관리 API

**API 엔드포인트:**
```
GET  /                    - 서버 상태 및 엔드포인트 목록
GET  /ping                - 헬스 체크
POST /simulate            - 양자 시뮬레이션 실행
GET  /qubit-info          - 큐비트 및 양자 게이트 정보
GET  /quantum/algorithms  - 양자 알고리즘 정보
GET  /user/:id           - 사용자 조회
POST /user/              - 사용자 생성
PUT  /user/:id           - 사용자 수정
DELETE /user/:id         - 사용자 삭제
POST /progress/:user_id  - 진행상황 추가
GET  /progress/:user_id  - 진행상황 조회
```

**백엔드 서버 상태:** 🟢 **정상 실행 중**
- 포트: 8080
- Firebase 연동 완료
- 모든 API 엔드포인트 활성화

### ⏳ 프론트엔드 (React + TypeScript) - **개발 중**

**기술 스택:**
- React 19.1.0
- TypeScript 4.9.5
- React Router 7.5.3
- Sass 1.87.0
- React Scripts 5.0.1

**현재 상태:**
- ✅ 기본 React 앱 구조 설정
- ✅ TypeScript 설정
- ✅ 라우팅 구조 (`Approutes.tsx`)
- ✅ 컴포넌트 구조 (`Home.tsx`, `slide/` 폴더)
- ✅ 스타일링 구조 (Sass)
- ⏳ 개발 서버 시작 중

**폴더 구조:**
```
frontend/src/
├── App.tsx              - 메인 앱 컴포넌트
├── Approutes.tsx        - 라우팅 설정
├── Home.tsx             - 홈 페이지
├── index.tsx            - 엔트리 포인트
├── component/           - 공통 컴포넌트
│   ├── button.scss
│   ├── slide.scss
│   └── layout/
└── slide/               - 슬라이드 관련 컴포넌트
    ├── content.tsx
    ├── slide.tsx
    └── quantum/
        ├── qubit.tsx
        └── qubit1.tsx
```

**프론트엔드 서버 상태:** 🟡 **시작 중**
- 포트: 3000 (예정)
- React 개발 서버 부팅 중

## 🐳 Docker 환경

### 개발 환경 실행
```bash
# 개발 환경 시작
docker-compose -f docker-compose.dev.yml up --build

# 백그라운드 실행
docker-compose -f docker-compose.dev.yml up --build -d

# 환경 정리
docker-compose -f docker-compose.dev.yml down
```

### 프로덕션 환경 실행
```bash
# 프로덕션 환경 시작
docker-compose up --build
```

## 📊 양자 시뮬레이션 기능

### 시뮬레이션 API 예제
```bash
# 양자 시뮬레이션 실행
curl -X POST http://localhost:8080/simulate \
  -H "Content-Type: application/json" \
  -d '{
    "qubits": 2,
    "gates": [
      {"type": "H", "qubit": 0},
      {"type": "CNOT", "control": 0, "target": 1}
    ],
    "shots": 1000
  }'
```

### 큐비트 정보 조회
```bash
# 큐비트 및 양자 게이트 정보
curl http://localhost:8080/qubit-info

# 양자 알고리즘 정보
curl http://localhost:8080/quantum/algorithms
```

## 🔧 개발 환경 설정

### 사전 요구사항
- Docker Desktop
- Git

### 로컬 개발 시작하기
1. **저장소 클론**
   ```bash
   git clone https://github.com/back0319/superposition.git
   cd superposition
   ```

2. **개발 환경 시작**
   ```bash
   docker-compose -f docker-compose.dev.yml up --build
   ```

3. **접속 확인**
   - 백엔드: http://localhost:8080
   - 프론트엔드: http://localhost:3000 (준비 완료 시)

### Firebase 설정
프로젝트는 Firebase를 사용하여 인증 및 데이터베이스 기능을 제공합니다.
- Firebase 프로젝트: `quantumbe-21866`
- 서비스 계정 키: `backend/config/quantumbe-21866-firebase-adminsdk-fbsvc-ae3a530754.json`

## 📝 개발 로그

### 최근 완료 사항 (2025-08-16)
- ✅ Python Flask 백엔드를 Go Gin으로 완전 이전
- ✅ 양자 시뮬레이션 API 구현
- ✅ Docker 개발 환경 구성 완료
- ✅ 로깅 미들웨어 추가
- ✅ CORS 설정 완료
- ✅ Firebase 연동 완료

### 다음 단계
- [ ] 프론트엔드 React 앱 완성
- [ ] 백엔드-프론트엔드 API 연동
- [ ] 양자 시뮬레이션 UI 구현
- [ ] 사용자 인증 기능 구현
- [ ] 학습 진행상황 추적 기능
- [ ] 실제 양자 시뮬레이터 라이브러리 통합

## 🧪 테스트

### 백엔드 API 테스트
```bash
# 서버 상태 확인
curl http://localhost:8080/

# 헬스 체크
curl http://localhost:8080/ping

# 양자 시뮬레이션 테스트
curl -X POST http://localhost:8080/simulate \
  -H "Content-Type: application/json" \
  -d '{"qubits":1,"gates":[{"type":"H","qubit":0}],"shots":100}'
```

## 📚 참고 자료

- [Gin Web Framework](https://gin-gonic.com/)
- [React Documentation](https://react.dev/)
- [Firebase Go SDK](https://firebase.google.com/docs/admin/setup)
- [Docker Compose](https://docs.docker.com/compose/)

## 👥 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

---

**현재 브랜치:** `refactor/go-backend-dockerize`  
**마지막 업데이트:** 2025년 8월 16일
