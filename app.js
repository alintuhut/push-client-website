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
  await loadScript('https://www.gstatic.com/firebasejs/6.2.3/firebase-app.js');
  await loadScript('https://www.gstatic.com/firebasejs/6.2.3/firebase-messaging.js');

  return true;
}

const initializeFirebase = () => {
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
}

const askForPermissionToReceiveNotifications = async () => {
  try {
    const messaging = firebase.messaging();
    await messaging.requestPermission();
    const token = await messaging.getToken();
    console.log('token is:', token);

    messaging.onMessage(payload => {
      console.log('Message received. ', payload);
      navigator.serviceWorker.register('sw.js').then(registration => {
        showLocalNotification('hello', payload.data.message, registration)
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

    return token;

  } catch (error) {
    console.error(error);
  }
}

const registerServiceWorker = async () => {
  try {
    const registration = await navigator.serviceWorker.register('sw.js');

    console.log('Service worker successfully registered.', registration);
    askForPermissionToReceiveNotifications();
    const messaging = firebase.messaging();
    messaging.useServiceWorker(registration);
    messaging.usePublicVapidKey("BCPI-kjlPHSPpzH15AsX0YXwkHTp6lYK20W51TG1LTdJTJ_xnyr70fRBqNZFTaai8_6NkUqB8jkYed9ZX1mu0C8");


    navigator.serviceWorker.ready.then(serviceWorkerRegistration => {
      const options = {userVisibleOnly: true};
      serviceWorkerRegistration.pushManager.subscribe(options).then(pushSubscription => {
        // Send subscription to service worker to save it.
        navigator.serviceWorker.controller.postMessage({
          action: 'REQUEST_SUBSCRIPTION',
          subscription: pushSubscription
        });
        // Upload first subscription to server using userId or any identifier
        // to match user.
        console.log('subscription app.js ', pushSubscription);
      });
    });

  } catch (error) {
    console.error('Unable to register service worker.', error);
  }
}

const check = () => {
  if (!('serviceWorker' in navigator)) {
    throw new Error('No Service Worker support!')
  }
  if (!('PushManager' in window)) {
    throw new Error('No Push API Support!')
  }
}

const showLocalNotification = (title, body, swRegistration) => {
  const options = {
    body,
    "tag": "request",
    "actions": [
      { "action": "yes", "title": "Yes" },
      { "action": "no", "title": "No" }
    ]
  };
  swRegistration.showNotification(title, options);
}

const askForPermission = async () => {
  check();
  askForPermissionToReceiveNotifications();
}

const init = async () => {
  await loadDependencies();
  initializeFirebase();
  registerServiceWorker();
}

init();