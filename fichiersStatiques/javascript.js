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