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

self.addEventListener('notificationclick', function(event) {
  console.log('Notification action', event);

  const postDataBody = {
    app_id: 1,
    action: 'notification',
    //token,
    ua: navigator.userAgent,
    lang: navigator.language
  };

  postRequest('https://app.movalio.com/api/event', postDataBody).then(response => {
    console.log('Response', response);
  });
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

self.addEventListener('fetch', function(event) {
  console.log('Fetch event:', event);
});

/*
* Overrides push notification data, to avoid having 'notification' key and firebase blocking
* the message handler from being called
*/
self.addEventListener('push', function (e) {
  // Skip if event is our own custom event
  if (e.custom) return;

  // Create a new event to dispatch
  var newEvent = new Event('push');
  newEvent.waitUntil = e.waitUntil.bind(e);
  newEvent.data = {
     json: function() {
         var newData = e.data.json();
         newData._notification = newData.notification;
         delete newData.notification;
         return newData;
     },
  };
  newEvent.custom = true;

  // Stop event propagation
  e.stopImmediatePropagation();

  // Dispatch the new wrapped event
  dispatchEvent(newEvent);
});
