var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();
var accents = require('remove-accents');
var i;
var j = 0;

async function getUrl(){
	return new Promise((resolve, reject)=> {
		var urlpage =[];
		var urls = [];
		var url2;
		var url1= "https://restaurant.michelin.fr/restaurants/france/restaurants-1-etoile-michelin/restaurants-2-etoiles-michelin/restaurants-3-etoiles-michelin/page-";
		
		for(i=1;i<=35;i++){
			url2=url1+i;
			urlpage.push(url2);
		}
		Promise.all(urlpage).then(values=>{
			values.forEach(function(url){
				urls = urls.concat(url);
			})
			resolve(urls);
		})
	});
}

async function getresto(urlpage){
	return new Promise((resolve, reject)=> {
		var Urlresto=[];
		request(urlpage, function(error, response, html){
		    if(!error  && response.statusCode == 200){
		        var $ = cheerio.load(html);
		    	$('.poi-card-link').each(function(){
		    		var urlbis =$(this).attr('href');
					Urlresto.push("https://restaurant.michelin.fr/"+urlbis);
		    	});
			resolve(Urlresto);
			}
		});
	});
}

async function allUrl(){
	var urlpage = await getUrl();
	return new Promise((resolve, reject)=> {
		var Urlresto = [];
		var urls=[];
		urlpage.forEach(function(url){
			Urlresto.push(getresto(url));
		})
		Promise.all(Urlresto).then(values=>{
			values.forEach(function(url){
				urls = urls.concat(url);
			})
			resolve(urls);
		})	
	});
}
	
	

async function scrape_base(url){
	return new Promise((resolve, reject)=> {
	var restaurants1 = [];
	var restos = [];
	request(url, function(error, response, html){
			if(!error  && response.statusCode == 200){
				const $ = cheerio.load(html);

				var title = $('.poi_intro-display-title').text().trim();
	    		
	    		
    	 		restaurants1.push(title);
			resolve(restaurants1);
			}
			resolve("");
		});	
	});
}
async function scrape(Urls){
	return new Promise((resolve, reject)=> {
		var restaurants = [];
		var restos = [];
		var temp ;
		Urls.forEach(function(url,i){
			temp =scrape_base(url);
			restaurants.push(temp);
		})
		Promise.all(restaurants).then(values=>{
			values.forEach(function(value){
				restos = restos.concat(value);
			})
			resolve(restos);
		})
	});
}
async function get(){	
	console.log('waiting urls ..');
	var url = await allUrl();
	console.log('waiting restaurants ..');
	var restaurants = await scrape(url);
	fs.writeFile('Liste-restaurants_michelin.json', JSON.stringify(restaurants, null, 4),function(err){
				});
	console.log('A file Liste-restaurants_michelin.json has been created in your working directory');
	return restaurants;
}
module.exports.get=get;

