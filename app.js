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
};

const askForPermissionToReceiveNotifications = async () => {
  const messaging = firebase.messaging();
  messaging
    .requestPermission()
    .then(function () {
      console.log("Notification permission granted.");

      // get the token in the form of promise
      return messaging.getToken()
    })
    .then(function(token) {
      console.log("token is : " + token);
    })
    .catch(function (err) {
    console.log("Unable to get permission to notify.", err);
  });
};

const check = () => {
  if (!('serviceWorker' in navigator)) {
    throw new Error('No Service Worker support!');
  }
  if (!('PushManager' in window)) {
    throw new Error('No Push API Support!');
  }
};

const main = async () => {
  check();
  initializeFirebase();
  askForPermissionToReceiveNotifications();
};
// main(); we will not call main in the beginning.
