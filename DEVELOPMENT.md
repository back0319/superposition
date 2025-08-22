# Superposition 프로젝트 개발 환경 가이드

## 🚀 빠른 시작 (팀원용)

### 1. 필수 요구사항
- **Docker Desktop** (Windows/Mac/Linux)
- **VS Code** + Dev Containers 확장
- **Git**

### 2. 프로젝트 클론 및 실행
```bash
# 1. 저장소 클론
git clone <repository-url>
cd superposition

# 2. 환경 변수 설정
copy .env.example .env
# .env 파일을 열어서 필요한 값들을 설정하세요

# 3. Docker로 실행
make up
# 또는: docker compose -f docker-compose.dev.yml up --build -d
```

### 3. 서비스 접속
- **프론트엔드**: http://localhost:3000
- **백엔드 API**: http://localhost:8080
- **헬스체크**: http://localhost:8080/health

---

## 🛠 개발 환경 옵션

### 옵션 A: Dev Container (추천)
1. VS Code에서 프로젝트 폴더 열기
2. "Reopen in Container" 팝업 클릭 (또는 F1 → "Dev Containers: Reopen in Container")
3. 자동으로 Go + Node.js 개발 환경이 설정됩니다

### 옵션 B: 로컬 Docker
```bash
make up      # 서비스 시작
make logs    # 로그 확인
make down    # 서비스 중지
make clean   # 컨테이너/이미지 정리
```

---

## 📂 프로젝트 구조

```
superposition/
├── .devcontainer/          # VS Code Dev Container 설정
├── backend/                # Go + Gin 백엔드
│   ├── main.go
│   ├── handlers/          # API 핸들러
│   ├── models/            # 데이터 모델
│   └── config/            # Firebase 설정
├── frontend/              # React 프론트엔드
├── docker-compose.dev.yml # 개발용 Docker 구성
└── Makefile              # 개발 명령어 모음
```

---

## 🔧 개발 워크플로우

### 백엔드 개발 (Go)
```bash
# 백엔드 컨테이너에 접속
make backend-shell

# 테스트 실행
make test

# 로그 확인
make backend-logs
```

### 프론트엔드 개발 (React)
```bash
# 프론트엔드 컨테이너에 접속
make frontend-shell

# 로그 확인
make frontend-logs
```

### 코드 변경사항 반영
- **백엔드**: 파일 저장 시 자동으로 `go run main.go` 재실행
- **프론트엔드**: Hot Reload로 즉시 반영

---

## 🐛 문제 해결

### 포트 충돌
```bash
# 실행 중인 Docker 프로세스 확인
docker ps

# 포트 사용 중인 프로세스 확인 (Windows)
netstat -ano | findstr :8080
netstat -ano | findstr :3000
```

### 컨테이너 재시작
```bash
make restart
# 또는: docker compose -f docker-compose.dev.yml restart
```

### 완전 초기화
```bash
make clean
make up
```

---

## 📡 API 엔드포인트

### 기본
- `GET /` - 서버 상태 및 엔드포인트 목록
- `GET /health` - 헬스체크 (AWS App Runner용)
- `GET /ping` - 간단한 헬스체크

### 양자 시뮬레이션
- `POST /simulate` - 양자 회로 시뮬레이션
- `GET /qubit-info` - 큐빗 정보
- `GET /quantum/algorithms` - 양자 알고리즘 정보

### 사용자 관리
- `GET /user/:id` - 사용자 정보 조회
- `POST /user/` - 사용자 생성
- `PUT /user/:id` - 사용자 정보 수정
- `DELETE /user/:id` - 사용자 삭제

### 진행상황
- `POST /progress/:user_id` - 진행상황 추가
- `GET /progress/:user_id` - 진행상황 조회

---

## 🚀 배포 가이드

### AWS App Runner 배포
1. ECR에 이미지 푸시
2. App Runner 서비스 생성
3. 헬스체크 경로: `/health`

### 환경 변수 (프로덕션)
- AWS Systems Manager Parameter Store 사용 권장
- Firebase 서비스 계정 키는 AWS Secrets Manager에 저장

---

## 💡 팁

1. **make help** - 사용 가능한 명령어 목록 확인
2. **Dev Container 사용** - 팀원 간 동일한 개발 환경 보장
3. **로그 모니터링** - `make logs`로 실시간 로그 확인
4. **.env 파일** - 민감한 정보는 절대 커밋하지 말 것

---

## 🤝 기여 가이드

1. 새 브랜치 생성: `git checkout -b feature/new-feature`
2. 코드 작성 및 테스트
3. 커밋: `git commit -m "Add new feature"`
4. 푸시: `git push origin feature/new-feature`
5. Pull Request 생성
