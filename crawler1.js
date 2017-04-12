//Imports
const request = require('request');
const rp = require('request-promise');
const cheerio = require('cheerio');
//Imports et Param server
const express = require('express');
const app = express();
const http = require('http').Server(app);
app.set('views', './views');//  répertoire avec fichiers .jade
app.set('view engine', 'jade');        //  on utilise jade pour 'render'


const PORT =1234;
//Imports mes fonctions
const scrape = require('./scrapeFunction.js');

//Paramètres urls
var url = "https://www.tourismeottawa.ca/evenements/";
var compteur = 0;
var timeOut = false;
var evenements = [];
var searchKey = "";
var allSended = false;

app.use(express.static('fichiersStatiques'));

http.listen(PORT);
var textLinks = [];
request (url, function(err, resp, body) {
	if(err){return console.error(err);}//compteur++;
      
	var $ = cheerio.load(body);//Librairie cheerio permet de chargé le corps de la page web dans une variable

	//Pour chacun des liens, on les sauvegardes dans un array
	$('div.link-tile').each( function(index,element){
		textLinks[index] = $(this).find('a.link-tile-img').attr('href');
	});
	//Fonction de nettoyage qui enleve les non définis
	textLinks = scrape.cleanArray(textLinks, "undefineds");
	
	for(var i = 0;i<textLinks.length;i++){
		scrapeSpecificInfo(textLinks[i], (val) => {
			if(val["valid"]){
				
				if(val["image"] == undefined){
					val["image"] = "Photo_non_disponible.png";
				}
				
				evenements.push(val);
				console.log(evenements.length);
			}
		});
	}
	console.log("fin");
});




app.get('/', function(req,res){
	res.render("accueil.jade", {evens : evenements});
});

app.post('/txt', function (req, res) {
  res.send('POST request to homepage');
});
/*
Permet de récupérer les liens sur la page main. Les liens servent à obtenir plus d'information
*/
var update

//Recoit un site et renvoi les informations sur le site
var scrapeSpecificInfo = (element, callBack) => {
	var informations = [];
	var options = {uri: element, method:'GET',timeout:20000};

	//Faire une requete
	//Lorsque la requete est un succes, prendre les informations necessaires
	rp(options)
	.then(function(response) {

		var $ = cheerio.load(response);

		//Pour eviter le texte repetitif dans les if ci-dessous, je le met dans des vars
		var date = $('div.content-bottom.event-member span.info-item.calendar').text();
		var dateAlt =  $('div.content-right.content-column.clearfix.collapsed span.info-item.calendar').text();
		var adresse = $('div.content-bottom.event-member span.info-item.address').text();
		var adresseAlt = $('div.content-right.content-column.clearfix.collapsed span.info-item.address').text()
		var telephone = $('div.content-bottom.event-member span.info-item.telephone').text()
		var telephoneAlt = $('div.content-right.content-column.clearfix.collapsed span.info-item.telephone').text()

		var getGoodData = (v1, v2, v3) => {
			if(typeof v1 !== 'undefined' && v1 !== ""){
				return v1;
			}
			else if(typeof v2 !== 'undefined' && v2 !== ""){
				return v2;
			}
			else {
				return v3;
			}
		};
			
		//triage des données parce que le site web possede 2 set de la meme informations, certains sont définis
		//D'autres non
		
		informations[0] = getGoodData(date, dateAlt, $('span.info-item.calendar').text());
		informations[1] = getGoodData(adresse, adresseAlt, $('span.info-item.address').text());
		informations[2] = getGoodData(telephone, telephoneAlt, $('span.info-item.telephone').text());

		//Quand tout est obtenu, on utilise le callback pour envoyer le JSON avec validité vrai
		callBack({"name": $('span.breadcrumb_last').text(), "date": informations[0],
		"address" : informations[1], "telephone" : informations[2] , "website": $('span.info-item.website').find('a').attr('href'), "sujet": $(			'div[itemprop="description"]').text()
		, "image": $('div.attachment.feature-image').find('img').attr('src'), "source": element , "valid" : true});
	})
	//Dans les cas mauvais, timeout, envoyer un objet vide et l'indicateur de validité faux
	.catch(function(err){
		callBack({"uri" : element ,"valid":false});
	});
}

