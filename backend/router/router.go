package router

import (
	"my-project-backend/handlers"
	"my-project-backend/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()

	r.Use(middleware.CORSMiddleware())

	userHandler := handlers.NewUserHandler()

	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "pong"})
	})

	r.GET("/user/:id", userHandler.GetUser)
	r.POST("/user/", userHandler.CreateUser)
	r.PUT("/user/:id", userHandler.UpdateUser)
	r.DELETE("/user/:id", userHandler.DeleteUser)

	progressHandler := handlers.NewProgressHandler()

	r.POST("/progress/:user_id", progressHandler.AddProgress)
	r.GET("/progress/:user_id", progressHandler.GetProgress)

	return r
}
