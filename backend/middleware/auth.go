package middleware

import (
	"bytes"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
)

// LoggingMiddleware 요청/응답 로깅 미들웨어
func LoggingMiddleware() gin.HandlerFunc {
	// log.txt 파일 생성/열기
	logFile, err := os.OpenFile("log.txt", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
	if err != nil {
		log.Printf("Failed to open log file: %v", err)
	}

	return func(c *gin.Context) {
		start := time.Now()

		// 요청 바디 읽기
		var bodyBytes []byte
		if c.Request.Body != nil {
			bodyBytes, _ = io.ReadAll(c.Request.Body)
		}
		// 바디를 다시 설정 (다른 핸들러에서 사용할 수 있도록)
		c.Request.Body = io.NopCloser(bytes.NewBuffer(bodyBytes))

		// 요청 로그
		logMessage := fmt.Sprintf("[%s] Request: %s %s | Data: %s",
			start.Format("2006-01-02 15:04:05"),
			c.Request.Method,
			c.Request.URL.Path,
			string(bodyBytes))

		log.Print(logMessage)
		if logFile != nil {
			logFile.WriteString(logMessage + "\n")
		}

		c.Next()

		// 응답 로그
		duration := time.Since(start)
		statusCode := c.Writer.Status()

		responseLog := fmt.Sprintf("[%s] Response: %d | Duration: %v",
			time.Now().Format("2006-01-02 15:04:05"),
			statusCode,
			duration)

		log.Print(responseLog)
		if logFile != nil {
			logFile.WriteString(responseLog + "\n")
		}
	}
}

// AuthMiddleware 인증 미들웨어
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 토큰 검증 로직
		token := c.GetHeader("Authorization")

		if token == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Authorization header required",
			})
			c.Abort()
			return
		}

		// Firebase Auth 토큰 검증 로직이 여기에 추가됩니다

		c.Next()
	}
}

// CORSMiddleware CORS 설정 미들웨어
func CORSMiddleware() gin.HandlerFunc {
	return gin.HandlerFunc(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})
}
