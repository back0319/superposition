# AWS 배포 가이드 - Superposition 프로젝트

## 📋 AWS 계정 설정 및 준비사항

### 1. AWS 루트 계정 보안 설정
1. **루트 계정 MFA 활성화**
   - AWS 콘솔 로그인 → 우상단 계정명 → Security credentials
   - MFA 디바이스 할당 (Google Authenticator, Authy 등 사용)

2. **결제 수단 등록**
   - Billing & Cost Management → Payment methods
   - 신용카드/직불카드 등록

3. **예산 및 알림 설정**
   - Billing & Cost Management → Budgets
   - 월 예산 $20-50 설정, 80%/100% 초과 시 이메일 알림
   - Cost Anomaly Detection 활성화

### 2. IAM 관리자 사용자 생성
```bash
# 1. IAM 콘솔에서 새 사용자 생성
# 2. 권한: AdministratorAccess 정책 연결
# 3. 액세스 키 생성 (GitHub Actions용)
# 4. 콘솔 비밀번호 설정 (개발자용)
```

### 3. 리전 설정
- **ap-northeast-2 (서울)** 기준으로 모든 리소스 생성

---

## 🐳 ECR 설정 및 이미지 업로드

### 1. ECR 리포지토리 생성
```bash
# AWS CLI 설치 및 인증 설정
aws configure
# AWS Access Key ID: [발급받은 키]
# AWS Secret Access Key: [발급받은 시크릿]
# Default region: ap-northeast-2
# Default output format: json

# ECR 리포지토리 생성
aws ecr create-repository \
    --repository-name superposition-backend \
    --region ap-northeast-2

aws ecr create-repository \
    --repository-name superposition-frontend \
    --region ap-northeast-2
```

### 2. 로컬에서 ECR에 이미지 푸시
```bash
# ECR 로그인
aws ecr get-login-password --region ap-northeast-2 | docker login --username AWS --password-stdin <your-account-id>.dkr.ecr.ap-northeast-2.amazonaws.com

# 이미지 빌드 및 태그
docker build -t superposition-backend ./backend
docker tag superposition-backend:latest <your-account-id>.dkr.ecr.ap-northeast-2.amazonaws.com/superposition-backend:latest

# 이미지 푸시
docker push <your-account-id>.dkr.ecr.ap-northeast-2.amazonaws.com/superposition-backend:latest
```

---

## 🚀 App Runner 설정

### 1. App Runner 서비스 생성
1. **AWS 콘솔** → App Runner → Create service

2. **소스 설정**
   - Source: Container registry
   - Provider: Amazon ECR
   - Container image URI: `<account-id>.dkr.ecr.ap-northeast-2.amazonaws.com/superposition-backend:latest`
   - Deployment trigger: Automatic (ECR에 새 이미지 푸시 시 자동 배포)

3. **배포 설정**
   - Service name: `superposition-backend`
   - Port: `8080`
   - **Start command**: (비워두기 - Dockerfile의 ENTRYPOINT 사용)

4. **환경 변수**
   ```
   GOOGLE_APPLICATION_CREDENTIALS=/app/config/quantumbe-21866-firebase-adminsdk-fbsvc-ae3a530754.json
   GIN_MODE=release
   PORT=8080
   ```

5. **헬스체크**
   - Health check path: `/health`
   - Health check interval: 20초
   - Health check timeout: 5초
   - Healthy threshold: 2
   - Unhealthy threshold: 5

6. **Auto scaling**
   - Min size: 1
   - Max size: 10
   - Max concurrency: 100

### 2. App Runner 역할 권한 설정
```bash
# App Runner가 ECR에서 이미지를 가져올 수 있도록 서비스 역할 설정
# (App Runner 콘솔에서 자동으로 생성되지만, 수동으로도 설정 가능)
```

---

## 🔧 GitHub Actions CI/CD 설정

### 1. GitHub Secrets 설정
GitHub 리포지토리 → Settings → Secrets and variables → Actions

다음 시크릿 추가:
```
AWS_ACCESS_KEY_ID: [IAM 사용자의 액세스 키]
AWS_SECRET_ACCESS_KEY: [IAM 사용자의 시크릿 키]
APP_RUNNER_SERVICE_ARN: [App Runner 서비스 ARN - 선택사항]
```

