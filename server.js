const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = 3000;

const corsOptions = {
  origin: 'http://localhost:8081',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  optionsSuccessStatus: 204
};

app.use(bodyParser.json());
app.use(cors(corsOptions));

app.post('/api/receive-data', (req, res) => {
    const { groupName, month, page, size } = req.body;
    console.log(`Received data: groupName=${groupName}, month=${month}, page=${page}, size=${size}`);
    app.locals.groupName = groupName;
    app.locals.month = month;
    app.locals.page = page;
    app.locals.size = size;
    res.status(200).send({ groupName, month, page, size });
});

app.get('/api/get-received-data', (req, res) => {
    const groupName = app.locals.groupName;
    const month = app.locals.month;
    const page = app.locals.page;
    const size = app.locals.size;
    if (groupName && month && page !== undefined && size !== undefined) {
        console.log(`Sending data to Vue: groupName=${groupName}, month=${month}, page=${page}, size=${size}`);
        res.status(200).send({ groupName, month, page, size });
    } else {
        console.log('No data found');
        res.status(404).send('No data found');
    }
});

app.listen(port, () => {
    console.log(`Express server running at http://localhost:${port}/`);
});
