function loadScript(url) {
  var script = document.createElement('script');
  script.src = url;
  document.head.appendChild(script);
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

    return token;
  } catch (error) {
    console.error(error);
  }
}

const registerServiceWorker = () => {
  navigator.serviceWorker
  .register('sw.js')
  .then(function(registration) {
             console.log('Service worker successfully registered.');
             return registration;
         })
  .then((registration) => {
      firebase.messaging().useServiceWorker(registration);

      askForPermissionToReceiveNotifications();

      })
  .catch(function(err) {
    console.error('Unable to register service worker.', err);
  });
}

const check = () => {
  if (!('serviceWorker' in navigator)) {
    throw new Error('No Service Worker support!')
  }
  if (!('PushManager' in window)) {
    throw new Error('No Push API Support!')
  }
}

const main = async () => {
  check();
  askForPermissionToReceiveNotifications();
}
setTimeout(() => {
  initializeFirebase();
  registerServiceWorker();
}, 2000)
// main(); we will not call main in the beginning.