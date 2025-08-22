# Makefile for Superposition Project
.PHONY: help up down logs clean restart backend-logs frontend-logs test build

# 기본 명령어
help: ## 사용 가능한 명령어 목록 표시
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

up: ## 개발 환경 시작 (빌드 포함)
	docker compose -f docker-compose.dev.yml up --build -d

down: ## 개발 환경 중지
	docker compose -f docker-compose.dev.yml down

logs: ## 전체 로그 확인
	docker compose -f docker-compose.dev.yml logs -f

backend-logs: ## 백엔드 로그만 확인
	docker compose -f docker-compose.dev.yml logs -f backend

frontend-logs: ## 프론트엔드 로그만 확인
	docker compose -f docker-compose.dev.yml logs -f frontend

restart: ## 서비스 재시작
	docker compose -f docker-compose.dev.yml restart

clean: ## 컨테이너, 이미지, 볼륨 정리
	docker compose -f docker-compose.dev.yml down -v
	docker system prune -f

# 개발 관련 명령어
test: ## Go 테스트 실행
	docker compose -f docker-compose.dev.yml exec backend go test ./...

backend-shell: ## 백엔드 컨테이너 쉘 접속
	docker compose -f docker-compose.dev.yml exec backend sh

frontend-shell: ## 프론트엔드 컨테이너 쉘 접속
	docker compose -f docker-compose.dev.yml exec frontend sh

# 빌드 관련
build: ## 프로덕션 이미지 빌드
	docker compose build

build-no-cache: ## 캐시 없이 이미지 빌드
	docker compose build --no-cache

# 상태 확인
status: ## 컨테이너 상태 확인
	docker compose -f docker-compose.dev.yml ps

health: ## 서비스 헬스 체크
	@echo "=== Backend Health Check ==="
	@curl -s http://localhost:8080/health || echo "Backend not responding"
	@echo "\n=== Frontend Health Check ==="
	@curl -s http://localhost:3000 > /dev/null && echo "Frontend OK" || echo "Frontend not responding"
