import React from "react";

import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import SendNotification from "./pages/SendNotification.jsx";
import NotificationHistory from "./pages/NotificationHistory.jsx";

import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Navbar from "./components/Navbar.jsx";

import "../src/index.css";


function App() {

    return (

        <BrowserRouter>

            <Routes>

                {/* LOGIN */}

                <Route
                    path="/login"
                    element={<Login />}
                />


                {/* REGISTER */}

                <Route
                    path="/register"
                    element={<Register />}
                />


                {/* DASHBOARD */}

                <Route
                    path="/dashboard"
                    element={

                        <ProtectedRoute>

                            <Navbar />

                            <Dashboard />

                        </ProtectedRoute>

                    }
                />


                {/* SEND NOTIFICATION */}

                <Route
                    path="/send-notification"
                    element={

                        <ProtectedRoute>

                            <Navbar />

                            <SendNotification />

                        </ProtectedRoute>

                    }
                />


                {/* HISTORY */}

                <Route
                    path="/notification-history"
                    element={

                        <ProtectedRoute>

                            <Navbar />

                            <NotificationHistory />

                        </ProtectedRoute>

                    }
                />


                {/* DEFAULT */}

                <Route
                    path="/"
                    element={
                        <Navigate
                            to="/login"
                            replace
                        />
                    }
                />


                {/* UNKNOWN URL */}

                <Route
                    path="*"
                    element={
                        <Navigate
                            to="/login"
                            replace
                        />
                    }
                />

            </Routes>

        </BrowserRouter>

    );
}


export default App;