import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const data = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Pot Value',
        data: [12, 19, 3, 5, 2, 3],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Pot</h3>
          <p className="stat-value">$10,000</p>
        </div>
        <div className="stat-card">
          <h3>Players</h3>
          <p className="stat-value">150</p>
        </div>
      </div>
      <div className="chart-container">
        <Line data={data} />
      </div>
    </div>
  );
};

export default Dashboard;
