
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
