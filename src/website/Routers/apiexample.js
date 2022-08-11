const express = require('express');

const app = express();

app.get('/', (req, res) => {
  if (req.hostname == "api.onbeat.me") {
    res.send({
      message: "Welcome to Express!"
    })
  }
});

app.listen(80, () => console.log('Listening on port 80'));
