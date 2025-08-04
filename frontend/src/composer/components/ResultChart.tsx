// 파일: frontend/src/composer/components/ResultChart.tsx

import { FC, useState, useEffect } from "react";
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
  const [formattedData, setFormattedData] = useState<{
    sortedLabels: string[];
    sortedPercentages: number[];
    sortedCounts: number[];
    total: number;
  }>({ sortedLabels: [], sortedPercentages: [], sortedCounts: [], total: 0 });
    // 데이터가 변경될 때마다 차트 데이터 계산
  useEffect(() => {
    console.log("=== ResultChart 데이터 업데이트 ===");
    console.log("받은 데이터:", data);
    
    if (!data || Object.keys(data).length === 0) {
      console.log("데이터가 비어있거나 null입니다.");
      setFormattedData({ sortedLabels: [], sortedPercentages: [], sortedCounts: [], total: 0 });
      return;
    }
    
    const labels = Object.keys(data);
    const counts = Object.values(data);
    const total = counts.reduce((sum, count) => sum + count, 0);
    
    console.log("라벨:", labels);
    console.log("카운트:", counts);
    console.log("총합:", total);
    
    // 백분율로 변환
    const percentages = counts.map(count => (count / total) * 100);

    // 데이터 정렬 (백분율 기준으로 내림차순)
    const sortedData = labels.map((label, index) => ({
      label,
      percentage: percentages[index],
      count: counts[index]
    })).sort((a, b) => b.percentage - a.percentage);    // 정렬된 데이터에서 라벨과 백분율 추출
    const sortedLabels = sortedData.map(item => item.label);
    const sortedPercentages = sortedData.map(item => item.percentage);
    const sortedCounts = sortedData.map(item => item.count);
    
    console.log("정렬된 데이터:", sortedData);
    console.log("차트용 라벨:", sortedLabels);
    console.log("차트용 백분율:", sortedPercentages);
    
    setFormattedData({
      sortedLabels,
      sortedPercentages,
      sortedCounts,
      total
    });
    
    console.log("=== ResultChart 데이터 처리 완료 ===");
    
  }, [data]);
  
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="result-empty-state">
        <div className="empty-icon">📊</div>
        <div className="empty-message">회로를 시뮬레이션하면 여기에 결과가 표시됩니다.</div>
        <div className="empty-help">시뮬레이션을 실행하려면 '실행' 버튼을 클릭하세요.</div>
      </div>
    );
  }
  const { sortedLabels, sortedPercentages, sortedCounts, total } = formattedData;

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
            const index = sortedLabels.indexOf(label);
            const count = index >= 0 ? sortedCounts[index] : 0;
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
          }        },
        max: Math.max(...sortedPercentages) * 1.1, // 최대값의 110%로 설정
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
            {sortedLabels.map((label, index) => (
              <tr key={index}>
                <td>{label}</td>
                <td>{sortedCounts[index]}</td>
                <td>{sortedPercentages[index].toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResultChart;
