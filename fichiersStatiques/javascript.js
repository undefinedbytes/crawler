var fillInfo = (data) => {
	document.getElementById("event-container").innerHTML = "";
	data.map((elem) => {
		var container = createDiv("", "event-object","");
		var imgdiv = createDiv("", "image","");
		var img = createElement("img", "", "", "");
		img.setAttribute("src", elem.image);
		img.setAttribute("height", 180);
		img.setAttribute("alt", "Non disponible");
		imgdiv.appendChild(img);
		container.appendChild(imgdiv);
		var texte = createDiv("", "text-zone", "");
		texte.appendChild(createDiv("", "name", elem.name));
		texte.appendChild(createDiv("", "date", elem.date));
		texte.appendChild(createDiv("", "address", elem.address));
		if (elem.telephone){
			texte.appendChild(createDiv("", "phone", "Tél: "+elem.telephone));
		}
		texte.appendChild(createDiv("", "sujet", elem.sujet));
		var adiv = createDiv("", "website", "");
		var a = createElement("a", "", "button", "Site Internet");
		a.setAttribute("href", elem.website);
		adiv.appendChild(a);
		texte.appendChild(adiv);
		
		container.appendChild(texte);
		
		document.getElementById("event-container").appendChild(container);
	});
	
	var br = createElement("br", "", "", "");
	br.setAttribute("style", "clear: both;");
	document.getElementById("event-container").appendChild(br);	
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