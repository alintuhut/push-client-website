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

self.onmessage = function(e) {
  const channel = new BroadcastChannel('app-channel');
  channel.postMessage(`hello from sw ${e.data}`);
};

messaging.setBackgroundMessageHandler(function(payload) {
  console.log('Received background message ', payload);
  // Customize notification here
  const notificationTitle = 'Background Message Title';
  const notificationOptions = {
    body: payload.data.message,
    tag: 'request',
    actions: [{ action: 'yes', title: 'Yes' }, { action: 'no', title: 'No' }],
  };

  return self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );
});

const handlePush = async event => {
  await setTimeout(() => {
    console.log('subscription', event);
  }, 1000);
};

self.addEventListener('pushsubscriptionchange', event =>
  event.waitUntil(handlePush(event))
);

self.addEventListener('notificationclick', function(event) {
  console.log('On notification click: ', event.action);
});

navigator.permissions.query({name:'notification'}).then(function(permissionStatus) {
  console.log('notification permission state is ', permissionStatus.state);
  permissionStatus.onchange = function() {
    console.log('notification permission state has changed to ', this.state);
  };
});
