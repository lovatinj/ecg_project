// Password : cCxn76eQdTVspIFt
// Login : jeremielovatin

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const fs = require('fs');
const { parse, isWithinInterval } = require('date-fns');

const TWILIO_SID = ""
const TWILIO_AUTH_TOEKN = ""

const twilio = require('twilio')(TWILIO_SID, TWILIO_AUTH_TOEKN)
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const { SerialPort } = require('serialport')
const port = new SerialPort({ path: '/dev/ttyACM1', baudRate: 9600 })
const fichierHistoriqueJSON = 'data.json';
const fichierInformationsJSON = 'informations.json'
var informationsJSON = {}
var wait = 0;
var ecg_wait = 0;

function formaterNumeroTelephone(numero) {
  const numeroNettoye = numero.replace(/\D/g, '');
  if (numeroNettoye.startsWith('0')) {
      return `+33${numeroNettoye.substring(1)}`;
  }
  return `+${numeroNettoye}`;
}

async function sendSMS(msg, phone){
  return twilio.messages.create({
    body: msg,
    from: "+18162988496",
    to: phone
  }).then(message => console.log(message)).catch(err => console.log(err))
}

if (!fs.existsSync(fichierHistoriqueJSON)){
  const jsonData = JSON.stringify([], null, 2);
  fs.writeFile(fichierHistoriqueJSON, jsonData, 'utf8', (err) => {
    if (err) {
        console.error('Erreur lors de l\'écriture du fichier :', err);
        return;
    }
    console.log(`Le fichier ${fichierHistoriqueJSON} a été crée avec succès.`);
  });
}

if (fs.existsSync(fichierInformationsJSON)){
  fs.readFile(fichierInformationsJSON, 'utf8', (err, data) => {
    if (err) {
        console.error('Erreur lors de la lecture du fichier JSON :', err);
        return;
    }

    const jsonData = JSON.parse(data);
    informationsJSON = jsonData
  });
}

io.on('connection', (socket) => {

  //console.log("Vous avez dépassé le BPM maximum enregistré qui est de " + informationsJSON["bpm"] + ". Veuillez ignorer ce message si vous effectuez un effort physique.", formaterNumeroTelephone(informationsJSON["phone"]));

  socket.on("get:data", (heures) => {
    console.log(heures)
    fs.readFile(fichierHistoriqueJSON, 'utf8', (err, data) => {
      if (err) {
          console.error('Erreur lors de la lecture du fichier JSON :', err);
          return;
      }
  
      const jsonData = JSON.parse(data);
      const heureDebut = parse(heures[0], 'HH:mm', new Date());
      const heureFin = parse(heures[1], 'HH:mm', new Date());
  
      const donneesFiltrees = jsonData.filter((donnees) => {
          const heureObjet = parse(donnees.date, 'HH:mm', new Date());
          return isWithinInterval(heureObjet, { start: heureDebut, end: heureFin });
      });
      
      socket.emit("set:data", donneesFiltrees);
      console.log('Données entre les heures :', donneesFiltrees);
    });
  })

  socket.on("set:information", data => {
    informationsJSON = data;
    fs.writeFile(fichierInformationsJSON, JSON.stringify(data, null, 2), 'utf8', (err) => {
      if (err) {
          console.error('Erreur lors de l\'écriture du fichier :', err);
          return;
      }
      console.log('Informations sauvegardées');
    });
  })

  socket.on("get:information", () => {
    fs.readFile(fichierInformationsJSON, 'utf8', (err, data) => {
      if (err) {
          console.error('Erreur lors de la lecture du fichier JSON :', err);
          return;
      }
  
      const jsonData = JSON.parse(data);
      
      socket.emit("post:information", jsonData);
    });
  })

  // fs.readFile(fichierHistoriqueJSON, 'utf8', (err, data) => {
  //   if (err) { console.error('Erreur lors de la lecture du fichier :', err); return; }
  //   let jsonData = JSON.parse(data);
  //   const date = new Date()
  //   const nouvellesDonnees = {
  //       hr: "456",
  //       hrv: "789",
  //       value: "23",
  //       date: ('0' + date.getHours()).slice(-2) + ':' + ('0' + (date.getMinutes()+1)).slice(-2)
  //   };
  //   jsonData.push(nouvellesDonnees);
  //   const updatedJsonData = JSON.stringify(jsonData, null, 2);
  //   fs.writeFile(fichierHistoriqueJSON, updatedJsonData, 'utf8', (writeErr) => {
  //       if (writeErr) {
  //           console.error('Erreur lors de l\'écriture du fichier :', writeErr);
  //           return;
  //       }
  //       console.log(`Le fichier ${fichierHistoriqueJSON} a été mis à jour avec succès.`);
  //   });
  // });
});

port.on('error', function(err) {
  console.log('Error: ', err.message)
})

port.on('readable', function () {
  //console.log(port.read().toString())
  const liste_valeurs = port.read().toString().split(",")
  try {
    const hr = liste_valeurs[0].substring(1)
    const hrv = liste_valeurs[1]
    const value = liste_valeurs[2].substring(0, liste_valeurs[2].length - 3)
    const affichage = [hr, hrv, value, new Date()]
    //console.log(liste_valeurs)
    console.log(affichage)
    var jsonData;
    if(wait == 1000){
      wait = 0;
      io.emit('messages', hr);

      fs.readFile(fichierHistoriqueJSON, 'utf8', (err, data) => {
        if (err) { console.error('Erreur lors de la lecture du fichier :', err); return; }
        jsonData = JSON.parse(data);
        const date = new Date()
        const nouvellesDonnees = {
            hr: hr,
            hrv: hrv,
            value: value,
            date: ('0' + date.getHours()).slice(-2) + ':' + ('0' + (date.getMinutes()+1)).slice(-2)
        };
        jsonData.push(nouvellesDonnees);

        if(jsonData.length >= 8140){
          jsonData.shift()
        }

        const updatedJsonData = JSON.stringify(jsonData, null, 2);

        //console.log(informationsJSON)
        //console.log(informationsJSON["bpm"])

        console.log(parseInt(hr))
        console.log(parseInt(jsonData["bpm"]))
        console.log(parseInt(jsonData["bpm"]) > parseInt(hr))

        if(hr > parseInt(jsonData["bpm"])){
          //TODO
          console.log("GEUIGLSRGGMBGIRBFGZIBSIYLBCFUMIFBVPQEVFBMIQUEVBMUIQEVBM")
          //sendSMS("Vous avez dépassé le BPM minimum enregistré qui est de " + informationsJSON["bpm"] + ". Veuillez ignorer ce message si vous effectuez un effort physique.", "+33672256315");
        }

        fs.writeFile(fichierHistoriqueJSON, updatedJsonData, 'utf8', (writeErr) => {
            if (writeErr) {
                console.error('Erreur lors de l\'écriture du fichier :', writeErr);
                return;
            }
            console.log(`Le fichier ${fichierHistoriqueJSON} a été mis à jour avec succès.`);
        });
      });
      //io.emit("messages", hr);

    }
    if(ecg_wait == 2){
      ecg_wait = 0;
      io.emit('ecg:value', affichage[2]);
    }
    wait++
    ecg_wait++
  } catch (error) {
    console.error('Une erreur s\'est produite :', error);
  }
})

app.use(express.static(path.join(__dirname, 'build')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

server.listen(3001, () => {
  console.log('Serveur en cours d\'écoute sur le port 3001');
});
