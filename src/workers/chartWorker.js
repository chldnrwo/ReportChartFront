// src/workers/chartWorker.js

// Web Worker 환경에서 Chart.js 및 date-fns 어댑터 로드
self.importScripts('https://cdn.jsdelivr.net/npm/chart.js');
self.importScripts('https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns');

// self.Chart를 명시적으로 설정
const { Chart } = self;

self.onmessage = (event) => {
  const { index, title, data } = event.data;

  const canvas = new OffscreenCanvas(1200, 480);
  const context = canvas.getContext('2d');

  new Chart(context, {
    type: 'line',
    data: {
      labels: data.map(d => d.column1),
      datasets: [{
        label: title,
        data: data.map(d => d.column2),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderWidth: 1,
        radius: 0,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'day',
            displayFormats: {
              day: 'MMM d'
            }
          }
        },
        y: {
          min: 0,
          max: 100
        }
      }
    }
  });

  // 결과를 이미지 데이터로 전송
  canvas.convertToBlob().then(blob => {
    const reader = new FileReader();
    reader.onload = () => {
      self.postMessage({ index, imageData: reader.result });
    };
    reader.readAsDataURL(blob);
  });
};
