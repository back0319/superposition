# 🔧 Superposition EC2 트러블슈팅 가이드

## 🚨 일반적인 문제 및 해결방법

### 1. 애플리케이션 접속 불가

#### 증상
- 브라우저에서 `http://EC2_IP` 또는 `http://EC2_IP:8080` 접속 실패
- "연결할 수 없음" 또는 "시간 초과" 오류

#### 해결방법

**1단계: 보안 그룹 확인**
```bash
# AWS 콘솔에서 확인하거나 CLI로 확인
aws ec2 describe-security-groups --group-ids YOUR_SECURITY_GROUP_ID
```

필요한 인바운드 규칙:
- SSH (22): 내 IP
- 포트 80: 0.0.0.0/0 (Frontend)
- 포트 8080: 0.0.0.0/0 (Backend)

**2단계: 컨테이너 상태 확인**
```bash
docker-compose ps

# 예상 출력:
# NAME                     IMAGE                    COMMAND       SERVICE   CREATED         STATUS                   PORTS
# superposition-backend-1   superposition-backend   "/app/main"   backend   2 minutes ago   Up 2 minutes (healthy)   0.0.0.0:8080->8080/tcp
# superposition-frontend-1  superposition-frontend  "docker-entry…" frontend 2 minutes ago Up 2 minutes (healthy)   0.0.0.0:4173->4173/tcp
```

**3단계: 포트 바인딩 확인**
```bash
# 포트가 실제로 바인딩되었는지 확인
netstat -tlnp | grep :80
netstat -tlnp | grep :8080

# 또는
ss -tlnp | grep :80
ss -tlnp | grep :8080
```

**4단계: 방화벽 확인**
```bash
# iptables 규칙 확인
sudo iptables -L -n

# firewalld 확인 (일부 Amazon Linux에서)
sudo systemctl status firewalld
```

### 2. Docker 빌드 실패

#### 증상
- `docker-compose up --build` 실행 시 오류
- "failed to solve" 또는 "no space left on device" 오류

#### 해결방법

**디스크 공간 부족인 경우:**
```bash
# 디스크 사용량 확인
df -h

# Docker 정리
docker system prune -a -f
docker volume prune -f
docker builder prune -a -f

# 시스템 임시 파일 정리
sudo rm -rf /tmp/*
sudo journalctl --vacuum-time=1d
```

**네트워크 문제인 경우:**
```bash
# DNS 확인
nslookup google.com

# Docker Hub 접속 확인
curl -I https://registry-1.docker.io/

# 프록시 설정이 필요한 경우
sudo mkdir -p /etc/systemd/system/docker.service.d
sudo tee /etc/systemd/system/docker.service.d/http-proxy.conf << EOF
[Service]
Environment="HTTP_PROXY=http://proxy.example.com:80"
Environment="HTTPS_PROXY=https://proxy.example.com:443"
EOF
sudo systemctl daemon-reload
sudo systemctl restart docker
```

**의존성 문제인 경우:**
```bash
# 캐시 없이 재빌드
docker-compose build --no-cache

# 개별 서비스 빌드
docker-compose build backend
docker-compose build frontend
```

### 3. 컨테이너가 자주 재시작됨

#### 증상
- `docker-compose ps`에서 "Restarting" 상태 반복
- 애플리케이션이 불안정하게 동작

#### 해결방법

**메모리 부족 확인:**
```bash
# 메모리 사용량 확인
free -h
htop

# Docker 컨테이너별 리소스 사용량
docker stats

# Swap 메모리 추가
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

**로그 확인:**
```bash
# 전체 로그 확인
docker-compose logs

# 특정 서비스 로그
docker-compose logs backend
docker-compose logs frontend

# 실시간 로그 모니터링
docker-compose logs -f --tail=100
```

### 4. Docker 권한 오류

#### 증상
- "permission denied while trying to connect to the Docker daemon socket"
- "docker: Got permission denied"

#### 해결방법
```bash
# 현재 사용자를 docker 그룹에 추가
sudo usermod -a -G docker $USER

# 새 그룹 권한 적용
newgrp docker

# 또는 로그아웃 후 재로그인

# Docker 소켓 권한 확인
ls -la /var/run/docker.sock

