// firebase-messaging-sw.js
importScripts("https://www.gstatic.com/firebasejs/10.12.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.1/firebase-messaging-compat.js");
import { firebaseConfig } from "./firebaseConfig.js";


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