### 2. 워크플로우 확인
- `.github/workflows/deploy.yml` 파일이 올바르게 설정되었는지 확인
- main 브랜치에 푸시하면 자동으로 테스트 → 빌드 → 배포 실행

---

## 🌐 프론트엔드 배포 (선택사항)

### 옵션 A: S3 + CloudFront (정적 사이트)
```bash
# S3 버킷 생성
aws s3 mb s3://superposition-frontend --region ap-northeast-2

# React 빌드 및 업로드
cd frontend
npm run build
aws s3 sync build/ s3://superposition-frontend --delete

# CloudFront 배포 생성 (콘솔에서 설정)
```

### 옵션 B: Amplify Hosting
1. AWS Amplify 콘솔 → New app → Host web app
2. GitHub 연결 → 리포지토리 선택
3. 빌드 설정 자동 감지
4. 배포 완료

---

## 💰 비용 관리

### 예상 월 비용 (소규모 트래픽 기준)
- **App Runner**: $5-30 (CPU/메모리/요청 수에 따라)
- **ECR**: $1-5 (이미지 저장 용량)
- **CloudWatch Logs**: $1-3 (로그 저장)
- **S3 + CloudFront**: $1-5 (프론트엔드 호스팅)

**총 예상 비용**: $8-50/월

### 비용 절약 팁
1. **App Runner**: 트래픽이 없을 때 자동으로 스케일 다운
2. **CloudWatch 로그**: 보존 기간을 7-14일로 설정
3. **개발 환경**: 사용하지 않을 때 App Runner 서비스 일시 중지
4. **태그 기반 비용 추적**: 모든 리소스에 `Project=Superposition` 태그 추가

---

## 🔍 모니터링 및 로그 확인

### CloudWatch 로그 그룹
- App Runner가 자동으로 생성하는 로그 그룹 확인
- 로그 보존 기간 설정 (비용 절약)

### 헬스체크 모니터링
```bash
# 배포된 API 헬스체크
curl https://your-app-runner-url.ap-northeast-2.awsapprunner.com/health

# 응답 예시:
# {"status":"healthy","service":"superposition-backend","timestamp":"..."}
```

### App Runner 대시보드
- 요청 수, 응답 시간, 오류율 등 모니터링
- 오토스케일링 상태 확인

---

## 🚨 문제해결

### 배포 실패 시
1. **CloudWatch 로그 확인**: App Runner 서비스 로그 탭
2. **헬스체크 실패**: `/health` 엔드포인트 응답 확인
3. **환경 변수**: Firebase 설정 파일 경로 확인
4. **포트 설정**: 8080 포트가 올바르게 노출되는지 확인

### ECR 푸시 실패 시
```bash
# ECR 로그인 다시 시도
aws ecr get-login-password --region ap-northeast-2 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.ap-northeast-2.amazonaws.com

# IAM 권한 확인
aws sts get-caller-identity
```

---

## 📚 추가 개선사항

### 보안 강화
- **AWS Secrets Manager**: Firebase 서비스 계정 키 저장
- **Parameter Store**: 환경별 설정 값 관리
- **WAF**: API 보호 (필요 시)

### 성능 최적화
- **Redis/ElastiCache**: 세션/캐시 저장소
- **RDS**: PostgreSQL 데이터베이스 (현재 Firestore 사용 중)
- **CDN**: API 캐싱을 위한 CloudFront

### 모니터링 고도화
- **X-Ray**: 분산 추적
- **CloudWatch Insights**: 로그 분석
- **SNS 알림**: 오류 발생 시 즉시 알림

---

## ✅ 배포 체크리스트

- [ ] AWS 계정 MFA 설정
- [ ] IAM 사용자 생성 및 키 발급
- [ ] 예산 알림 설정
- [ ] ECR 리포지토리 생성
- [ ] Docker 이미지 빌드 및 푸시
- [ ] App Runner 서비스 생성
- [ ] 헬스체크 경로 설정 (`/health`)
- [ ] GitHub Secrets 설정
- [ ] CI/CD 파이프라인 테스트
- [ ] 도메인 연결 (선택사항)
- [ ] 모니터링 대시보드 확인
