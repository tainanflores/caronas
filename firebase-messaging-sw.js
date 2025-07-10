// firebase-messaging-sw.js
importScripts("https://www.gstatic.com/firebasejs/10.12.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.1/firebase-messaging-compat.js");

const firebaseConfig = {
    apiKey: "AIzaSyCefSZfaZj5mKSowZUYhwE-5V9nBc04GiE",
    authDomain: "caronastj.firebaseapp.com",
    projectId: "caronastj",
    storageBucket: "caronastj.firebasestorage.app",
    messagingSenderId: "837892083232",
    appId: "1:837892083232:web:63f3b7299bafef95df3645"
};
// Substitua com os dados reais do seu Firebase
firebase.initializeApp({
    firebaseConfig
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    self.registration.showNotification(payload.notification.title, {
        body: payload.notification.body,
        icon: '/icons/icon-192.png'
    });
});
