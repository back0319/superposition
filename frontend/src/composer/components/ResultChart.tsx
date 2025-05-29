// 파일: frontend/src/composer/components/ResultChart.tsx

import { FC, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  ChartOptions,
  Tooltip,
  Legend,
  Title,
} from "chart.js";

// 차트 컴포넌트 등록
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title);

interface ResultChartProps {
  data: Record<string, number> | null;
}

const ResultChart: FC<ResultChartProps> = ({ data }) => {
  const [chartType, setChartType] = useState<'bar' | 'histogram'>('bar');
  
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="result-empty-state">
        <div className="empty-icon">📊</div>
        <div className="empty-message">회로를 시뮬레이션하면 여기에 결과가 표시됩니다.</div>
        <div className="empty-help">시뮬레이션을 실행하려면 '실행' 버튼을 클릭하세요.</div>
      </div>
    );
  }

  const labels = Object.keys(data);
  const counts = Object.values(data);
  const total = counts.reduce((sum, count) => sum + count, 0);
  
  // 백분율로 변환
  const percentages = counts.map(count => (count / total) * 100);

  // 데이터 정렬 (백분율 기준으로 내림차순)
  const sortedData = labels.map((label, index) => ({
    label,
    percentage: percentages[index],
    count: counts[index]
  })).sort((a, b) => b.percentage - a.percentage);

  // 정렬된 데이터에서 라벨과 백분율 추출
  const sortedLabels = sortedData.map(item => item.label);
  const sortedPercentages = sortedData.map(item => item.percentage);

  const chartData = {
    labels: sortedLabels,
    datasets: [
      {
        label: "확률 (%)",
        data: sortedPercentages,
        backgroundColor: sortedLabels.map(label => {
          // 이진수 라벨의 1의 개수에 따라 다른 색상 적용
          const onesCount = label.split('').filter(bit => bit === '1').length;
          return `rgba(15, 98, 254, ${0.3 + (onesCount * 0.1)})`;
        }),
        borderColor: 'rgba(15, 98, 254, 1)',
        borderWidth: 1,
        hoverBackgroundColor: 'rgba(15, 98, 254, 0.6)',
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.label || '';
            const value = context.parsed.y || 0;
            const count = sortedData.find(item => item.label === label)?.count || 0;
            return `${label}: ${value.toFixed(2)}% (${count}번 측정됨)`;
          }
        }
      },
      title: {
        display: true,
        text: '측정 결과 확률 분포',
        font: {
          size: 16,
          weight: 'bold'
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: '확률 (%)',
          font: {
            weight: 'bold'
          }
        },
        max: Math.max(...percentages) * 1.1, // 최대값의 110%로 설정
        grid: {
          color: 'rgba(200, 200, 200, 0.3)'
        }
      },
      x: {
        title: {
          display: true,
          text: '계산 기저 상태',
          font: {
            weight: 'bold'
          }
        },
        grid: {
          display: false
        }
      },
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart'
    }
  };
  return (
    <div className="result-chart-container">
      <div className="chart-controls">
        <button 
          className={`chart-button ${chartType === 'bar' ? 'active' : ''}`} 
          onClick={() => setChartType('bar')}
        >
          막대 그래프
        </button>
        <button 
          className={`chart-button ${chartType === 'histogram' ? 'active' : ''}`} 
          onClick={() => setChartType('histogram')}
        >
          히스토그램
        </button>
        <div className="chart-info">
          <span>총 측정 횟수: {total}</span>
        </div>
      </div>
      
      <div className="chart-area">
        <Bar data={chartData} options={options} />
      </div>
      
      <div className="result-table">
        <h4>측정 결과 테이블</h4>
        <table>
          <thead>
            <tr>
              <th>기저 상태</th>
              <th>횟수</th>
              <th>확률</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((item, index) => (
              <tr key={index}>
                <td>{item.label}</td>
                <td>{item.count}</td>
                <td>{item.percentage.toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResultChart;
