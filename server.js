var express = require('express');
var compression = require('compression');
var serveStatic = require('serve-static');

var app = express();
app.use(compression());

app.use(serveStatic(__dirname)).listen(8000, function(){
    console.log('Server running on 8000...');
});
