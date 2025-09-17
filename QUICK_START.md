# 🚀 Superposition EC2 배포 - 빠른 시작 가이드

## 📋 사전 준비사항

1. **EC2 인스턴스 생성**
   - 인스턴스 타입: `t3.medium` 이상 권장
   - 운영체제: Amazon Linux 2023
   - 스토리지: 20GB 이상

2. **보안 그룹 설정**
   ```
   인바운드 규칙:
   - SSH (22): 내 IP
   - HTTP (80): 0.0.0.0/0   ← Frontend (웹 서비스)
   - HTTP (8080): 0.0.0.0/0 ← Backend (API 서버)
   ```

## ⚡ 1분 설치 (자동)

EC2에 SSH 접속 후 다음 명령어 실행:

```bash
curl -fsSL https://raw.githubusercontent.com/back0319/superposition/main/install-ec2.sh | bash
```

## 🔧 수동 설치

### 1단계: 기본 설정
```bash
# 시스템 업데이트
sudo yum update -y

# Docker 설치
sudo yum install -y docker git
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -a -G docker $USER
```

### 2단계: Docker Compose 설치
```bash
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 3단계: 프로젝트 실행
```bash
# 권한 적용 (새 세션 시작)
newgrp docker

# 프로젝트 클론
git clone https://github.com/back0319/superposition.git
cd superposition

# 애플리케이션 실행
docker-compose up --build -d
```

## 🌐 접속 확인

설치 완료 후 브라우저에서 접속:

```
Frontend: http://YOUR_EC2_PUBLIC_IP      (포트 80 - 기본 HTTP)
Backend:  http://YOUR_EC2_PUBLIC_IP:8080 (API 서버)
```

### EC2 퍼블릭 IP 확인 방법
```bash
curl http://169.254.169.254/latest/meta-data/public-ipv4
```

## 🔍 상태 확인

```bash
# 컨테이너 상태 확인
docker-compose ps

# 실시간 로그 확인
docker-compose logs -f

# 개별 서비스 로그
docker-compose logs frontend
docker-compose logs backend
```

## 🛠️ 관리 명령어

```bash
# 애플리케이션 중지
docker-compose down

# 애플리케이션 재시작
docker-compose restart

# 코드 업데이트 후 재배포
git pull origin main
docker-compose down
docker-compose up --build -d

# 디스크 정리
docker system prune -a -f
```

## 🚨 문제 해결

### 접속이 안 되는 경우
1. **보안 그룹 확인**: 포트 80, 8080이 열려있는지 확인
2. **컨테이너 상태 확인**: `docker-compose ps`
3. **방화벽 확인**: `sudo iptables -L`

### Docker 권한 오류
```bash
# Docker 그룹에 사용자 추가 후 새 세션 시작
newgrp docker
```

### 빌드 실패
```bash
# 캐시 없이 재빌드
docker-compose build --no-cache
```

### 메모리 부족
```bash
# Swap 메모리 추가
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

## 📊 모니터링

```bash
# 시스템 리소스 확인
htop

# Docker 리소스 사용량
docker stats

# 디스크 사용량
df -h
```

---

## 🎯 체크리스트

설치 완료 후 다음을 확인하세요:

- [ ] EC2 보안 그룹에 포트 80, 8080 추가
- [ ] `docker-compose ps`로 두 컨테이너 모두 `Up` 상태 확인
- [ ] `http://EC2_IP`에서 Frontend 접속 확인 (포트 80)
- [ ] `http://EC2_IP:8080`에서 Backend 응답 확인

모든 체크리스트가 완료되면 Superposition 애플리케이션 사용 준비 완료! 🎉