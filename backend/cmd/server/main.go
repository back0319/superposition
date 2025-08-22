package main

import (
	"log"
	"net/http"
	"os"

	"my-project-backend/internal/router"
)

type noopReady struct{}

func (noopReady) Check() error { return nil }

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	allow := os.Getenv("CORS_ALLOW_ORIGIN") // 예: http://localhost:3000
	r := router.New(router.Options{
		AllowOrigin: allow,
		Ready:       noopReady{},
	})

	srv := &http.Server{
		Addr:    ":" + port,
		Handler: r,
	}
	log.Printf("listening on :%s", port)
	if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatal(err)
	}
}
