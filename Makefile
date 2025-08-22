# Makefile for Superposition Project
.PHONY: help up down logs clean restart backend-logs frontend-logs test build prod

# 기본 명령어
help: ## 사용 가능한 명령어 목록 표시
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

# 개발 환경
up: ## 개발 환경 시작 (Hot Reload 포함)
	docker compose -f docker-compose.dev.yml up --build -d

down: ## 개발 환경 중지
	docker compose -f docker-compose.dev.yml down

restart: ## 서비스 재시작
	docker compose -f docker-compose.dev.yml restart

logs: ## 전체 로그 확인
	docker compose -f docker-compose.dev.yml logs -f

backend-logs: ## 백엔드 로그만 확인
	docker compose -f docker-compose.dev.yml logs -f backend

frontend-logs: ## 프론트엔드 로그만 확인
	docker compose -f docker-compose.dev.yml logs -f frontend

# 프로덕션 환경
prod: ## 프로덕션 환경 실행
	docker compose up --build -d

prod-down: ## 프로덕션 환경 중지
	docker compose down

# 개발 관련 명령어
test: ## Go 테스트 실행
	docker compose -f docker-compose.dev.yml exec backend go test ./...

backend-shell: ## 백엔드 컨테이너 쉘 접속
	docker compose -f docker-compose.dev.yml exec backend sh

frontend-shell: ## 프론트엔드 컨테이너 쉘 접속
	docker compose -f docker-compose.dev.yml exec frontend sh

# 빌드 관련
build: ## 개발용 이미지 빌드
	docker compose -f docker-compose.dev.yml build

build-prod: ## 프로덕션 이미지 빌드 (빌드 정보 포함)
	docker build \
		--build-arg BUILD_TIME=$$(date -u +"%Y-%m-%dT%H:%M:%SZ") \
		--build-arg GIT_HASH=$$(git rev-parse --short HEAD 2>/dev/null || echo "unknown") \
		--target runtime \
		-t superposition-backend:latest \
		./backend

build-no-cache: ## 캐시 없이 이미지 빌드
	docker compose -f docker-compose.dev.yml build --no-cache

# 상태 확인
status: ## 컨테이너 상태 확인
	docker compose -f docker-compose.dev.yml ps

health: ## 서비스 헬스 체크
	@echo "=== Backend Health Check ==="
	@curl -s http://localhost:8080/healthz | jq . || echo "Backend healthz failed"
	@curl -s http://localhost:8080/version | jq . || echo "Backend version failed"
	@echo "\n=== Frontend Health Check ==="
	@curl -s http://localhost:3000 > /dev/null && echo "Frontend OK" || echo "Frontend not responding"

# 정리
clean: ## 컨테이너, 이미지, 볼륨 정리
	docker compose -f docker-compose.dev.yml down -v
	docker system prune -f

clean-all: ## 모든 Docker 리소스 정리 (주의!)
	docker compose -f docker-compose.dev.yml down -v
	docker system prune -af --volumes

# 환경 설정
init: ## 초기 환경 설정 (.env 파일 생성)
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo ".env 파일이 생성되었습니다. 필요한 값들을 수정해주세요."; \
	else \
		echo ".env 파일이 이미 존재합니다."; \
	fi
