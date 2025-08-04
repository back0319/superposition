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
    try:
        # 필요한 라이브러리 임포트
        import math
        import numpy as np
        import json
        import base64
        from io import BytesIO
        
        # Qiskit 관련 임포트 시도
        try:
            from qiskit import QuantumCircuit, transpile
            from qiskit_aer import Aer
            from qiskit.visualization import plot_bloch_multivector, plot_histogram, circuit_drawer
            import matplotlib
            matplotlib.use('Agg')  # 서버 환경에서 사용하기 위해 백엔드 설정
            import matplotlib.pyplot as plt
            use_qiskit = True
            write_log("Qiskit 모듈을 성공적으로 가져왔습니다!")
        except ImportError as e:
            use_qiskit = False
            write_log(f"Qiskit 모듈을 가져오는 데 실패했습니다: {str(e)}")
            write_log("기본 시뮬레이션을 대신 사용합니다.")
        
        data = request.get_json()
        qasm_code = data.get("qasm", "")
        
        if not qasm_code:
            return jsonify({"error": "QASM 코드가 없습니다"}), 400
            
        write_log(f"받은 QASM 코드:\n{qasm_code}")
        
        # Qiskit을 사용할 수 있으면 정확한 시뮬레이션 수행
        if use_qiskit:
            try:
                # QASM 코드로부터 양자 회로 생성
                circuit = QuantumCircuit.from_qasm_str(qasm_code)
                write_log(f"Qiskit 회로 생성 성공: {circuit.num_qubits} 큐비트, 깊이: {circuit.depth()}")
                
                # 측정 연산이 있는지 확인
                has_measurement = any(instr.operation.name == 'measure' for instr in circuit.data)
                
                if has_measurement:
                    # 측정이 있는 경우: 샷 기반 시뮬레이션
                    simulator = Aer.get_backend('qasm_simulator')
                    compiled_circuit = transpile(circuit, simulator)
                    job = simulator.run(compiled_circuit, shots=1024)
                    result = job.result()
                    counts = result.get_counts()
                    
                    # 확률로 변환 (counts를 샷 수로 나누기)
                    total_shots = sum(counts.values())
                    probabilities = {}
                    for state, count in counts.items():
                        probabilities[state] = count / total_shots
                    
                    write_log(f"측정 기반 시뮬레이션 결과: {probabilities}")
                    
                    # 측정 전 상태 벡터도 계산 (측정 명령 제거 후)
                    circuit_without_measurement = circuit.copy()
                    circuit_without_measurement.remove_final_measurements()
                    
                    statevector_sim = Aer.get_backend('statevector_simulator')
                    sv_compiled = transpile(circuit_without_measurement, statevector_sim)
                    sv_result = statevector_sim.run(sv_compiled).result()
                    statevector = sv_result.get_statevector()
                    
                else:
                    # 측정이 없는 경우: 상태 벡터 시뮬레이션
                    simulator = Aer.get_backend('statevector_simulator')
                    compiled_circuit = transpile(circuit, simulator)
                    job = simulator.run(compiled_circuit)
                    result = job.result()
                    statevector = result.get_statevector()
                    
                    # 상태 벡터에서 확률 계산
                    probabilities = {}
                    for i, amplitude in enumerate(statevector):
                        binary = format(i, f'0{circuit.num_qubits}b')
                        prob = abs(amplitude)**2
                        if prob > 1e-10:  # 매우 작은 값은 무시
                            probabilities[binary] = float(prob)
                    
                    write_log(f"상태 벡터 시뮬레이션 결과: {probabilities}")
                
                # 시각화 생성
                visualization_images = {}
                
                try:
                    # 블로흐 구면 시각화 (상태 벡터가 있을 때만)
                    if 'statevector' in locals():
                        plt.figure(figsize=(8, 6))
                        plot_bloch_multivector(statevector)
                        bloch_buf = BytesIO()
                        plt.savefig(bloch_buf, format='png', dpi=100, bbox_inches='tight')
                        bloch_buf.seek(0)
                        visualization_images["bloch_sphere"] = base64.b64encode(bloch_buf.read()).decode('utf-8')
                        plt.close()
                        write_log("블로흐 구면 시각화 생성 완료")
                except Exception as viz_error:
                    write_log(f"블로흐 구면 시각화 오류: {str(viz_error)}")
                
                try:
                    # 히스토그램 시각화
                    plt.figure(figsize=(10, 6))
                    plot_histogram(probabilities, title="양자 상태 확률 분포")
                    hist_buf = BytesIO()
                    plt.savefig(hist_buf, format='png', dpi=100, bbox_inches='tight')
                    hist_buf.seek(0)
                    visualization_images["histogram"] = base64.b64encode(hist_buf.read()).decode('utf-8')
                    plt.close()
                    write_log("히스토그램 시각화 생성 완료")
                except Exception as viz_error:
                    write_log(f"히스토그램 시각화 오류: {str(viz_error)}")
                
                try:
                    # 회로 시각화 (텍스트 형식)
                    circuit_text = str(circuit.draw(output='text'))
                    visualization_images["circuit_text"] = circuit_text
                    write_log("회로 텍스트 시각화 생성 완료")
                except Exception as viz_error:
                    write_log(f"회로 시각화 오류: {str(viz_error)}")
                
                # 상태 벡터 포맷팅
                statevector_formatted = []
                if 'statevector' in locals():
                    for complex_num in statevector:
                        statevector_formatted.append([float(complex_num.real), float(complex_num.imag)])
                
                # 결과 반환
                result_data = {
                    "counts": probabilities,
                    "statevector": statevector_formatted,
                    "visualization": visualization_images,
                    "qiskit_info": {
                        "num_qubits": circuit.num_qubits,
                        "depth": circuit.depth(),
                        "gate_counts": dict(circuit.count_ops()),
                        "has_measurement": has_measurement
                    },
                    "success": True
                }
                
                write_log(f"Qiskit 시뮬레이션 성공! 확률 개수: {len(probabilities)}")
                return jsonify(result_data)
                
            except Exception as qiskit_error:
                write_log(f"Qiskit 시뮬레이션 오류: {str(qiskit_error)}")
                return jsonify({
                    "error": f"Qiskit 시뮬레이션 실패: {str(qiskit_error)}",
                    "fallback_used": False
                }), 500        
        # Qiskit을 사용할 수 없는 경우 또는 오류 발생 시 기본 시뮬레이션
        write_log("기본 QASM 파서를 사용한 시뮬레이션 시작")
        
        # QASM 코드 파싱하여 큐비트 개수 및 게이트 정보 추출
        lines = qasm_code.split('\n')
        qubit_count = 3  # 기본값
        
        for line in lines:
            if "qreg" in line:
                # qreg q[3]; 같은 형식에서 숫자 추출
                import re
                match = re.search(r'qreg\s+\w+\[(\d+)\]', line)
                if match:
                    qubit_count = int(match.group(1))
                break
        
        # 게이트 분석
        gates = []
        for line in lines:
            line = line.strip()
            if line and not line.startswith('//') and not line.startswith('OPENQASM') and 'reg' not in line:
                # 간단한 게이트 파싱
                parts = line.split()
                if len(parts) >= 2:
                    gate_name = parts[0]
                    target = parts[1].rstrip(';')
                    gates.append((gate_name, target))
        
        write_log(f"파싱된 게이트들: {gates}")
        
        # 초기 상태 벡터 생성 (|0...0> 상태)
        statevector_size = 2 ** qubit_count
        statevector = [complex(0, 0) for _ in range(statevector_size)]
        statevector[0] = complex(1, 0)  # |0...0> 상태
        
        # 게이트별 시뮬레이션
        for gate_name, target in gates:
            # 큐비트 인덱스 추출 (예: q[0] -> 0)
            if '[' in target and ']' in target:
                qubit_index = int(target.split('[')[1].split(']')[0])
            else:
                continue
                
            if gate_name == 'h':  # 아다마르 게이트
                new_statevector = [complex(0, 0) for _ in range(statevector_size)]
                for i in range(statevector_size):
                    # 해당 큐비트가 0인 상태와 1인 상태 계산
                    bit_0 = i & ~(1 << qubit_index)  # 해당 비트를 0으로
                    bit_1 = i | (1 << qubit_index)   # 해당 비트를 1로
                    
                    # 아다마르 변환: H|0> = (|0> + |1>)/√2, H|1> = (|0> - |1>)/√2
                    if (i >> qubit_index) & 1 == 0:  # 현재 상태에서 해당 큐비트가 0
                        new_statevector[bit_0] += statevector[i] / math.sqrt(2)
                        new_statevector[bit_1] += statevector[i] / math.sqrt(2)
                    else:  # 현재 상태에서 해당 큐비트가 1
                        new_statevector[bit_0] += statevector[i] / math.sqrt(2)
                        new_statevector[bit_1] -= statevector[i] / math.sqrt(2)
                        
                statevector = new_statevector
                
            elif gate_name == 'x':  # 파울리 X 게이트 (NOT)
                new_statevector = [complex(0, 0) for _ in range(statevector_size)]
                for i in range(statevector_size):
                    # 해당 큐비트 비트 플립
                    flipped_i = i ^ (1 << qubit_index)
                    new_statevector[flipped_i] = statevector[i]
                statevector = new_statevector
                
            elif gate_name == 'y':  # 파울리 Y 게이트
                new_statevector = [complex(0, 0) for _ in range(statevector_size)]
                for i in range(statevector_size):
                    flipped_i = i ^ (1 << qubit_index)
                    if (i >> qubit_index) & 1 == 0:  # |0> -> i|1>
                        new_statevector[flipped_i] = statevector[i] * 1j
                    else:  # |1> -> -i|0>
                        new_statevector[flipped_i] = statevector[i] * -1j
                statevector = new_statevector
                
            elif gate_name == 'z':  # 파울리 Z 게이트
                for i in range(statevector_size):
                    if (i >> qubit_index) & 1 == 1:  # |1> -> -|1>
                        statevector[i] *= -1
        
        # 확률 계산
        probabilities = {}
        for i, amplitude in enumerate(statevector):
            binary = format(i, f'0{qubit_count}b')
            prob = abs(amplitude)**2
            if prob > 1e-10:  # 매우 작은 값은 무시
                probabilities[binary] = float(prob)
        
        # 상태 벡터 포맷팅
        statevector_formatted = []
        for complex_num in statevector:
            statevector_formatted.append([float(complex_num.real), float(complex_num.imag)])
        
        write_log(f"기본 시뮬레이션 결과 - 큐비트: {qubit_count}, 확률: {probabilities}")
        
        return jsonify({
            "counts": probabilities,
            "statevector": statevector_formatted,
            "simulation_method": "fallback",
            "qiskit_available": use_qiskit
        })
    except Exception as e:
        write_log(f"Simulation error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route("/concept")
def get_concept():
    return jsonify({"info": "회로에 대한 설명 등"})

@app.route("/entangle")
def entangle():
    return jsonify({"info": "얽힘에 대한 설명 등"})

@app.route("/sp1")
def sp1_route():
    return jsonify({"info": "중첩 원리에 대한 설명 등"})

@app.route("/superposition")
def superposition():
    return jsonify({"info": "중첩 원리에 대한 설명 등"})

@app.route("/qubit")
def qubit_info():
    return jsonify({"info": "큐비트에 대한 설명 등"})

@app.route("/gate")
def gate_info():
    return jsonify({"info": "게이트에 대한 설명 등"})

@app.route("/circuit")
def get_circuit():
    return jsonify({"info": "회로에 대한 설명 등"})

@app.route("/analyze-qasm", methods=["POST"])
def analyze_qasm():
    try:
        data = request.get_json()
        qasm_code = data.get("qasm", "")
        
        if not qasm_code:
            return jsonify({"error": "QASM 코드가 없습니다"}), 400
        
        # Qiskit 분석 시도
        try:
            from qiskit import QuantumCircuit
            import json
            import base64
            from io import BytesIO
            
            # QASM 코드에서 회로 생성
            circuit = QuantumCircuit.from_qasm_str(qasm_code)
            
            # 회로 정보 추출
            analysis_result = {
                "num_qubits": circuit.num_qubits,
                "depth": circuit.depth(),
                "gate_counts": circuit.count_ops(),
                "circuit_text": circuit.draw(output='text')
            }
            
            # 파이썬 코드 생성
            python_code = [
                "from qiskit import QuantumCircuit, Aer, execute",
                "",
                "# 회로 생성",
                f"qc = QuantumCircuit.from_qasm_str('''{qasm_code}''')",
                "",
                "# 회로 시뮬레이션",
                "simulator = Aer.get_backend('statevector_simulator')",
                "result = execute(qc, simulator).result()",
                "statevector = result.get_statevector()",
                "",
                "# 회로 그리기",
                "print(qc.draw())"
            ]
            
            return jsonify({
                "analysis": analysis_result,
                "python_code": "\n".join(python_code)
            })
            
        except Exception as e:
            write_log(f"Qiskit 회로 분석 실패: {str(e)}")
            return jsonify({"error": f"회로 분석 중 오류가 발생했습니다: {str(e)}"}), 500
            
    except Exception as e:
        write_log(f"QASM 분석 오류: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route("/convert-qasm", methods=["POST"])
def convert_qasm():
    data = request.get_json()
    placed = data.get("placedGates", [])
    qubit_count = data.get("qubitCount", 3)
    
    # header
    lines = [
        "OPENQASM 2.0;",
        'include "qelib1.inc";',
        f"qreg q[{qubit_count}];",
        f"creg c[{qubit_count}];"
    ]
    
    # sort by slot then qubit
    for pg in sorted(placed, key=lambda x: (x["slot"], x["qubit"])):
        g = pg["gate"].lower()
        if g == "cnot": g = "cx"
        
        # 제어 큐비트가 있는 게이트 처리
        if "control" in pg and "target" in pg:
            lines.append(f"{g} q[{pg['control']}],q[{pg['target']}];")
        else:
            lines.append(f"{g} q[{pg['qubit']}];")
    
    qasm_code = "\n".join(lines)
    
    # Qiskit으로 회로 분석 시도
    try:
        from qiskit import QuantumCircuit
        from qiskit.visualization import circuit_drawer
        import matplotlib.pyplot as plt
        from io import BytesIO
        import base64
        
        # QASM 코드에서 회로 생성
        circuit = QuantumCircuit.from_qasm_str(qasm_code)
        
        # 회로 시각화 (텍스트 형식)
        circuit_text = circuit.draw(output='text')
        
        # 회로 시각화 (이미지 형식)
        circuit_img_buf = BytesIO()
        circuit_drawer(circuit, output='mpl', filename=circuit_img_buf, format='png')
        circuit_img_buf.seek(0)
        circuit_img = base64.b64encode(circuit_img_buf.read()).decode('utf-8')
        plt.close()
        
        return jsonify({
            "qasm": qasm_code,
            "visualization": {
                "circuit_text": circuit_text,
                "circuit_image": circuit_img
            },
            "qiskit_info": {
                "num_qubits": circuit.num_qubits,
                "depth": circuit.depth(),
                "gate_counts": circuit.count_ops()
            }
        })
        
    except Exception as e:
        # Qiskit 사용 실패 시 기본 QASM만 반환
        write_log(f"Qiskit 회로 분석 실패: {str(e)}")
        return jsonify(qasm=qasm_code)

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)