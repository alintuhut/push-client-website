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

      const response = await postRequest('https://app.movalio.com/api/event', postDataBody);

      console.log('Post response', response);

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
          navigator.serviceWorker.ready.then(registration => {
              showLocalNotification(
                  'hello',
                  payload.data.message,
                  registration
              );
          });
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

  const channel = new BroadcastChannel('app-channel');
  channel.onmessage = function(e) {
      console.log('In app.js:', e.data);
  };

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
          const messageChannel = new MessageChannel();
          if (navigator.serviceWorker.controller) {
              navigator.serviceWorker.controller.postMessage(
                  'hello from app.js',
                  [messageChannel.port2]
              );
          }
      });
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

const askForPermission = async () => {
  check();
  askForPermissionToReceiveNotifications();
};

function postRequest(url, data) {
  return fetch(url, {
    credentials: 'omit', // 'include', default: 'omit'
    method: 'POST', // 'GET', 'PUT', 'DELETE', etc.
    body: JSON.stringify(data), // Coordinate the body type with 'Content-Type'
    headers: new Headers({
      'Content-Type': 'application/json'
    }),
  }).then(response => response.json())
}

const init = async () => {
  window.__MOVALIO_INSTANCE__ = this;
  await loadDependencies();
  initializeFirebase();
  check();
  registerServiceWorker();
};

let messaging = null;

init();
