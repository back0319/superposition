import axios from 'axios';

// API 기본 URL 설정
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

// Axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 (필요시 토큰 추가 등)
apiClient.interceptors.request.use(
  (config) => {
    // 여기에 인증 토큰 추가 로직을 넣을 수 있습니다
    console.log(`API 요청: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 (에러 핸들링)
apiClient.interceptors.response.use(
  (response) => {
    console.log(`API 응답: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(`API 에러: ${error.response?.status} ${error.config?.url}`, error);
    return Promise.reject(error);
  }
);

export default apiClient;
export { apiClient, API_BASE_URL };
