from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)
CORS(app)  # 모든 도메인에서의 요청 허용

def write_log(message: str):
    with open("log.txt", "a", encoding="utf-8") as f:
        now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        f.write(f"[{now}] {message}\n")

@app.before_request
def log_request_info():
    write_log(f"Request: {request.method} {request.path} | Data: {request.get_data(as_text=True)}")

@app.route("/")
def home():
    return "Flask 서버가 정상적으로 실행 중입니다!"

@app.route("/simulate", methods=["POST"])
def simulate():
    # 여기에 시뮬레이션 코드 작성
    return jsonify({"result": "ok"})

@app.route("/qubit-info")
def qubit_info():
    return jsonify({"info": "큐비트에 대한 설명 등"})

@app.route("/circuit")
def get_circuit():
    return jsonify({"info": "회로에 대한 설명 등"})

@app.route("/convert-qasm", methods=["POST"])
def convert_qasm():
    data = request.get_json()
    placed = data.get("placedGates", [])
    # header
    lines = [
        "OPENQASM 2.0;",
        'include "qelib1.inc";',
        "qreg q[3];",
        "creg c[3];"
    ]
    # sort by slot then qubit
    for pg in sorted(placed, key=lambda x: (x["slot"], x["qubit"])):
        g = pg["gate"].lower()
        if g == "cnot": g = "cx"
        lines.append(f"{g} q[{pg['qubit']}];")
    return jsonify(qasm="\n".join(lines))

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)