# 임시 해결책 (권장하지 않음)
sudo chmod 666 /var/run/docker.sock
```

### 5. 포트 충돌

#### 증상
- "port is already allocated" 오류
- "bind: address already in use" 오류

#### 해결방법
```bash
# 포트 사용 중인 프로세스 확인
sudo lsof -i :80
sudo lsof -i :8080

# 또는
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :8080

# Docker 컨테이너가 포트를 사용 중인 경우
docker ps -a
docker stop CONTAINER_ID
docker rm CONTAINER_ID

# 다른 포트로 실행하려면 docker-compose.yml 수정
# ports:
#   - "8080:4173"  # 외부 포트를 8080으로 변경
#   - "9080:8080"  # 외부 포트를 9080으로 변경
```

### 6. Git 클론 실패

#### 증상
- "fatal: could not read Username for 'https://github.com'"
- "Permission denied (publickey)"

#### 해결방법
```bash
# HTTPS로 클론 (권장)
git clone https://github.com/back0319/superposition.git

# Git 설정 확인
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# SSH 키 문제인 경우
ssh-keygen -t rsa -b 4096 -C "your.email@example.com"
cat ~/.ssh/id_rsa.pub  # GitHub에 추가
```

### 7. 네트워크 연결 문제

#### 증상
- 컨테이너 간 통신 실패
- API 호출 실패

#### 해결방법
```bash
# Docker 네트워크 확인
docker network ls
docker network inspect superposition_superposition-network

# 컨테이너 내부에서 네트워크 테스트
docker exec -it superposition-frontend-1 sh
# 컨테이너 내부에서:
# ping backend
# wget http://backend:8080

# DNS 해결 확인
docker exec -it superposition-frontend-1 nslookup backend

# 네트워크 재생성
docker-compose down
docker network prune
docker-compose up -d
```

### 8. 환경 변수 문제

#### 증상
- Firebase 인증 실패
- API 키 관련 오류

#### 해결방법
```bash
# 환경 변수 확인
docker exec -it superposition-backend-1 env | grep GOOGLE

# 파일 존재 확인
docker exec -it superposition-backend-1 ls -la /app/config/

# 권한 확인
docker exec -it superposition-backend-1 ls -la /app/config/quantumbe-21866-firebase-adminsdk-fbsvc-ae3a530754.json
```

## 🔍 진단 명령어 모음

### 시스템 상태 확인
```bash
# 전체 시스템 상태
docker-compose ps
docker system df
free -h
df -h

# 네트워크 상태
netstat -tlnp
ss -tlnp

# 프로세스 상태
ps aux | grep docker
systemctl status docker
```

### 로그 수집
```bash
# 모든 로그 파일로 저장
docker-compose logs > superposition_logs.txt

# 시스템 로그
sudo journalctl -u docker > docker_system_logs.txt

# 커널 로그
dmesg | grep -i docker > docker_kernel_logs.txt
```

### 성능 모니터링
```bash
# 실시간 리소스 모니터링
docker stats

# I/O 모니터링
iostat -x 1

# 네트워크 모니터링
iftop  # 설치 필요: sudo yum install -y iftop
```

## 🆘 긴급 복구 절차

### 완전 재설치
```bash
# 1. 모든 컨테이너 및 이미지 제거
docker-compose down -v
docker system prune -a -f
docker volume prune -f

# 2. 프로젝트 디렉토리 백업 및 재클론
cd ~
mv superposition superposition_backup_$(date +%Y%m%d_%H%M%S)
git clone https://github.com/back0319/superposition.git
cd superposition

# 3. 새로 빌드 및 실행
docker-compose up --build -d
```

### Docker 서비스 재시작
```bash
# Docker 데몬 재시작
sudo systemctl restart docker

# 잠시 후 컨테이너 재시작
sleep 10
docker-compose up -d
```

### 시스템 재부팅
```bash
# 모든 것이 실패한 경우 마지막 수단
sudo reboot

# 재부팅 후
cd superposition
docker-compose up -d
```

## 📞 추가 지원

문제가 계속 발생하는 경우:

1. **GitHub Issues**: https://github.com/back0319/superposition/issues
2. **로그 수집**: 위의 진단 명령어로 로그 수집 후 이슈 등록
3. **환경 정보**: 
   ```bash
   cat /etc/os-release
   docker --version
   docker-compose --version
   free -h
   df -h
   ```

이 정보들을 포함하여 이슈를 등록하면 더 빠른 지원을 받을 수 있습니다.