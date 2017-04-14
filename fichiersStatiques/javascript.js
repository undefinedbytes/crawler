var send = () => {
	$.post( "/txt", { normallog: "", txt: $("#input-search").val() }).done(function( data ) {
		alert(data);
	});
}

var fillInfo = (data) => {
	document.getElementById("event-container").innerHTML = "";
	data.map((elem) => {
		var container = createDiv("", "event-object","");
		var img = createElement("img", "", "", "");
		img.setAttribute("src", elem.image);
		img.setAttribute("height", 250);
		img.setAttribute("alt", "Non disponible");
		container.appendChild(createDiv("", "event-object","image").appendChild(img));
		var texte = createDiv("", "text-zone", "");
		texte.appendChild(createDiv("", "name", elem.name));
		texte.appendChild(createDiv("", "date", elem.date));
		texte.appendChild(createDiv("", "address", elem.address));
		texte.appendChild(createDiv("", "phone", elem.telephone));
		var a = createElement("a", "", "", "Site Internet");
		a.setAttribute("href", elem.website);
		texte.appendChild(createDiv("", "website", "").appendChild(a));
		texte.appendChild(createDiv("", "sujet", elem.sujet));
		container.appendChild(texte);
		document.getElementById("event-container").appendChild(container);
	});
}

//crée un div
var createDiv = (id, classe, contain) => {
	var iDiv = document.createElement('div');
	iDiv.id = id;
	iDiv.className = classe;
	iDiv.innerHTML = contain;
	return iDiv;
}

//crée un object html d'un certain type 
var createElement = (type, id, classe, contain) => {
	var elem = document.createElement(type);
	elem.id = id;
	elem.className = classe;
	if(contain !== ""){elem.innerHTML = contain;}
	return elem;
}

function buildReceivedObject(object){


//Puisque je ne construit rien de dynamique et changeant, une string convient au site. Utiliser jquery/javascript complique la tâche.

var stringHtml = "<div class='event-object'><div class='image'><img src='"+ object.image
+"' height = '250' alt='Non disponible' onerror=this.src='Photo_non_disponible.png'></img></div><div class='text-zone'><div class='name'>"
+ object.name + "</div><div class='date'>" + object.date +
 "</div><div class='address'>" + object.address + "</div><div class='phone'>"
 + object.telephone + "</div><div class='website'><a href='" + object.website + "'>Site Internet</a>" +
"</div><div class='sujet'>" + object.sujet + "</div></div></div>";


    return stringHtml;
}

function buildStatus(compteur){

  var div = document.createElement("div")
  div.id = "status";
  div.className = "status";
  var statusText= document.createTextNode("Pages chargées : " + compteur);

  div.append(statusText);

  return div;


}

function appendEvenement(object){
  //Recoit object fait appel a buildReceivedObject dans javascript.js
  $('#event-container').append(buildReceivedObject(object));
}

function updateStatus(compteur){
  $('#status').remove();
document.getElementById("event-container").append(buildStatus(compteur));
}
