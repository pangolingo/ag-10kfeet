'use strict';


const express = require('express');

const app = express();

app.get('/', function(req, resp){
  // resp.send();
});

app.listen(5000);