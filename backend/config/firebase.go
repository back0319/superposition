// config/firebase.go
package config

import (
	"context"
	"log"

	"cloud.google.com/go/firestore"
	firebase "firebase.google.com/go"
	"google.golang.org/api/option"
)

var FirebaseApp *firebase.App
var FirestoreDB *firestore.Client

func InitFirebase() {
	ctx := context.Background()
	opt := option.WithCredentialsFile("config/quantumbe-21866-firebase-adminsdk-fbsvc-ae3a530754.json")

	app, err := firebase.NewApp(ctx, nil, opt)
	if err != nil {
		log.Fatalf("Firebase 초기화 실패: %v", err)
	}

	FirebaseApp = app

	// Firestore 클라이언트 초기화
	client, err := app.Firestore(ctx)
	if err != nil {
		log.Fatalf("Firestore 클라이언트 초기화 실패: %v", err)
	}

	FirestoreDB = client
	log.Println("Firebase 및 Firestore 초기화 완료")
}
