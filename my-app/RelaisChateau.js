var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();
var accents = require('remove-accents');
const axios = require('axios');
const fetch = require('node-fetch');
const michelin = require('./michelin');

async function getresto(urlpage){
	return new Promise((resolve, reject)=> {
		var Urlresto=[];
		request(urlpage, function(error, response, html){
		    if(!error  && response.statusCode == 200){
		        var $ = cheerio.load(html);
		    	$('.mainTitle3 fzMedium cGrey noVerticalMargin').each(function(){
		    		var urlbis =$(this).attr('href');
					Urlresto.push("https://www.relaischateaux.com/us/destinations/europe/france");
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
	
	

async function getAllUrl(){
	var url = [];
	for(var i=1;i<=8;i++){
	const response = await fetch("https://www.relaischateaux.com/fr/update-destination-results",{
		"credentials" : "include",
		"headers" : {
			"accept": "*/*",
			"accept-language": "fr-FR,fr;q=0.9,en=US;q=0.8,en;q=0.7",
			"cache-control":"no-cache",
			"content-type":"application/x-www-form-urlencoded; charset=UTF-8",
			"pragma": "no-cache",
			"x-requested-with":"XMLHttpRequest"
		},
		"refferer":"https://www.relaischateaux.com/us/destinations/europe/france",
		"reffererPolicy": "origin-when-cross-origin",
		"body":"page="+i+"&areaId=78",
		"method":"POST",
		"mode":"cors"
	})
	var json= await response.json();
	const $ =  cheerio.load(json.html);
	$('.mainTitle3').each(function(){
		url.push($(this).children('a').attr('href'))
	});
}
return url;
	
}

async function getUrlResto(url){
	return new Promise((resolve, reject)=> {
			var resto =[];
			request(url, function(error, response, html){
		      if(!error  && response.statusCode === 200){
		        const $ = cheerio.load(html);
		        $('.jsSecondNavMain').children('li').each(function(i,elm){
		        	if($(this).find('span').text()=="Restaurant"){
				        	resto.push($(this).find('span').parent().attr('href'));
				        }
		        });
		        	
		      }
		      resolve(resto);
			});
		
	});
}

async function getResto(){
	var urls=await getAllUrl();
	return new Promise((resolve, reject)=> {
	var urlResto=[];
	var urlRestaurants=[];
	urls.forEach(function(url,i){
		urlResto.push(getUrlResto(url));
	})
	Promise.all(urlResto).then(values=>{
			values.forEach(function(value){
				urlRestaurants = urlRestaurants.concat(value);
			})
			resolve(urlRestaurants);
		});
});
}
async function getName(url){
	return new Promise((resolve, reject)=> {
		var Hotels=[];
		var hotel_resto = {'hotel_name':'','hotel_price':'','resto_name': '','city':'','url':''};
		request(url, function(error, response, html){
		      if(!error  && response.statusCode === 200){
		        const $ = cheerio.load(html);
		        $('.jsSecondNavMain').children('li').each(function(i,elm){
		        	if($(this).find('span').text()=="Hôtel"){
		        		hotel_name=$('innerHotelHeader').find('headings').children().first().text().trim();
		        		hotel_price=$('priceTag').find('price').text().trim();
		        		city=$('innerHotelHeader').find('headings').children().next().children().next().text().trim();
		        		hotel_resto.url=$(this).find('span').parent().attr('href');
		        		if($('.jsSecondNavSub')[0])
				        {
				        	$('.jsSecondNavSub').children().each(function(){
				        		hotel_resto.resto_name =$(this).text().trim();
				        	})
				        }
				        else{
			        		hotel_resto.resto_name=$('.hotelTabsHeaderTitle').children().text().trim();
				        }
				        
				    }
		        });
		        


		        Hotels.push(hotel_resto);
		    };
		    resolve(Hotels);
	});
	});

}
async function getAllName(){
	var urls=await getResto();
	return new Promise((resolve, reject)=> {
		var names = [];
		var name = [];
		var temp ;
		urls.forEach(function(url,i){
			temp =getName(url);
			name.push(temp);
		})
		Promise.all(name).then(values=>{
			values.forEach(function(value){
				names = names.concat(value);
			})
			resolve(names);
		})
	});
}
async function get(){	
	console.log('waiting hotels ..');
	var names = await getAllName();
	fs.writeFile('Liste-Relais-Chateau.json', JSON.stringify(names, null, 4),function(err){
				});
	console.log('A file Liste-Relais-Chateau.json has been created in your working directory');
	return names;
}

async function updateDeals(){
	var restos = await michelin.get();
	var names = await get();
	var promises = [];
	for(var i=0;i<names.length;i++){
		for(var j = 0;j<restos.length;j++){
			if(names[i].resto_name === restos[j]){
				promises.push(names[i]);
			}
		}
	}
	Promise.all(promises).then(values => {
		fs.writeFile('Liste-Relais-Chateau_Finale.json',JSON.stringify(values, null, 4),function(err){
					});
	})
	console.log('A file Liste-Relais-Chateau_Finale.json has been created in your working directory');
	return promises;
}
updateDeals();
module.exports.updateDeals=updateDeals;



