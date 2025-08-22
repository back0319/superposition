package router

import (
	"net/http"

	"my-project-backend/internal/middleware"
	"my-project-backend/internal/version"

	"github.com/gin-gonic/gin"
)

type ReadyChecker interface {
	// 의존성(예: DB/PubSub/Firebase) 점검. 모두 OK면 nil
	Check() error
}

type Options struct {
	AllowOrigin string
	Ready       ReadyChecker // 없으면 nil 허용
}

func New(opts Options) *gin.Engine {
	r := gin.New()
	r.Use(middleware.Recover(), middleware.Logger(), middleware.RequestID())
	if opts.AllowOrigin != "" {
		r.Use(middleware.CORS(opts.AllowOrigin))
	}

	r.GET("/healthz", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"ok": true})
	})

	r.GET("/readyz", func(c *gin.Context) {
		if opts.Ready != nil {
			if err := opts.Ready.Check(); err != nil {
				c.JSON(http.StatusServiceUnavailable, gin.H{"ok": false, "error": err.Error()})
				return
			}
		}
		c.JSON(http.StatusOK, gin.H{"ok": true})
	})

	r.GET("/version", func(c *gin.Context) {
		c.JSON(http.StatusOK, version.Get())
	})

	return r
}
