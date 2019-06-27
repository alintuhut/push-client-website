importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-messaging.js');

var firebaseConfig = {
  apiKey: "AIzaSyBAR5OWsAsKpDGdv5Pkupaw9J40bS5OY5w",
  authDomain: "push-client-website.firebaseapp.com",
  databaseURL: "https://push-client-website.firebaseio.com",
  projectId: "push-client-website",
  storageBucket: "",
  messagingSenderId: "893328877473",
  appId: "1:893328877473:web:9432a642dced1ef2"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.setBackgroundMessageHandler(function(payload) {
  console.log('Received background message ', payload);
  // Customize notification here
  const notificationTitle = 'Background Message Title';
  const notificationOptions = {
    body: payload.data.message,
    "tag": "request",
    "actions": [
      { "action": "yes", "title": "Yes" },
      { "action": "no", "title": "No" }
    ]
  };

  return self.registration.showNotification(notificationTitle,
      notificationOptions);
});

const handlePush = async (event) => {
  await setTimeout(() => {
    console.log('subscription', event);
  },1000);
}

self.addEventListener('pushsubscriptionchange', (event) =>
                      event.waitUntil(handlePush(event)));

self.addEventListener('message', function(event){
  console.log("SW Received Message: " + event.data);
});

function sendMessageToClient(client, msg){
  return new Promise((resolve, reject) => {
      var msgChannel = new MessageChannel();

      msgChannel.port1.onmessage = function(event){
          if(event.data.error){
              reject(event.data.error);
          }else{
              resolve(event.data);
          }
      };

      client.postMessage("SW Says: '"+msg+"'", [msgChannel.port2]);
  });
}

function sendMessageToAllClients(msg){
  clients.matchAll().then(clients => {
      clients.forEach(client => {
        sendMessageToClient(client, msg).then(m => console.log("SW Received Message: "+m));
      })
  })
}


sendMessageToAllClients('hello from sw');