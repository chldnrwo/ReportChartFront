const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const chartGenerator = require('./chartGenerator'); // chartGenerator 모듈 가져오기
const app = express();
const port = 3000;

const corsOptions = {
  origin: 'http://localhost:8081',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  optionsSuccessStatus: 204
};

app.use(bodyParser.json({ limit: '50mb' }));
app.use(cors(corsOptions));

// 정적 파일 제공
app.use('/images', express.static('C:/upload'));

app.post('/api/receive-data', async (req, res) => {
  const data = req.body;
  console.log('Received data:', data);

  if (data && data.data) {
    app.locals.receivedData = data;

    try {
      // 데이터 병렬 처리
      await Promise.all(data.data.map(async (item) => {
        await chartGenerator.generateChart(item);
      }));

      // 데이터 처리 후 메모리 해제
      app.locals.receivedData = null;
      res.status(200).send('Data processed and charts generated successfully');
    } catch (error) {
      console.error('Error processing data:', error);
      res.status(500).send('Error processing data');
    }
  } else {
    res.status(400).send('Invalid data');
  }
});

app.get('/api/get-received-data', (req, res) => {
  const data = app.locals.receivedData;
  if (data) {
    res.status(200).json(data);
  } else {
    res.status(404).send('No data found');
  }
});

app.listen(port, () => {
  console.log(`Express server running at http://localhost:${port}/`);
});
