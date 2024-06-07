self.importScripts('https://cdn.jsdelivr.net/npm/chart.js');
self.importScripts('https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns');

const Chart = self.Chart;

self.onmessage = async (event) => {
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

  const blob = await canvas.convertToBlob();
  const formData = new FormData();
  const fileName = `chart_${index}_${Date.now()}.png`; // 고유한 파일 이름 생성
  formData.append('image', blob, fileName);

  const response = await fetch('http://localhost:8080/upload', {
    method: 'POST',
    body: formData
  });

  if (response.ok) {
    const result = await response.json();
    const imageUrl = result.url;
    self.postMessage({ index, imageUrl });
  } else {
    console.error('Image upload failed', response.statusText);
  }

  canvas.width = 0;
  canvas.height = 0;
};
