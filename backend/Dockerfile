#############################
# 멀티스테이지 빌드 (Production)
#############################

# 1) Build Stage
FROM golang:1.23 AS builder
WORKDIR /src

# 모듈 캐시 활용
COPY go.mod go.sum ./
RUN go mod download

COPY . .
ENV CGO_ENABLED=0

# 빌드 시 버전 정보 주입
ARG BUILD_TIME
ARG GIT_HASH
RUN go mod tidy && \
	go build -trimpath \
	-ldflags="-s -w -X main.BuildTime=${BUILD_TIME:-unknown} -X main.GitHash=${GIT_HASH:-unknown}" \
	-o /out/main ./main.go

# 2) Runtime Stage (Alpine 기반 경량 이미지)
FROM alpine:3.19 AS runtime
WORKDIR /app

# CA 인증서 (Firestore 등 TLS 통신 필요)
RUN apk add --no-cache ca-certificates tzdata && adduser -D -u 10001 appuser

## 서비스 계정 키 포함 (주의: 프로덕션에서는 시크릿 관리 솔루션 사용 권장)
COPY config/quantumbe-21866-firebase-adminsdk-fbsvc-ae3a530754.json /app/config/quantumbe-21866-firebase-adminsdk-fbsvc-ae3a530754.json
ENV GOOGLE_APPLICATION_CREDENTIALS=/app/config/quantumbe-21866-firebase-adminsdk-fbsvc-ae3a530754.json

COPY --from=builder /out/main /app/main

EXPOSE 8080
USER appuser

# 실행 파일 직접 실행
ENTRYPOINT ["/app/main"]

# 개발용 스테이지 (소스 코드 직접 실행)
FROM golang:1.23 AS development
WORKDIR /app
EXPOSE 8080
CMD ["go", "run", "main.go"]

# 개발용(소스 마운트) 사용 시 compose.dev.yml 에서 command: go run main.go 로 재정의
