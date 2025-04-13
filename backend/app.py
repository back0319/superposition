from flask import Flask, request, jsonify
from qiskit import QuantumCircuit, Aer, execute
from dotenv import load_dotenv
import os

load_dotenv()
app = Flask(__name__)

@app.route("/simulate", methods=["POST"])
def simulate():
    data = request.json
    code = data.get("circuit")

    try:
        qc = QuantumCircuit.from_qasm_str(code)
        backend = Aer.get_backend("qasm_simulator")
        job = execute(qc, backend, shots=1024)
        result = job.result().get_counts()
        return jsonify({"result": result})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == "__main__":
    app.run(debug=True)
