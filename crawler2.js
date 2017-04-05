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
var searchKey = "";
var allSended = false;

app.use(express.static('fichiersStatiques'));

app.get('/', function(req,res){
  //Input search de l'utilsateur, si les elements sont tous chargés, on peut effectuer un autre envoi
  io.on('connection', function(socket){
    socket.on('search', function(search){
      searchKey = search;
      //Si tous chargés, sinon, le serveur envoi l'info en respectant la recherche mais ne refais pas
      //un autre envoi au client
      if(allSended){
        sendToClient(evenements);
      }
      });
  });
  res.sendFile( __dirname + "/acceuil.html");
  console.log("Here");


  //scrapeWebPage recupere les liens sur la page d'acceuil du site d'evenemtns
  //Function qui se fait callback avec une liste de liens
  scrapeWebPage( function(linkList) {

    console.log(linkList.length);

    //scrapeSpecificInfo recoit comme argument la liste de liens des pages a trouver
    //Le callback recoit un evenement sous forme d'objet
    scrapeSpecificInfo(linkList, function(singleInfoObject){

      //scrapeSpecificInfo renvoi un objet evenement, buildMainObject construit l'objet principal des evenemnts
      buildMainObject(singleInfoObject, linkList.length);
    });

  });

});

http.listen(PORT);


/*Lorsque le compteur est équivalent a la longueur de l'array, les éléments sont chargés.
À partie de ce moment, je peux travailler sur les éléments un par un
Les éléments d'information sont l'url de source, le nom, l'adresse, # de téléphone, l'url évènement,
date, un résumé, et un lien image.
*/
//Chaque fois que la fonction recoi un objet, un compteur est incrementé
//Si la longueur de l'array de lien est egal au compteur, cela indique que tous les liens sont chargées

function buildMainObject(object, length){

  compteur++;
  console.log("fichiers chargés : " + compteur);

  //Affichage du nombre de pages chargés sur le doc
  io.emit('loading', compteur);
  //Push l'objet event dans un array d'evenements principal
  evenements.push(object);


  //lorsque length sont égaux, toutes les pages sont chargées
  if(compteur >= length) {
    console.log("All files loaded total : " + evenements.length);
    evenements = scrape.changerUndefinedDoubleArray(evenements);
    sendToClient(evenements);
  }
}

//Lorsque que compteur == liens length, on peut envoyer au client, on utilise socket.io pour emettre un broadcast
function sendToClient(evenements){
  var indexSansImage = [];

//On parcoure tous les evenemtns
  for(i in evenements){

//Si certain ont timeout, on ne les prend pas, les objets timedout on un boolean indiquant faux
    if(evenements[i].valid){
      //Si correspond à la clé de recherche
      if(isSearched(evenements[i]))
      {
        //Dans les cas des images non disponible, on les envois à la fin
        //L'index i est mit dans un array lorsque pas d'image
        if(evenements[i].image == "Non disponible"){
          indexSansImage.push(i);
        }
        else
        //Si tout eest correct send au client
        io.emit('info loaded', evenements[i]);
      }
    }
  }
  //Les evemements sans images sont mise à la fin. Le tableau de pointeur permet de choisir les events
  for(i in indexSansImage){
    if(evenements[indexSansImage[i]].valid)
    io.emit('info loaded', evenements[indexSansImage[i]]);
  }
  //Change l'état allSended. Permet à la recherche d'effectuer un autre envois si tout est chargé
  allSended = true;
}

//Permet de renvoyer un boolean qui indique si l'élément correspond à la clé
function isSearched(array){
  //  console.log(searchKey);
  //Cas de recherche vide
  if(searchKey === ""){
    return true;
  }
  //Si contient cle de recherche, renvoi true
  for(var i in array){
    if(typeof array[i] === 'string'){
      if(array[i].includes(searchKey)){
        return true;
      }
    }
  }
  return false;
}




/*
Permet de récupérer les liens sur la page main. Les liens servent à obtenir plus d'information
*/
function scrapeWebPage(callBackFirst){
  var textLinks = [];

  //Faire une requete avec url comme parametre, url est défini en haut, global.
  request (url, function(err, resp, body) {
    if(err){
      //compteur++;
      return console.error(err);}

      //Librairie cheerio permet de chargé le corps de la page web dans une variable
      var $ = cheerio.load(body);

      //Pour chacun des liens, on les sauvegardes dans un array
      $('div.link-tile').each( function(index,element){
        textLinks[index] = $(this).find('a.link-tile-img').attr('href');
      });
      //Fonction de nettoyage qui enleve les non définis
      textLinks = scrape.cleanArray(textLinks, "undefineds");

      //à la fin, on utilise la fonction de claaback, avec l'array des liens comme arguments
      callBackFirst(textLinks);
    });
  }


  //Recoit l'array de liens et fait les requetes individuelles
  function scrapeSpecificInfo(linkList,callBackSecond) {
    //Pour chaque element
    linkList.forEach(function (element) {
      var informations = [];
      var options = {uri: element, method:'GET',timeout:20000};

      //Faire une requete
      rp(options)
      //Lorsque la requete est un succes, prendre les informations necessaires
      .then(function(response) {

        var $ = cheerio.load(response);

        //Pour eviter le texte repetitif dans les if ci-dessous, je le met dans des vars
        var date = $('div.content-bottom.event-member span.info-item.calendar').text();
        var dateAlt =  $('div.content-right.content-column.clearfix.collapsed span.info-item.calendar').text();
        var adresse = $('div.content-bottom.event-member span.info-item.address').text();
        var adresseAlt = $('div.content-right.content-column.clearfix.collapsed span.info-item.address').text()
        var telephone = $('div.content-bottom.event-member span.info-item.telephone').text()
        var telephoneAlt = $('div.content-right.content-column.clearfix.collapsed span.info-item.telephone').text()

        //triage des données parce que le site web possede 2 set de la meme informations, certains sont définis
        //D'autres non
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

        //Quand tout est obtenu, on utilise le callback pour envoyer le JSON avec validité vrai
        callBackSecond({name: $('span.breadcrumb_last').text(), date: informations[0],
        address : informations[1], telephone : informations[2] , website: $('span.info-item.website').find('a').attr('href'), sujet: $('div[itemprop="description"]').text()
        , image: $('div.attachment.feature-image').find('img').attr('src'), source: element , valid : true});
        //sujet: $('div.content-body-inner.content-styles').text()
      })
      //Dans les cas mauvais, timeout, envoyer un objet vide et l'indicateur de validité faux
      .catch(function(err){
        console.log(err);

        callBackSecond({valid:false});

      });
    });
  }

/*
name: "Non disponible", date: "Non disponible", address : "Non disponible",
telephone : "Non disponible", website: "Non disponible", sujet: "Non disponible"
,image: "Non disponible", source: element,
*/
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
