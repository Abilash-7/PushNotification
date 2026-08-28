import React,  {
    useState
} from "react";

import API from "../api/api";


function SendNotification() {

    const [title, setTitle] =
        useState("");

    const [message, setMessage] =
        useState("");

    const [userId, setUserId] =
        useState("");

    const [result, setResult] =
        useState("");

    const [error, setError] =
        useState("");

    const [loading, setLoading] =
        useState(false);


    const sendNotification =
        async () => {

            setResult("");

            setError("");


            if (!title.trim()) {

                setError(
                    "Notification title is required"
                );

                return;
            }


            if (!message.trim()) {

                setError(
                    "Notification message is required"
                );

                return;
            }


            try {

                setLoading(true);


                const response =
                    await API.post(
                        "/notification/send",
                        {

                            title:
                                title.trim(),

                            message:
                                message.trim(),

                            userId:
                                userId.trim()
                                    ? parseInt(
                                        userId,
                                        10
                                    )
                                    : null

                        }
                    );


                const data =
                    response.data;


                setResult(

                    `Notification processed successfully. ` +
                    `Devices: ${data.totalDevices}, ` +
                    `Sent: ${data.successCount}, ` +
                    `Failed: ${data.failedCount}`

                );


                setTitle("");

                setMessage("");

                setUserId("");

            }

            catch (error) {

                console.error(error);


                setError(

                    error.response?.data?.message ||
                    "Failed to send notification"

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
                        Send Notification
                    </h1>

                    <p>
                        Send a push notification to users
                    </p>

                </div>

            </div>


            <div className="notification-form-card">

                {error && (

                    <div className="error-message">
                        {error}
                    </div>

                )}


                {result && (

                    <div className="success-message">
                        {result}
                    </div>

                )}


                <div className="form-group">

                    <label>
                        Notification Title
                    </label>

                    <input
                        type="text"
                        value={title}
                        onChange={(e) =>
                            setTitle(
                                e.target.value
                            )
                        }
                        placeholder="Example: Important Update"
                        maxLength={200}
                    />

                </div>


                <div className="form-group">

                    <label>
                        Message
                    </label>

                    <textarea
                        value={message}
                        onChange={(e) =>
                            setMessage(
                                e.target.value
                            )
                        }
                        placeholder="Enter notification message"
                        rows={6}
                    />

                </div>


                <div className="form-group">

                    <label>
                        User ID
                    </label>

                    <input
                        type="number"
                        value={userId}
                        onChange={(e) =>
                            setUserId(
                                e.target.value
                            )
                        }
                        placeholder="Leave empty to send to everyone"
                    />

                    <small>
                        Leave this empty to send the
                        notification to all subscribed users.
                    </small>

                </div>


                <button
                    className="primary-btn send-btn"
                    onClick={
                        sendNotification
                    }
                    disabled={loading}
                >

                    {loading
                        ? "Sending..."
                        : "🔔 Send Notification"}

                </button>

            </div>

        </main>

    );
}


export default SendNotification;