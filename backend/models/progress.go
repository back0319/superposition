package models

import "time"

type Progress struct {
	UserID    string    `json:"user_id" firestore:"user_id"`
	Minutes   int       `json:"minutes" firestore:"minutes"`
	UpdatedAt time.Time `json:"updated_at" firestore:"updated_at"`
}
