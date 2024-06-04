<template>
    <div>
      <canvas id="dataChart"></canvas>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  import { Chart, registerables } from 'chart.js';
  import 'chartjs-adapter-date-fns';
  
  // Chart.js를 등록합니다.
  Chart.register(...registerables);
  
  export default {
    name: 'ChartComponent',
    data() {
      return {
        chart: null,
        chartData: [],
      };
    },
    mounted() {
      this.fetchData();
    },
    methods: {
      fetchData() {
        axios
          .get('http://localhost:8080/datapoints/month/2024-05')
          .then(response => {
            this.chartData = response.data;
            this.renderChart();
          })
          .catch(error => {
            console.error('Error fetching data:', error);
          });
      },
      renderChart() {
        const ctx = document.getElementById('dataChart').getContext('2d');
        const labels = this.chartData.map(dp => new Date(dp.time));
        const data = this.chartData.map(dp => dp.value);
  
        this.chart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: labels,
            datasets: [
              {
                label: 'Value over Time',
                data: data,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: false,
                tension: 0.1,
                borderWidth: 1,
                radius: 0,
              },
            ],
          },
          options: {
            responsive: true,
            scales: {
              x: {
                type: 'time',
                time: {
                  unit: 'minute',
                  tooltipFormat: 'yyyy-MM-dd HH:mm:ss',
                  displayFormats: {
                    minute: 'yyyy-MM-dd HH:mm:ss',
                  },
                },
              },
              y: {
                beginAtZero: true,
              },
            },
          },
        });
      },
    },
  };
  </script>
  
  <style scoped>
  canvas {
    position: relative;
    display: flex;
    justify-content: center;
    width: 80%;
    height: 400px;
    margin: 0 auto;
  }
  </style>
  