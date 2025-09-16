#!/bin/bash

# Superposition 애플리케이션 EC2 자동 설치 스크립트
# Amazon Linux 2023용

set -e  # 오류 발생 시 스크립트 중단

echo "🚀 Superposition 애플리케이션 EC2 설치를 시작합니다..."

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 로그 함수
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 1. 시스템 업데이트
log_info "시스템 업데이트 중..."
sudo yum update -y
log_success "시스템 업데이트 완료"

# 2. 필수 패키지 설치
log_info "필수 패키지 설치 중..."
sudo yum install -y git curl wget docker htop
log_success "필수 패키지 설치 완료"

# 3. Docker 설정
log_info "Docker 서비스 설정 중..."
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -a -G docker $USER
log_success "Docker 서비스 설정 완료"

# 4. Docker Compose 설치
log_info "Docker Compose 설치 중..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
log_success "Docker Compose 설치 완료"

# 5. 프로젝트 클론
log_info "Superposition 프로젝트 클론 중..."
if [ -d "superposition" ]; then
    log_warning "기존 superposition 디렉토리가 존재합니다. 백업 후 새로 클론합니다."
    mv superposition superposition_backup_$(date +%Y%m%d_%H%M%S)
fi

git clone https://github.com/back0319/superposition.git
cd superposition
log_success "프로젝트 클론 완료"

# 6. Docker 그룹 권한 적용
log_info "Docker 그룹 권한 적용 중..."
newgrp docker << EONG
# 7. 애플리케이션 빌드 및 실행
log_info "애플리케이션 빌드 및 실행 중..."
docker-compose up --build -d

# 8. 설치 완료 확인
sleep 10
log_info "컨테이너 상태 확인 중..."
docker-compose ps

# 9. 결과 출력
echo ""
echo "=================================="
log_success "🎉 설치가 완료되었습니다!"
echo "=================================="
echo ""
echo "📍 접속 정보:"
echo "   Frontend: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)      (포트 80)"
echo "   Backend:  http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):8080"
echo ""
echo "🔧 관리 명령어:"
echo "   상태 확인:     docker-compose ps"
echo "   로그 확인:     docker-compose logs -f"
echo "   중지:         docker-compose down"
echo "   재시작:       docker-compose restart"
echo ""
echo "⚠️  주의사항:"
echo "   1. EC2 보안 그룹에서 포트 80, 8080을 열어주세요"
echo "   2. 새 터미널 세션에서는 'newgrp docker' 실행 필요"
echo ""
EONG

log_warning "Docker 그룹 권한이 적용되었습니다. 새 터미널을 열거나 'newgrp docker' 명령을 실행하세요."
echo ""
echo "🔄 다음 명령으로 애플리케이션을 시작할 수 있습니다:"
echo "   cd superposition"
echo "   newgrp docker"
echo "   docker-compose up --build -d"