var http = require('http');
var michelin = require('./michelin');
var res = require('express');

function start_server(){
	var server = http.createServer(function(req,res){
		michelin.get();
		res.write('check your console');
	res.end();
	});
	server.listen(8081);
}
 start_server();