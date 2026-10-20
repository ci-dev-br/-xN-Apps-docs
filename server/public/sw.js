// Service Worker para PWA e Web Push Notifications
self.addEventListener("install", event => {
    self.skipWaiting();
    console.log("Service worker installed");
});

self.addEventListener("activate", event => {
    event.waitUntil(self.clients.claim());
    console.log("Service worker activated");
});

self.addEventListener("push", event => {
    let data = {
        title: "Notificação CI",
        body: "Você possui uma nova notificação no sistema.",
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        actionUrl: "/meus-apps/apps"
    };

    if (event.data) {
        try {
            const json = event.data.json();
            data = { ...data, ...json };
        } catch {
            data.body = event.data.text() || data.body;
        }
    }

    const options = {
        body: data.body,
        icon: data.icon || "/favicon.ico",
        badge: data.badge || "/favicon.ico",
        data: {
            url: data.actionUrl || data.url || "/meus-apps/apps"
        }
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

self.addEventListener("notificationclick", event => {
    event.notification.close();
    const targetUrl = event.notification.data?.url || "/";

    event.waitUntil(
        clients.matchAll({ type: "window", includeUncontrolled: true }).then(windowClients => {
            for (let client of windowClients) {
                if (client.url.includes(targetUrl) && "focus" in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});
