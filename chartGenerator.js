const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const fs = require('fs').promises;
const path = require('path');
const moment = require('moment');

const width = 1000; // px
const height = 520; // px
const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });

async function generateChart(data) {
  const configuration = {
    type: 'line',
    data: {
      labels: data.data.map(d => moment(d.column1).format('YYYY-MM-DD HH:mm')),
      //labels: data.data.map(d => moment(d.column1)), // moment.js를 사용하여 날짜를 포맷합니다.
      datasets: [{
        label: data.title,
        data: data.data.map(d => d.column2),
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
        xAxes: [{
          type: 'time',
          time: {
            unit: 'day',
            //tooltipFormat: 'll',
            displayFormats: {
              day: 'MMM D'
            }
          },
        }],
        yAxes: [{
          ticks: {
            min: 0,
            max: 100
          },
        }]
      },
      // legend: {
      //   display: true,
      //   position: 'top'
      // }
    }
  };

  const imageBuffer = await chartJSNodeCanvas.renderToBuffer(configuration);
  const dir = path.join('C:', 'upload', `2024${data.month}`, data.groupName);
  await fs.mkdir(dir, { recursive: true });

  const filePath = path.join(dir, `${data.tbname}.png`);
  await fs.writeFile(filePath, imageBuffer);

  console.log(`Chart saved to ${filePath}`);

  // 메모리 해제
  configuration.data.labels = null;
  configuration.data.datasets[0].data = null;
}

module.exports = {
  generateChart
};
