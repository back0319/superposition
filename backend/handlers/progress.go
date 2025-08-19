package handlers

import (
	"my-project-backend/config"
	"my-project-backend/models"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

type ProgressHandler struct{}

func NewProgressHandler() *ProgressHandler {
	return &ProgressHandler{}
}

// POST /progress/:user_id
func (h *ProgressHandler) AddProgress(c *gin.Context) {
	userID := c.Param("user_id")
	var req struct {
		Minutes int `json:"minutes"`
	}
	if err := c.ShouldBindJSON(&req); err != nil || req.Minutes <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "유효한 시간 정보를 보내주세요"})
		return
	}

	docRef := config.FirestoreDB.Collection("progress").Doc(userID)
	doc, err := docRef.Get(c)

	var totalMinutes int
	if err == nil {
		var progress models.Progress
		if err := doc.DataTo(&progress); err == nil {
			totalMinutes = progress.Minutes
		}
	}

	newMinutes := totalMinutes + req.Minutes
	progress := models.Progress{
		UserID:    userID,
		Minutes:   newMinutes,
		UpdatedAt: time.Now(),
	}

	if _, err := docRef.Set(c, progress); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "기록 저장 실패"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "진행 상황 저장 완료", "minutes": newMinutes})
}

// GET /progress/:user_id
func (h *ProgressHandler) GetProgress(c *gin.Context) {
	userID := c.Param("user_id")

	doc, err := config.FirestoreDB.Collection("progress").Doc(userID).Get(c)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "기록이 없습니다"})
		return
	}

	var progress models.Progress
	if err := doc.DataTo(&progress); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "기록 파싱 실패"})
		return
	}

	c.JSON(http.StatusOK, progress)
}
