package models

import "time"

// User 사용자 모델
type User struct {
	ID        string    `json:"id" firestore:"id"`
	Name      string    `json:"name" firestore:"name"`
	Email     string    `json:"email" firestore:"email"`
	CreatedAt time.Time `json:"created_at" firestore:"created_at"`
	UpdatedAt time.Time `json:"updated_at" firestore:"updated_at"`
}
