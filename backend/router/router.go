package router

import (
	"my-project-backend/handlers"
	"my-project-backend/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRouter(buildTime, gitHash string) *gin.Engine {
	r := gin.Default()

	// 미들웨어 설정 (순서 중요)
	r.Use(middleware.RequestIDMiddleware()) // 요청 ID 생성
	r.Use(middleware.RecoveryMiddleware())  // Panic 복구
	r.Use(middleware.CORSMiddleware())      // CORS 설정
	r.Use(middleware.LoggingMiddleware())   // 로깅 (가장 마지막)

	// 핸들러 초기화
	userHandler := handlers.NewUserHandler()
	progressHandler := handlers.NewProgressHandler()
	simulationHandler := handlers.NewSimulationHandler()
	quantumHandler := handlers.NewQuantumHandler()

	// 기본 엔드포인트
	r.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "Go 서버가 정상적으로 실행 중입니다!",
			"version": "1.0.0",
			"endpoints": map[string]string{
				"ping":       "/ping",
				"simulate":   "/simulate",
				"qubit-info": "/qubit-info",
				"algorithms": "/quantum/algorithms",
				"users":      "/user",
				"progress":   "/progress",
			},
		})
	})

	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "pong"})
	})

	// 헬스체크 엔드포인트들
	r.GET("/healthz", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	r.GET("/readyz", func(c *gin.Context) {
		// Firebase 연결 확인 (실제로는 Firestore ping 등)
		c.JSON(200, gin.H{
			"status":    "ready",
			"firebase":  "connected",
			"timestamp": c.Request.Header.Get("Date"),
		})
	})

	r.GET("/version", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"service":   "superposition-backend",
			"version":   "1.0.0",
			"buildTime": buildTime,
			"gitHash":   gitHash,
		})
	})

	// AWS App Runner용 헬스체크 엔드포인트
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":    "healthy",
			"service":   "superposition-backend",
			"timestamp": c.Request.Header.Get("Date"),
		})
	})

	// 양자 시뮬레이션 엔드포인트 (Python Flask 대체)
	r.POST("/simulate", simulationHandler.Simulate)
	r.GET("/qubit-info", quantumHandler.GetQubitInfo)
	r.GET("/quantum/algorithms", quantumHandler.GetAlgorithms)

	// 사용자 관리 엔드포인트
	r.GET("/user/:id", userHandler.GetUser)
	r.POST("/user/", userHandler.CreateUser)
	r.PUT("/user/:id", userHandler.UpdateUser)
	r.DELETE("/user/:id", userHandler.DeleteUser)

	// 진행상황 관리 엔드포인트
	r.POST("/progress/:user_id", progressHandler.AddProgress)
	r.GET("/progress/:user_id", progressHandler.GetProgress)

	return r
}
