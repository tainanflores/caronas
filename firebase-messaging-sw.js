// firebase-messaging-sw.js
importScripts("https://www.gstatic.com/firebasejs/10.12.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.1/firebase-messaging-compat.js");


// Substitua com os dados reais do seu Firebase
firebase.initializeApp({
    apiKey: "AIzaSyCefSZfaZj5mKSowZUYhwE-5V9nBc04GiE",
    authDomain: "caronastj.firebaseapp.com",
    projectId: "caronastj",
    storageBucket: "caronastj.firebasestorage.app",
    messagingSenderId: "837892083232",
    appId: "1:837892083232:web:63f3b7299bafef95df3645"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(payload => {
    const notificationTitle = payload.data.title;
    const notificationOptions = {
        body: payload.data.body,
        icon: '/icons/icon-192.png', // Seu ícone
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
