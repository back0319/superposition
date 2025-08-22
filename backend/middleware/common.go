package middleware

import (
	"log"
	"time"

	"github.com/gin-gonic/gin"
)

// CORSMiddleware CORS 헤더 설정
func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")

		// 개발환경에서는 localhost 허용, 프로덕션에서는 특정 도메인만
		allowedOrigins := []string{
			"http://localhost:3000",
			"http://localhost:3001",
			"http://127.0.0.1:3000",
		}

		// 환경변수에서 추가 도메인 설정 가능
		// if prodOrigin := os.Getenv("ALLOWED_ORIGINS"); prodOrigin != "" {
		//     allowedOrigins = append(allowedOrigins, strings.Split(prodOrigin, ",")...)
		// }

		isAllowed := false
		for _, allowed := range allowedOrigins {
			if origin == allowed {
				isAllowed = true
				break
			}
		}

		if isAllowed {
			c.Header("Access-Control-Allow-Origin", origin)
		}

		c.Header("Access-Control-Allow-Credentials", "true")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Header("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}

// RecoveryMiddleware panic 복구 미들웨어
func RecoveryMiddleware() gin.HandlerFunc {
	return gin.CustomRecovery(func(c *gin.Context, recovered interface{}) {
		if err, ok := recovered.(string); ok {
			log.Printf("PANIC RECOVERED: %s", err)
		}
		c.JSON(500, gin.H{
			"error":   "Internal Server Error",
			"message": "서버에서 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
		})
	})
}

// RequestIDMiddleware 요청 ID 추가
func RequestIDMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		requestID := c.GetHeader("X-Request-ID")
		if requestID == "" {
			requestID = generateRequestID()
		}
		c.Header("X-Request-ID", requestID)
		c.Set("RequestID", requestID)
		c.Next()
	}
}

// 간단한 요청 ID 생성
func generateRequestID() string {
	return time.Now().Format("20060102150405") + "-" + randomString(6)
}

func randomString(length int) string {
	const charset = "abcdefghijklmnopqrstuvwxyz0123456789"
	b := make([]byte, length)
	for i := range b {
		b[i] = charset[time.Now().UnixNano()%int64(len(charset))]
	}
	return string(b)
}
