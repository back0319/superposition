package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type QuantumHandler struct{}

func NewQuantumHandler() *QuantumHandler {
	return &QuantumHandler{}
}

// 큐비트 정보 응답 구조체
type QubitInfo struct {
	Name        string                 `json:"name"`
	Description string                 `json:"description"`
	Properties  map[string]interface{} `json:"properties"`
	Gates       []GateInfo             `json:"available_gates"`
}

type GateInfo struct {
	Name        string `json:"name"`
	Symbol      string `json:"symbol"`
	Description string `json:"description"`
	Qubits      int    `json:"qubits_required"`
}

// GET /qubit-info - 큐비트 및 양자 게이트 정보 제공
func (h *QuantumHandler) GetQubitInfo(c *gin.Context) {
	info := QubitInfo{
		Name:        "Quantum Bit (Qubit)",
		Description: "양자 컴퓨팅의 기본 정보 단위로, 0과 1의 중첩 상태를 가질 수 있습니다.",
		Properties: map[string]interface{}{
			"superposition": "0과 1 상태의 확률적 중첩",
			"entanglement":  "다른 큐비트와의 양자 얽힘 가능",
			"measurement":   "측정 시 0 또는 1로 확정됨",
			"coherence":     "양자 상태 유지 시간",
		},
		Gates: []GateInfo{
			{
				Name:        "Pauli-X",
				Symbol:      "X",
				Description: "비트 플립 게이트 (NOT 게이트)",
				Qubits:      1,
			},
			{
				Name:        "Pauli-Y",
				Symbol:      "Y",
				Description: "Y축 회전 게이트",
				Qubits:      1,
			},
			{
				Name:        "Pauli-Z",
				Symbol:      "Z",
				Description: "위상 플립 게이트",
				Qubits:      1,
			},
			{
				Name:        "Hadamard",
				Symbol:      "H",
				Description: "중첩 상태 생성 게이트",
				Qubits:      1,
			},
			{
				Name:        "CNOT",
				Symbol:      "CX",
				Description: "제어 NOT 게이트",
				Qubits:      2,
			},
			{
				Name:        "Rotation-X",
				Symbol:      "RX",
				Description: "X축 회전 게이트 (매개변수)",
				Qubits:      1,
			},
			{
				Name:        "Rotation-Y",
				Symbol:      "RY",
				Description: "Y축 회전 게이트 (매개변수)",
				Qubits:      1,
			},
			{
				Name:        "Rotation-Z",
				Symbol:      "RZ",
				Description: "Z축 회전 게이트 (매개변수)",
				Qubits:      1,
			},
		},
	}

	c.JSON(http.StatusOK, gin.H{
		"info": info,
		"additional_resources": map[string]string{
			"documentation": "/docs/quantum-computing",
			"tutorials":     "/tutorials/quantum-basics",
			"simulator":     "/simulate",
		},
	})
}

// GET /quantum/algorithms - 사용 가능한 양자 알고리즘 정보
func (h *QuantumHandler) GetAlgorithms(c *gin.Context) {
	algorithms := []map[string]interface{}{
		{
			"name":        "Deutsch-Jozsa",
			"description": "함수가 상수인지 균형인지 판별하는 알고리즘",
			"qubits":      "n+1 큐비트 필요",
			"complexity":  "O(1) vs 고전 O(2^(n-1))",
		},
		{
			"name":        "Grover's Search",
			"description": "비정렬 데이터베이스에서 특정 항목 검색",
			"qubits":      "log₂(N) 큐비트 필요",
			"complexity":  "O(√N) vs 고전 O(N)",
		},
		{
			"name":        "Shor's Algorithm",
			"description": "큰 수의 소인수분해",
			"qubits":      "큰 수에 비례하는 큐비트 필요",
			"complexity":  "다항시간 vs 고전 지수시간",
		},
		{
			"name":        "Quantum Fourier Transform",
			"description": "양자 푸리에 변환",
			"qubits":      "입력 크기에 비례",
			"complexity":  "O(n²) vs 고전 FFT O(n log n)",
		},
	}

	c.JSON(http.StatusOK, gin.H{
		"algorithms": algorithms,
		"note":       "실제 구현은 /simulate 엔드포인트를 통해 실행할 수 있습니다.",
	})
}
