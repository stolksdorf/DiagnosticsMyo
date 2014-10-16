var fs = require('fs');
var express = require("express");
var app = express();
app.use(express.static(__dirname + '/build'));

//require('node-jsx').install();

var recoil = require('./recoil.js');


console.log('TEST');


app.get('*', function(req, res){
	recoil.render({
		page: './build/diagnostics/bundle.hbs',
		initialProps: {}
	}, function (err, page) {
		return res.send(page)
	});
});


app.listen(8000);
console.log('Listening on localhost:8000');