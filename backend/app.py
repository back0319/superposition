# backend/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
from qiskit import QuantumCircuit
from qiskit.compiler import transpile
from qiskit_aer import AerSimulator

app = Flask(__name__)
CORS(app)

# 로깅 함수 추가
def write_log(message: str):
    with open("log.txt", "a", encoding="utf-8") as f:
        now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        f.write(f"[{now}] {message}\n")

@app.before_request
def log_request_info():
    write_log(f"Request: {request.method} {request.path} | Data: {request.get_data(as_text=True)}")

# 기본 엔드포인트
@app.route("/")
def home():
    return "Flask 서버가 정상적으로 실행 중입니다!"

# 시뮬레이션 실행 (측정 기반)
@app.route("/simulate", methods=["POST"])
def simulate():
    try:
        qasm = request.json["qasm"]
        qc = QuantumCircuit.from_qasm_str(qasm)
        backend = AerSimulator()
        transpiled = transpile(qc, backend)
        job = backend.run(transpiled, shots=1024)
        result = job.result()
        counts = result.get_counts()
        return jsonify(counts)
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# 상태벡터 반환 API
@app.route("/statevector", methods=["POST"])
def statevector():
    try:
        qasm = request.json["qasm"]
        qc = QuantumCircuit.from_qasm_str(qasm)
        backend = AerSimulator()

        qc.save_statevector()
        transpiled = transpile(qc, backend)
        job = backend.run(transpiled)
        result = job.result()
        state = result.get_statevector().data.tolist()
        return jsonify(statevector=state)
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# 큐비트 설명 API
@app.route("/qubit-info")
def qubit_info():
    return jsonify({"info": "큐비트는 양자 정보를 나타내는 기본 단위입니다."})

# 회로 설명 API
@app.route("/circuit")
def get_circuit():
    return jsonify({"info": "회로는 게이트들이 시간 순서대로 배치된 구조입니다."})

# placedGate[] → QASM 변환기
@app.route("/convert-qasm", methods=["POST"])
def convert_qasm():
    data = request.get_json()
    placed = data.get("placedGates", [])
    lines = [
        "OPENQASM 2.0;",
        'include "qelib1.inc";',
        "qreg q[3];",
        "creg c[3];"
    ]
    for pg in sorted(placed, key=lambda x: (x["slot"], x["qubit"])):
        g = pg["gate"].lower()
        if g == "cnot":
            g = "cx"
        lines.append(f"{g} q[{pg['qubit']}];")
    return jsonify(qasm="\n".join(lines))

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
