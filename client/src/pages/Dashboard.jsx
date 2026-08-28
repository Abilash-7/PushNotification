import React, { useState, useEffect } from "react";
import API from "../api/api";


function Dashboard() {

    const [permission, setPermission] =
        useState(
            "Notification" in window
                ? Notification.permission
                : "unsupported"
        );


    const [subscribed, setSubscribed] =
        useState(false);


    const [message, setMessage] =
        useState("");


    const [loading, setLoading] =
        useState(false);


    useEffect(() => {

        initializePush();

    }, []);


    // ==========================================
    // INITIALIZE
    // ==========================================

    // const initializePush =
    //     async () => {

    //         try {

    //             if (
    //                 !("serviceWorker" in navigator)
    //             ) {

    //                 setMessage(
    //                     "Service Worker is not supported"
    //                 );

    //                 return;
    //             }


    //             if (
    //                 !("PushManager" in window)
    //             ) {

    //                 setMessage(
    //                     "Push notifications are not supported"
    //                 );

    //                 return;
    //             }


    //             const registration =
    //                 await navigator.serviceWorker.register(
    //                     "/sw.js"
    //                 );


    //             console.log(
    //                 "Service Worker registered:",
    //                 registration
    //             );


    //             const existingSubscription =
    //                 await registration
    //                     .pushManager
    //                     .getSubscription();


    //             if (
    //                 existingSubscription
    //             ) {

    //                 setSubscribed(true);

    //             }

    //         }

    //         catch (error) {

    //             console.error(
    //                 "Push initialization error:",
    //                 error
    //             );

    //         }

    //     };

const initializePush = async () => {
    try {
        if (!("Notification" in window)) {
            setPermission("unsupported");
            return;
        }

        if (!("serviceWorker" in navigator)) {
            setMessage("Service Worker is not supported");
            return;
        }

        if (!("PushManager" in window)) {
            setMessage("Push notifications are not supported");
            return;
        }

        const registration =
            await navigator.serviceWorker.register("/sw.js");

        const currentPermission = Notification.permission;

        setPermission(currentPermission);

        // Already allowed
        if (currentPermission === "granted") {

            let subscription =
                await registration.pushManager.getSubscription();

            if (!subscription) {
                const publicKey =
                    import.meta.env.VITE_VAPID_PUBLIC_KEY;

                subscription =
                    await registration.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey:
                            urlBase64ToUint8Array(publicKey)
                    });
            }

            await API.post(
                "/subscription/subscribe",
                subscription.toJSON()
            );

            setSubscribed(true);
            return;
        }

        // User has not decided yet
        if (currentPermission === "default") {
            setMessage(
                "Please click Enable Notifications to allow notifications."
            );
            return;
        }

        // User blocked it
        if (currentPermission === "denied") {
            setMessage(
                "Notifications are blocked. Please enable them in browser settings."
            );
        }

    } catch (error) {
        console.error("Push initialization error:", error);
    }
};
    // ==========================================
    // ENABLE NOTIFICATION
    // ==========================================

    const enableNotifications =
        async () => {

            try {

                setLoading(true);

                setMessage("");


                // -------------------------------
                // CHECK SUPPORT
                // -------------------------------

                if (
                    !("Notification" in window)
                ) {

                    setMessage(
                        "Browser does not support notifications"
                    );

                    return;
                }


                // -------------------------------
                // REQUEST PERMISSION
                // -------------------------------

                const permissionResult =
                    await Notification
                        .requestPermission();


                setPermission(
                    permissionResult
                );

                alert(permissionResult)

                if (
                    permissionResult !==
                    "granted"
                ) {

                    setMessage(
                        "Notification permission was not granted"
                    );

                    return;
                }


                // -------------------------------
                // SERVICE WORKER
                // -------------------------------

                const registration =
                    await navigator
                        .serviceWorker
                        .ready;


                // -------------------------------
                // VAPID PUBLIC KEY
                // -------------------------------

                const publicKey =
                    import.meta.env
                        .VITE_VAPID_PUBLIC_KEY;


                if (!publicKey) {

                    throw new Error(
                        "VAPID public key is missing"
                    );

                }


                // -------------------------------
                // CREATE SUBSCRIPTION
                // -------------------------------

                let subscription =
                    await registration
                        .pushManager
                        .getSubscription();


                if (!subscription) {

                    subscription =
                        await registration
                            .pushManager
                            .subscribe({

                                userVisibleOnly:
                                    true,

                                applicationServerKey:
                                    urlBase64ToUint8Array(
                                        publicKey
                                    )

                            });

                }


                // -------------------------------
                // SEND TO BACKEND
                // -------------------------------

                await API.post(
                    "/subscription/subscribe",
                    subscription.toJSON()
                );


                setSubscribed(true);


                setMessage(
                    "Notifications enabled successfully"
                );

            }

            catch (error) {

                console.error(
                    "Enable notification error:",
                    error
                );


                setMessage(

                    error.response?.data?.message ||
                    error.message ||
                    "Unable to enable notifications"

                );

            }

            finally {

                setLoading(false);

            }

        };


    // ==========================================
    // DISABLE NOTIFICATION
    // ==========================================

    const disableNotifications =
        async () => {

            try {

                setLoading(true);

                setMessage("");


                const registration =
                    await navigator
                        .serviceWorker
                        .ready;


                const subscription =
                    await registration
                        .pushManager
                        .getSubscription();


                if (!subscription) {

                    setSubscribed(false);

                    return;

                }


                const endpoint =
                    subscription.endpoint;


                await subscription.unsubscribe();


                await API.post(
                    "/subscription/unsubscribe",
                    {
                        endpoint
                    }
                );


                setSubscribed(false);


                setMessage(
                    "Notifications disabled"
                );

            }

            catch (error) {

                console.error(error);

                setMessage(
                    "Unable to disable notifications"
                );

            }

            finally {

                setLoading(false);

            }

        };


    return (

        <main className="dashboard">

            <div className="dashboard-header">

                <div>

                    <h1>
                        Dashboard
                    </h1>

                    <p>
                        Manage your push notifications
                    </p>

                </div>

            </div>


            <div className="dashboard-grid">

                {/* NOTIFICATION CARD */}

                <div className="dashboard-card">

                    <div className="card-icon">
                        🔔
                    </div>

                    <h2>
                        Push Notifications
                    </h2>

                    <p>
                        Enable notifications to receive
                        messages from the application.
                    </p>


                    <div className="status-row">

                        <span>
                            Browser Permission
                        </span>

                        <strong>
                            {permission}
                        </strong>

                    </div>


                    <div className="status-row">

                        <span>
                            Device Subscription
                        </span>

                        <strong
                            className={
                                subscribed
                                    ? "status-on"
                                    : "status-off"
                            }
                        >
                            {subscribed
                                ? "Enabled"
                                : "Disabled"}
                        </strong>

                    </div>


                    {!subscribed ? (

                        <button
                            className="primary-btn"
                            onClick={
                                enableNotifications
                            }
                            disabled={loading}
                        >

                            {loading
                                ? "Enabling..."
                                : "Enable Notifications"}

                        </button>

                    ) : (

                        <button
                            className="danger-btn"
                            onClick={
                                disableNotifications
                            }
                            disabled={loading}
                        >

                            {loading
                                ? "Disabling..."
                                : "Disable Notifications"}

                        </button>

                    )}


                    {message && (

                        <div
                            className={
                                message
                                    .toLowerCase()
                                    .includes("success")
                                    ? "success-message"
                                    : "info-message"
                            }
                        >
                            {message}
                        </div>

                    )}

                </div>


                {/* INFORMATION CARD */}

                <div className="dashboard-card">

                    <div className="card-icon">
                        📱
                    </div>

                    <h2>
                        Device
                    </h2>

                    <p>
                        This browser/device is registered
                        to receive push notifications.
                    </p>

                    <div className="info-box">

                        <strong>
                            No Firebase
                        </strong>

                        <span>
                            This application uses Web Push
                            and your own Node.js backend.
                        </span>

                    </div>

                </div>

            </div>

        </main>

    );
}


// ==========================================
// VAPID KEY CONVERTER
// ==========================================

function urlBase64ToUint8Array(
    base64String
) {

    const padding =
        "=".repeat(
            (4 -
                (base64String.length % 4)) %
            4
        );


    const base64 =
        (
            base64String +
            padding
        )
            .replace(
                /-/g,
                "+"
            )
            .replace(
                /_/g,
                "/"
            );


    const rawData =
        window.atob(base64);


    return Uint8Array.from(
        [...rawData].map(
            character =>
                character.charCodeAt(0)
        )
    );

}


export default Dashboard;

