package main

import (
	"my-project-backend/config"
	"my-project-backend/router"
)

func main() {
	config.InitFirebase()
	r := router.SetupRouter()
	r.Run(":8080")
}
