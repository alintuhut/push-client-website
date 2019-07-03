function loadScript(url) {
  return new Promise(resolve => {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = url;
      script.onload = function() {
          resolve(true);
      };
      document.head.appendChild(script);
  });
}

async function loadDependencies() {
  await loadScript(
      'https://www.gstatic.com/firebasejs/6.2.3/firebase-app.js'
  );
  await loadScript(
      'https://www.gstatic.com/firebasejs/6.2.3/firebase-messaging.js'
  );

  return true;
}

const initializeFirebase = () => {
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
  messaging = firebase.messaging();
};

const askForPermissionToReceiveNotifications = async () => {
  try {
      const permission = await Notification.requestPermission();

      console.log('Event notification prompt', permission);

      const token = await messaging.getToken();
      console.log('token is:', token);

      const postDataBody = {
        app_id: 1,
        action: 'subscribe',
        token,
        ua: navigator.userAgent,
        lang: navigator.language
      };

      const uuid = await postRequest('https://app.movalio.com/api/event', postDataBody);

       storeData({token, uuid});

      return token;
  } catch (error) {
      console.error(error);
  }
};

const registerServiceWorker = async () => {
  try {
      const registration = await navigator.serviceWorker.register('sw.js');

      console.log('Service worker successfully registered.', registration);

      messaging.useServiceWorker(registration);
      messaging.usePublicVapidKey(
          'BCPI-kjlPHSPpzH15AsX0YXwkHTp6lYK20W51TG1LTdJTJ_xnyr70fRBqNZFTaai8_6NkUqB8jkYed9ZX1mu0C8'
      );

      askForPermissionToReceiveNotifications();

      messaging.onMessage(payload => {
          console.log('Message received. ', payload);

          console.log('Sending post message');

          postMessageToSW({action: 'show-notification', ...payload});
      });

      messaging.onTokenRefresh(() => {
          try {
              const refreshedToken = messaging.getToken();
              console.log('Token refreshed.', refreshedToken);
          } catch (error) {
              console.log('Unable to retrieve refreshed token ', error);
          }
      });

      navigator.permissions
          .query({ name: 'notifications' })
          .then(function(permissionStatus) {
              console.log(
                  'notifications permission state is ',
                  permissionStatus.state
              );
              permissionStatus.onchange = function() {
                  console.log(
                      'notifications permission state has changed to ',
                      this.state
                  );
              };
          });
  } catch (error) {
      console.error('Unable to register service worker.', error);
  }
};

const check = () => {
  if (!('serviceWorker' in navigator)) {
      throw new Error('No Service Worker support!');
  }
  if (!('PushManager' in window)) {
      throw new Error('No Push API Support!');
  }
  if (!('indexedDB' in window)) {
    throw new Error('No indexedDB Support!');
  } else {
    createIndexedDB('web-pusher');
  }
};

const showLocalNotification = (title, body, swRegistration) => {
  const options = {
      body,
      tag: 'request',
      actions: [
          { action: 'yes', title: 'Yes' },
          { action: 'no', title: 'No' },
      ],
  };
  swRegistration.showNotification(title, options);
};

function postRequest(url, data) {
  return fetch(url, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: new Headers({
      'Content-Type': 'application/json'
    }),
  }).then(response => response.json())
}

function postMessageToSW(message) {
  navigator.serviceWorker.ready
  .then(function(serviceWorkerRegistration) {
      // Let's see if you have a subscription already
      return serviceWorkerRegistration.pushManager.getSubscription();
  })
  .then(function(subscription) {
      if (!subscription) {
          // You do not have subscription
      }
      // You have subscription.
      // Send data to service worker
      if (navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage(message);
      }
  });
}

function createIndexedDB(name) {
  var dbPromise = indexedDB.open(name, 1);

  dbPromise.onerror - function(e) {
    console.log('There was an error:', e.target.errorCode);
  }

  dbPromise.onsuccess = function(event) {
    console.log('indexedDB success init');
    db = dbPromise.result;
    tx = db.transaction('clients', 'readwrite');
    store = tx.objectStore('clients');
    index = store.index('token');

    db.onerror = function(e) {
      console.log('ERROR', e.target.errorCode);
    }

    tx.oncomplete = function() {
      db.close();
    }
  };

  dbPromise.onupgradeneeded = function(event) {
    let db = dbPromise.result,
        store = db.createObjectStore('clients', { keyPath: 'token' }),
        index = store.createIndex('token', 'token', { unique: true });
  }
}

function storeData(data) {
  store.put(data);
}

function getData(key) {
  let data = index.get(key);

  data.onsuccess = function() {
    console.log(data.result);
  }
}

function readData(table) {
  dbPromise.then(function(db) {
    var tx = db.transaction(table, 'readonly');
    var store = tx.objectStore(table);
    return store.get();
  }).then(function(val) {
    console.dir(val);
  });
}

function initPostMessageListener() {
  const channel = new BroadcastChannel('app-channel');
  channel.onmessage = function(e) {
      console.log('In app.js:', e.data);
  };
}

const init = async () => {
  window.__MOVALIO_INSTANCE__ = this;
  await loadDependencies();
  initializeFirebase();
  initPostMessageListener();
  check();
  registerServiceWorker();
};

let messaging = null;
let db = null,
    tx,
    store,
    index;

init();
