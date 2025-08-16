package handlers

import (
	"my-project-backend/config"
	"my-project-backend/models"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

type UserHandler struct{}

func NewUserHandler() *UserHandler {
	return &UserHandler{}
}

func (h *UserHandler) CreateUser(c *gin.Context) {
	var user models.User

	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user.CreatedAt = time.Now()
	user.UpdatedAt = time.Now()

	_, err := config.FirestoreDB.Collection("users").Doc(user.ID).Set(c, user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user in Firestore"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User created", "id": user.ID})
}
func (h *UserHandler) GetUser(c *gin.Context) {
	id := c.Param("id")

	doc, err := config.FirestoreDB.Collection("users").Doc(id).Get(c)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	var user models.User
	if err := doc.DataTo(&user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse user data"})
		return
	}

	c.JSON(http.StatusOK, user)
}

func (h *UserHandler) UpdateUser(c *gin.Context) {
	id := c.Param("id")

	var updateData models.User
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON"})
		return
	}

	updateData.UpdatedAt = time.Now()

	_, err := config.FirestoreDB.Collection("users").Doc(id).Set(c, updateData)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User updated", "id": id})
}

func (h *UserHandler) DeleteUser(c *gin.Context) {
	id := c.Param("id")

	_, err := config.FirestoreDB.Collection("users").Doc(id).Delete(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User deleted", "id": id})
}
