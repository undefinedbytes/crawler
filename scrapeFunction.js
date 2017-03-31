

module.exports = {

//Fonction de nettoyage, recoit un array plus le type de nettoyage à effectuer selon le type d'information
  cleanArray : function (oldArray, typeOfCleanUp) {

    var newArr = new Array();

    for(var i = 0; i < oldArray.length; i++){

      switch (typeOfCleanUp) {
        case "titles":
        oldArray[i] = oldArray[i].replace(/\t/g,'');
        oldArray[i] = oldArray[i].replace(/\n/g,' ');
        oldArray[i] = oldArray[i].replace(/\s+/g," ");
        if(/\S/.test(oldArray[i]) && oldArray[i].length < 200){
          newArr.push(oldArray[i]);
        }
        break;

        case "undefineds":
        if(typeof oldArray[i] !== 'undefined'){
          newArr.push(oldArray[i]);
        }
        break;

        default:
        nouveauArr = oldArray;
        console.log("ERREUR SWITCH");
        break;
      }
    }
    return newArr;
  }
,
    sizeError : function(lengthTitles, lengthLinks){
      if(lengthTitles !== lengthLinks){
        return 0;
        console.log("Size don't matches");
      }
      else
        return lengthLinks;
    }
,
    changerUndefinedDoubleArray : function(doubleArray){

      for(i in doubleArray){
        for(j in doubleArray[i]){
          if(typeof doubleArray[i][j] == "undefined" || doubleArray[i][j] === ""){
            doubleArray[i][j] = "Non disponible";
            }
          }
        }
      return doubleArray;
    }



,
    displayOnConsole : function(doubleArray){



      for(i in doubleArray){
        console.log(i);
        for(j in doubleArray[i]){
          console.log(doubleArray[i][j]);
          }
          console.log("\n");
        }


    }

}
