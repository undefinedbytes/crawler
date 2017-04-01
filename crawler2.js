//Imports
const request = require('request');
const rp = require('request-promise');
const cheerio = require('cheerio');
//Imports et Param server
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);


const PORT =1234;
//Import et Param files
const fs = require('fs')
//Imports mes fonctions
const scrape = require('./scrapeFunction.js');

//Paramètres urls
var url = "https://www.tourismeottawa.ca/evenements/";
var compteur = 0;
var timeOut = false;
var evenements = [];


app.use(express.static('fichiersStatiques'));

app.get('/', function(req,res){

  res.sendFile( __dirname + "/acceuil.html");
  console.log("Here");
  //res.set('Content-Type', 'text/html; charset=utf-8');

  scrapeWebPage( function(linkList) {




    console.log(linkList.length);

    scrapeSpecificInfo(linkList, function(singleInfoObject){

      compteur++;
      console.log("fichiers chargés : " + compteur);

      //Affichage du nombre de pages chargés sur le doc
      io.emit('loading', compteur);
      //Push l'objet event dans un array d'evenements principal
      evenements.push(singleInfoObject);

      if(compteur >= (linkList.length)) {
        console.log("All files loaded total : " + evenements.length);
        evenements = scrape.changerUndefinedDoubleArray(evenements);


        for(i in evenements){
          if(evenements[i].valid)
          io.emit('info loaded', evenements[i]);
        }

      }

      /*Lorsque le compteur est équivalent a la longueur de l'array, les éléments sont chargés.
      À partie de ce moment, je peux travailler sur les éléments un par un
      Les éléments d'information sont l'url de source, le nom, l'adresse, # de téléphone, l'url évènement,
      date, un résumé, et un lien image.
      */

    });
  });
});

http.listen(PORT);



/*
Permet de récupérer les liens sur la page main. Les liens servent à obtenir plus d'information
*/
function scrapeWebPage(callBackFirst){
  var textLinks = [];

  request (url, function(err, resp, body) {
    if(err){
      compteur++;
      return console.error(err);}

      var $ = cheerio.load(body);

      $('div.link-tile').each( function(index,element){
        textLinks[index] = $(this).find('a.link-tile-img').attr('href');
      });

      textLinks = scrape.cleanArray(textLinks, "undefineds");

      callBackFirst(textLinks);
    });
  }



  function scrapeSpecificInfo(linkList,callBackSecond) {
    linkList.forEach(function (element) {
      var informations = [];
      var options = {uri: element, method:'GET',timeout:20000};

      rp(options)
      .then(function(response) {

        var $ = cheerio.load(response);

        //div.content-bottom.event-member
        //div.content-right.content-column.clearfix.collapsed


        var date = $('div.content-bottom.event-member span.info-item.calendar').text();
        var dateAlt =  $('div.content-right.content-column.clearfix.collapsed span.info-item.calendar').text();
        var adresse = $('div.content-bottom.event-member span.info-item.address').text();
        var adresseAlt = $('div.content-right.content-column.clearfix.collapsed span.info-item.address').text()
        var telephone = $('div.content-bottom.event-member span.info-item.telephone').text()
        var telephoneAlt = $('div.content-right.content-column.clearfix.collapsed span.info-item.telephone').text()




        if(typeof date !== 'undefined' && date !== "")
        {
        informations[0] =  date;
        }
        else {
          if(typeof dateAlt !== 'undefined' && dateAlt !== ""){
            informations[0] = dateAlt;
          } else {
            informations[0] = $('span.info-item.calendar').text();
          }
        }

        if(typeof adresse !== 'undefined' && adresse !== "")
        {
        informations[1] =  adresse;
        }
        else {
          if(typeof adresseAlt !== 'undefined' && adresseAlt !== ""){
            informations[1] = adresseAlt

          } else {
            informations[1] = $('span.info-item.address').text();
          }
        }

        if(typeof telephone !== 'undefined' && telephone !== "")
        {
        informations[2] =  telephone;
        }
        else {
          if(typeof telephoneAlt !== 'undefined' && telephoneAlt !== ""){
            informations[2] = telephoneAlt

          } else {
            informations[2] = $('span.info-item.telephone').text();
          }
        }

      callBackSecond({name: $('span.breadcrumb_last').text(), date: informations[0],
      address : informations[1], telephone : informations[2] , website: $('span.info-item.website').find('a').attr('href'), sujet: $('div[itemprop="description"]').text()
      , image: $('div.attachment.feature-image').find('img').attr('src'), source: element , valid : true});
      //sujet: $('div.content-body-inner.content-styles').text()
    })
    .catch(function(err){
      console.log(err);

      callBackSecond({name: "Non disponible", date: "Non disponible", address : "Non disponible",
      telephone : "Non disponible", website: "Non disponible", sujet: "Non disponible"
      ,image: "Non disponible", source: element, valid:false});

    });
  });
}

//Pour observer le contenu à la console
/*
console.log(element);
console.log($('span.breadcrumb_last').text());
console.log($('span.info-item.address').text());
console.log($('span.info-item.telephone').text());
console.log($('span.info-item.website').find('a').attr('href'));
console.log($('span.info-item.calendar').text());
console.log($('div.content-body-inner.content-styles').text());
console.log($('div.attachment.feature-image').find('img').attr('src'));
console.log("\n");
*/
//Send l'array à callback qui push cet objet dans un array principal
/*

*/
