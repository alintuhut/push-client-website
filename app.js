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

loadScript('https://www.gstatic.com/firebasejs/6.2.3/firebase-app.js');
loadScript('https://www.gstatic.com/firebasejs/6.2.3/firebase-messaging.js');

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
    messaging.usePublicVapidKey("BCPI-kjlPHSPpzH15AsX0YXwkHTp6lYK20W51TG1LTdJTJ_xnyr70fRBqNZFTaai8_6NkUqB8jkYed9ZX1mu0C8");
    await messaging.requestPermission();
    const token = await messaging.getToken();
    console.log('token is:', token);

    messaging.onMessage(payload => {
      console.log('Message received. ', payload);
      showLocalNotification('hello', payload.data.message, self.registration)
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

    firebase.messaging().useServiceWorker(registration);
    askForPermissionToReceiveNotifications();
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
  registerServiceWorker();
}

const init = async () => {
  await loadScript('https://www.gstatic.com/firebasejs/6.2.3/firebase-app.js');
  await loadScript('https://www.gstatic.com/firebasejs/6.2.3/firebase-messaging.js');
  initializeFirebase();
}

init();