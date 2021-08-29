const fs = require('fs');
let comfol = "./Commands";
let index = "./commandIndex.json";
let coms = fs.readdirSync(comfol);
let comlength = coms.length;

function comindex() {
  let template = {
    "commands": []
  }
  let sTemplate = JSON.stringify(template)
  fs.writeFileSync(index, sTemplate); //Cleaning existing file

  function pushToFile(name, call, pLevel) { //Push to JSON
    var rawFile = fs.readFileSync(index)
    var file = JSON.parse(rawFile);
    file['commands'].push({
      "file": `${name}`,
      "call": `${call}`,
      "pLevel": `${pLevel}`
    });
    sFile = JSON.stringify(file, null, 2);

    fs.writeFileSync(index, sFile);
  }

  for (i = 0; i < comlength; i++) { //Pushing commands to JSON
    let cmreq = require(`./Commands/${coms[i].toString()}`);
    let pl = 0
    if (cmreq.config.ownerOnly == 'Sim') {
      pl = 2
    } else if (cmreq.config.adminOnly == 'Sim') {
      pl = 1
    }

    pushToFile(coms[i].toString(), cmreq.config.name, pl)
  }
}

module.exports.comindex = comindex;
