self.addEventListener('notificationclick', function (event) {
  console.log('Notification action', event);

  getData(app_id, 'movalio').then(result => {
    const postDataBody = {
      app_id,
      action: event ? 'notification:click' : 'notification:action',
      uuid: result,
    };

    postRequest(API_ENDPOINT, postDataBody).then(response => {

    }).catch(err => {
      console.log('ERROR', err);
    });
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

let db,
    app_id;

createIndexedDB('movalio', 1);

// in sw.js
self.addEventListener('message', e => {
  console.log('Receive post message in SW');
  switch(e.data.action) {
    case 'subscribe':
      app_id = e.data.app_id;
      postRequest(API_ENDPOINT, e.body).then(response => {
        storeData({ app_id, uuid: response });
      }).catch(err => {
        console.log('ERROR', err);
      });
      break;

    case 'unsubscribe':
      postRequest(API_ENDPOINT, e.data).then(response => {

      }).catch(err => {
        console.log('ERROR', err);
      });
      break;

    case 'prompt:show', 'prompt:accept', 'prompt:reject':
      postRequest(API_ENDPOINT, e.data).then(response => {

      }).catch(err => {
        console.log('ERROR', err);
      });
      break;

    case 'show-notification':
      console.log('Show notification', e.data);
      if (e.data.notification) {
        return showNotification(e.data.notification.title, e.data.notification);
      }
      break;

    case 'save-data':
        storeData(e.data.client, e.data.table);
      break;

    case 'get-data':
      postMessageToClients('BOSS');
      getData(1, 'movalio');
      break;
  }
});

messaging.setBackgroundMessageHandler(function(payload) {
  console.log('Received background message ', payload);
  if (payload.notification) {
    return showNotification(payload.notification.title,  payload.notification);
  }
});

self.addEventListener("notificationclose", function(event) {
  console.log('notification close', event);
  getData(app_id, 'movalio').then(result => {
    const postDataBody = {
      app_id,
      action: 'notification:close',
      uuid: result,
    };

    postRequest(API_ENDPOINT, postDataBody).then(response => {

    }).catch(err => {
      console.log('ERROR', err);
    });
  })
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
  getData(app_id, 'movalio').then(result => {
    const postDataBody = {
      app_id,
      action: 'notification:show',
      uuid: result,
    };

    postRequest(API_ENDPOINT, postDataBody).then(response => {

    }).catch(err => {
      console.log('ERROR', err);
    });
  });
  return self.registration.showNotification(title,  options);
}

function createIndexedDB(name, version) {
  var dbPromise = indexedDB.open(name, version);

  dbPromise.onerror = (e) => {
    console.log('There was an error:', e.target.errorCode);
  }

  dbPromise.onsuccess = (event) => {
    console.log('indexedDB success init');
    db = dbPromise.result;
    let tx = db.transaction('movalio', 'readwrite'),
    store = tx.objectStore('movalio'),
    index = store.index('token');

    db.onerror = function(e) {
      console.log('ERROR', e.target.errorCode);
    }

    tx.oncomplete = function() {
      //db.close();
    }
  };

  dbPromise.onupgradeneeded = function(event) {
    let db = dbPromise.result,
        store = db.createObjectStore('movalio', { keyPath: 'app_id' }),
        index = store.createIndex('token', 'token', { unique: true });
  }
}

function storeData(data, table) {
  var update = db.transaction(table, 'readwrite').objectStore(table).put(data);

  update.onerror = function (event) {
      console.log(event);
  }

  update.onsuccess  = function (event) {
    console.log('SUCCESS to save in indexedDB');
  }
}

function getData(key, table) {
  return new Promise((resolve, reject) => {
    let data = db.transaction(table, 'readwrite').objectStore(table).get(key);

    data.onsuccess = function() {
      console.log(data.result);
      resolve(data.result)
    };

    data.onerror = function(error) {
      reject(error);
    }
  });
}

function postMessageToClients(message) {
  const channel = new BroadcastChannel('app-channel');
  channel.postMessage(message);
}