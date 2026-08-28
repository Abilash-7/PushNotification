import {
    useEffect,
    useState
} from "react";

import API from "../api/api";


function NotificationHistory() {

    const [notifications, setNotifications] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    useEffect(() => {

        loadHistory();

    }, []);


    const loadHistory =
        async () => {

            try {

                setLoading(true);

                const response =
                    await API.get(
                        "/notification/history"
                    );


                setNotifications(
                    response.data.notifications ||
                    []
                );

            }

            catch (error) {

                console.error(error);

                setError(
                    error.response?.data?.message ||
                    "Unable to load history"
                );

            }

            finally {

                setLoading(false);

            }

        };


    const formatDate =
        (date) => {

            if (!date) {
                return "-";
            }

            return new Date(
                date
            ).toLocaleString();

        };


    return (

        <main className="dashboard">

            <div className="dashboard-header">

                <div>

                    <h1>
                        Notification History
                    </h1>

                    <p>
                        View previously sent notifications
                    </p>

                </div>


                <button
                    className="secondary-btn"
                    onClick={loadHistory}
                >
                    Refresh
                </button>

            </div>


            {error && (

                <div className="error-message">
                    {error}
                </div>

            )}


            <div className="table-card">

                {loading ? (

                    <div className="loading">
                        Loading...
                    </div>

                ) : notifications.length === 0 ? (

                    <div className="empty">
                        No notifications found.
                    </div>

                ) : (

                    <div className="table-wrapper">

                        <table>

                            <thead>

                                <tr>

                                    <th>
                                        ID
                                    </th>

                                    <th>
                                        User
                                    </th>

                                    <th>
                                        Title
                                    </th>

                                    <th>
                                        Message
                                    </th>

                                    <th>
                                        Date
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {notifications.map(
                                    (item) => (

                                        <tr
                                            key={
                                                item.Id
                                            }
                                        >

                                            <td>
                                                {item.Id}
                                            </td>

                                            <td>

                                                {item.FullName ||
                                                    item.Username ||
                                                    "All Users"}

                                            </td>

                                            <td>
                                                {item.Title}
                                            </td>

                                            <td>
                                                {item.Message}
                                            </td>

                                            <td>
                                                {formatDate(
                                                    item.SentDate
                                                )}
                                            </td>

                                            <td>

                                                <span
                                                    className={
                                                        item.Status ===
                                                        "Sent"
                                                            ? "badge-success"
                                                            : "badge-danger"
                                                    }
                                                >

                                                    {
                                                        item.Status
                                                    }

                                                </span>

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

        </main>

    );
}


export default NotificationHistory;