self.addEventListener('notificationclick', function (event) {
  console.log('Notification action', event);

  const postDataBody = {
    app_id: 1,
    action: 'notification',
    //token,
    ua: navigator.userAgent,
    lang: navigator.language
  };

  postRequest(API_ENDPOINT, postDataBody).then(response => {
    console.log('Response', response);
  });

  event.notification.close();
});

importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-messaging.js');

var firebaseConfig = {
  apiKey: 'AIzaSyBAR5OWsAsKpDGdv5Pkupaw9J40bS5OY5w',
  authDomain: 'push-client-website.firebaseapp.com',
  databaseURL: 'https://push-client-website.firebaseio.com',
  projectId: 'push-client-website',
  storageBucket: '',
  messagingSenderId: '893328877473',
  appId: '1:893328877473:web:9432a642dced1ef2',
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

const API_ENDPOINT = 'https://app.movalio.com/api/event';

// in sw.js
self.addEventListener('message', event => {
  switch(e.data.action) {
    case 'show-notification':
      console.log('Show notification', e.data);
      if (e.data.notification) {
        return showNotification(e.data.notification.title, e.data.notification);
      }
  }
});

// self.onmessage = function(e) {

//   // const channel = new BroadcastChannel('app-channel');
//   // channel.postMessage(`hello from sw ${e.data}`);
// };

messaging.setBackgroundMessageHandler(function(payload) {
  console.log('Received background message ', payload);
  if (payload.notification) {
    return showNotification(payload.notification.title,  payload.notification);
  }
});

self.addEventListener("notificationclose", function(event) {
  console.log('notification close', event);
  // log send to server
});

function postRequest(url, data) {
  return fetch(url, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: new Headers({
      'Content-Type': 'application/json'
    }),
  }).then(response => response.json())
}

function showNotification(title, options) {
  const postDataBody = {
    app_id: 1,
    action: 'notification:show',
    //token,
    ua: navigator.userAgent,
    lang: navigator.language
  };
  postRequest(API_ENDPOINT, postDataBody);
  return self.registration.showNotification(title,  options);
}