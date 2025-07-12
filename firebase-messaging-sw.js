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
        icon: '/icons/icon-192.png',
        data: {
            title: payload.data.title,
            body: payload.data.body
        }
    };

    self.registration.showNotification(notificationTitle, notificationOptions);

});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();

    const data = event.notification.data || {};

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(async function (clientList) {
            let client = clientList.find(c => c.url.includes('http://127.0.0.1:5500/') && 'focus' in c);

            const msg = { action: 'save-notification', ...data };

            if (client) {
                client.focus();
                client.postMessage(msg);
            } else {
                const newClient = await clients.openWindow('http://127.0.0.1:5500/');
                setTimeout(() => {
                    newClient?.postMessage(msg);
                }, 1000);
            }
        })
    );
});


