importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-messaging.js');

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

const messaging = firebase.messaging();