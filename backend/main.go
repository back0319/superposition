package main

import (
	"log"
	"my-project-backend/config"
	"my-project-backend/router"
)

func main() {
	log.Println("Starting Go backend server...")

	// Firebase 초기화
	log.Println("Initializing Firebase...")
	config.InitFirebase()

	// 라우터 설정
	log.Println("Setting up routes...")
	r := router.SetupRouter()

	// 서버 시작
	log.Println("Server starting on port 8080...")
	log.Println("Available endpoints:")
	log.Println("  GET  /              - Server status")
	log.Println("  GET  /ping          - Health check")
	log.Println("  POST /simulate      - Quantum simulation")
	log.Println("  GET  /qubit-info    - Qubit information")
	log.Println("  GET  /quantum/algorithms - Quantum algorithms info")
	log.Println("  [User & Progress endpoints also available]")

	if err := r.Run(":8080"); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
