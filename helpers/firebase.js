const config = require("../config");
const firebase = require('firebase');
if(config.firebase == true){
    firebase.initializeApp(config.firebaseConfig);
} else {
    console.log("firebase is not enabled");
}


async function writeifnot(uid, username){
    if(config.firebase == true){
        const dataName = uid.toString()
        var ref = firebase.database().ref('userIds/');
        await ref.on("value", async function(result) {
            if (result.val().hasOwnProperty(dataName)){
                return true;
            } else {
                await firebase.database().ref('userIds/' + dataName).set({
                    username : username,
                    userId : uid
                }, function (err) {
                    if(err) {
                        console.log(err)
                    } else {
                        console.log('Saved user id ' + uid)
                    }
                })
            }
            }, function (error) {
                console.log("Error: " + error.code);
            }
        );
    } else {
        console.log('Firebase logging not enabled. Only enable if you want to log your users. And make sure that you have given every parameters. Read the documentation if you want to do this. https://www.github.com/dcdunkan/pastebin-bot/blob/v2/')
    }
}

function getUids(){
  const ref = firebase.database().ref('userIds')
  const getUidsPromise = new Promise(function(resolve, reject){
    ref.on('value', function(snap) {
      data = snap.val();
      const uids = []
      Object.values(data).forEach((element) => {
        uids.push(element.userId)
      })
      resolve(uids);
    });
  });
  return getUidsPromise;
}

module.exports = { writeifnot, getUids }
