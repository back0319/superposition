package middleware

import (
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

const HeaderRequestID = "X-Request-ID"

func RequestID() gin.HandlerFunc {
	return func(c *gin.Context) {
		if c.GetHeader(HeaderRequestID) == "" {
			c.Writer.Header().Set(HeaderRequestID, uuid.NewString())
		}
		c.Next()
	}
}
