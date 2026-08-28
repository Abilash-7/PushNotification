self.addEventListener(
    "install",
    (event) => {

        console.log(
            "Push Service Worker installed"
        );

        self.skipWaiting();

    }
);


self.addEventListener(
    "activate",
    (event) => {

        console.log(
            "Push Service Worker activated"
        );

        event.waitUntil(
            self.clients.claim()
        );

    }
);


// ==========================================
// RECEIVE PUSH
// ==========================================

self.addEventListener(
    "push",
    (event) => {

        console.log(
            "Push notification received"
        );


        let data = {

            title:
                "New Notification",

            body:
                "You have a new notification.",

            icon:
                "/logo192.png",

            badge:
                "/logo192.png",

            data: {

                url:
                    "/dashboard"

            }

        };


        try {

            if (event.data) {

                data =
                    event.data.json();

            }

        }

        catch (error) {

            console.error(
                "Push data parsing error:",
                error
            );

        }


        const title =
            data.title ||
            "New Notification";


        const options = {

            body:
                data.body ||
                "You have a new notification.",

            icon:
                data.icon ||
                "/logo192.png",

            badge:
                data.badge ||
                "/logo192.png",

            data:
                data.data || {
                    url:
                        "/dashboard"
                },

            vibrate: [
                200,
                100,
                200
            ],

            tag:
                "push-notification",

            renotify:
                true

        };


        event.waitUntil(

            self.registration
                .showNotification(
                    title,
                    options
                )

        );

    }
);


// ==========================================
// CLICK NOTIFICATION
// ==========================================

self.addEventListener(
    "notificationclick",
    (event) => {

        event.notification.close();


        const url =
            event.notification
                .data?.url ||
            "/dashboard";


        event.waitUntil(

            clients.matchAll({

                type:
                    "window",

                includeUncontrolled:
                    true

            })

            .then(
                (clientList) => {

                    for (
                        const client
                        of clientList
                    ) {

                        if (
                            "focus" in client
                        ) {

                            client.navigate(
                                url
                            );

                            return client.focus();

                        }

                    }


                    if (
                        clients.openWindow
                    ) {

                        return clients.openWindow(
                            url
                        );

                    }

                }
            )

        );

    }
);