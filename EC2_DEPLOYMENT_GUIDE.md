# EC2 서버 Superposition 애플리케이션 배포 가이드

## 📋 목차
1. [EC2 인스턴스 설정](#ec2-인스턴스-설정)
2. [Docker 설치](#docker-설치)
3. [보안 그룹 설정](#보안-그룹-설정)
4. [애플리케이션 배포](#애플리케이션-배포)
5. [트러블슈팅](#트러블슈팅)

## 🖥️ EC2 인스턴스 설정

### 권장 사양
- **인스턴스 타입**: t3.medium 이상 (2 vCPU, 4GB RAM)
- **스토리지**: 20GB 이상
- **운영체제**: Amazon Linux 2023 또는 Ubuntu 22.04

### 기본 설정
```bash
# 시스템 업데이트
sudo yum update -y  # Amazon Linux
# 또는
sudo apt update && sudo apt upgrade -y  # Ubuntu

# 필수 패키지 설치
sudo yum install -y git curl wget  # Amazon Linux
# 또는
sudo apt install -y git curl wget  # Ubuntu
```

## 🐳 Docker 설치

### Amazon Linux 2023
```bash
# Docker 설치
sudo yum install -y docker

# Docker 서비스 시작 및 부팅 시 자동 시작 설정
sudo systemctl start docker
sudo systemctl enable docker

# 현재 사용자를 docker 그룹에 추가
sudo usermod -a -G docker $USER

# 새 터미널 세션 시작 (또는 로그아웃 후 재로그인)
newgrp docker

# Docker Compose 설치
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 설치 확인
docker --version
docker-compose --version
```

### Ubuntu 22.04
```bash
# 이전 Docker 버전 제거
sudo apt remove -y docker docker-engine docker.io containerd runc

# Docker 공식 GPG 키 추가
sudo apt update
sudo apt install -y ca-certificates curl gnupg lsb-release
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Docker 저장소 추가
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Docker 설치
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Docker 서비스 시작
sudo systemctl start docker
sudo systemctl enable docker

# 사용자를 docker 그룹에 추가
sudo usermod -aG docker $USER
newgrp docker

# 설치 확인
docker --version
docker compose version
```

## 🔒 보안 그룹 설정

AWS EC2 인스턴스의 보안 그룹에서 다음 포트를 열어야 합니다:

### 인바운드 규칙 추가
1. **SSH 접속** (기본으로 설정되어 있음)
   - 포트: 22
   - 프로토콜: TCP
   - 소스: 내 IP (권장) 또는 0.0.0.0/0

2. **Frontend (React 애플리케이션)**
   - 포트: 80
   - 프로토콜: TCP
   - 소스: 0.0.0.0/0

3. **Backend (API 서버)**
   - 포트: 8080
   - 프로토콜: TCP
   - 소스: 0.0.0.0/0

### AWS 콘솔에서 보안 그룹 설정 방법
1. EC2 대시보드 → "인스턴스" → 해당 인스턴스 선택
2. "보안" 탭 → 보안 그룹 클릭
3. "인바운드 규칙" 탭 → "인바운드 규칙 편집" 버튼 클릭
4. "규칙 추가" 버튼으로 위의 포트들 추가

```
규칙 1: SSH
- 유형: SSH
- 프로토콜: TCP
- 포트 범위: 22
- 소스: 내 IP

규칙 2: Frontend
- 유형: HTTP
- 프로토콜: TCP
- 포트 범위: 80
- 소스: 0.0.0.0/0

규칙 3: Backend
- 유형: 사용자 지정 TCP
- 프로토콜: TCP
- 포트 범위: 8080
- 소스: 0.0.0.0/0
```

## 🚀 애플리케이션 배포

### 1. 소스 코드 다운로드
```bash
# GitHub에서 프로젝트 클론
git clone https://github.com/back0319/superposition.git
cd superposition

# 프로젝트 구조 확인
ls -la
```

### 2. Docker Compose 파일 수정
현재 docker-compose.yml을 외부 접속이 가능하도록 수정해야 합니다.

### 3. 애플리케이션 빌드 및 실행
```bash
# version 경고 제거 (선택사항)
sed -i '/^version:/d' docker-compose.yml

# Docker 이미지 빌드 및 컨테이너 실행
docker-compose up --build -d

# 실행 상태 확인
docker-compose ps
docker ps

# 로그 확인
docker-compose logs -f
```

### 4. 애플리케이션 접속
브라우저에서 다음 URL로 접속:
- **Frontend**: `http://YOUR_EC2_PUBLIC_IP` (포트 80 - 기본 HTTP)
- **Backend API**: `http://YOUR_EC2_PUBLIC_IP:8080`

### 5. 상태 확인 명령어
```bash
# 컨테이너 상태 확인
docker ps

# 특정 컨테이너 로그 확인
docker logs superposition-frontend-1
docker logs superposition-backend-1

# 리소스 사용량 확인
docker stats

# 컨테이너 내부 접속 (디버깅용)
docker exec -it superposition-frontend-1 sh
docker exec -it superposition-backend-1 sh
```

## 🔄 관리 명령어

### 애플리케이션 중지
```bash
docker-compose down
```

### 애플리케이션 재시작
```bash
docker-compose restart
```

### 코드 업데이트 후 재배포
```bash
# 최신 코드 가져오기
git pull origin main

# 컨테이너 중지 및 재빌드
docker-compose down
docker-compose up --build -d
```

### 디스크 공간 정리
```bash
# 사용하지 않는 Docker 리소스 정리
docker system prune -a -f

# 빌드 캐시 정리
docker builder prune -a -f
```

## 🔍 트러블슈팅

### 문제 1: 포트 접속 불가
**증상**: 브라우저에서 `http://EC2_IP` 또는 `http://EC2_IP:8080` 접속 안됨

**해결방법**:
1. 보안 그룹 설정 확인
2. 컨테이너 실행 상태 확인: `docker ps`
3. 포트 바인딩 확인: `docker port superposition-frontend-1`

### 문제 2: Docker 빌드 실패
**증상**: `docker-compose up --build` 실행 시 오류

**해결방법**:
```bash
# 디스크 공간 확인
df -h

# Docker 로그 확인
docker-compose logs

# 이미지 강제 재빌드
docker-compose build --no-cache
```

### 문제 3: 디스크 공간 부족
**증상**: "no space left on device" 오류

**해결방법**:
```bash
# Docker 정리
docker system prune -a -f
docker volume prune -f

# 시스템 정리
sudo rm -rf /tmp/*
sudo journalctl --vacuum-time=1d
```

### 문제 4: 메모리 부족
**증상**: 컨테이너가 자주 재시작됨

**해결방법**:
- 더 큰 인스턴스 타입으로 변경 (t3.medium → t3.large)
- swap 메모리 추가:
```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

## 📊 모니터링

### 실시간 상태 확인
```bash
# 컨테이너 상태 모니터링
watch docker ps

# 시스템 리소스 모니터링
htop  # 설치 필요: sudo yum install -y htop

# 로그 실시간 확인
docker-compose logs -f --tail=100
```

### 헬스체크 확인
```bash
# Frontend 헬스체크
curl http://localhost

# Backend 헬스체크 (health 엔드포인트가 있다면)
curl http://localhost:8080/health
```

---

## ⚡ 빠른 시작 요약

```bash
# 1. 시스템 업데이트 및 Docker 설치
sudo yum update -y
sudo yum install -y docker git
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -a -G docker $USER
newgrp docker

# 2. Docker Compose 설치
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 3. 프로젝트 클론 및 실행
git clone https://github.com/back0319/superposition.git
cd superposition
sed -i '/^version:/d' docker-compose.yml
docker-compose up --build -d

# 4. 상태 확인
docker ps
```

접속: `http://YOUR_EC2_PUBLIC_IP` (포트 80)

---

💡 **중요**: EC2 인스턴스의 퍼블릭 IP는 재부팅 시 변경될 수 있습니다. 고정 IP가 필요하다면 Elastic IP를 할당하세요.