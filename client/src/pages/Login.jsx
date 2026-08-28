import React, { useState } from "react";

import {
    Link,
    useNavigate
} from "react-router-dom";

import API from "../api/api";


function Login() {

    const navigate =
        useNavigate();


    const [username, setUsername] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [error, setError] =
        useState("");

    const [loading, setLoading] =
        useState(false);


    const handleLogin =
        async (e) => {

            e.preventDefault();

            setError("");

            if (
                !username.trim() ||
                !password
            ) {

                setError(
                    "Username and password are required"
                );

                return;
            }


            try {

                setLoading(true);


                const response =
                    await API.post(
                        "/auth/login",
                        {
                            username:
                                username.trim(),

                            password
                        }
                    );


                if (
                    response.data.success
                ) {

                    localStorage.setItem(
                        "token",
                        response.data.token
                    );


                    localStorage.setItem(
                        "user",
                        JSON.stringify(
                            response.data.user
                        )
                    );


                    navigate(
                        "/dashboard"
                    );

                }

            }

            catch (error) {

                setError(

                    error.response?.data?.message ||
                    "Login failed"

                );

            }

            finally {

                setLoading(false);

            }

        };


    return (

        <div className="auth-page">

            <div className="auth-card">

                <div className="auth-header">

                    <div className="notification-icon">
                        🔔
                    </div>

                    <h1>
                        Push Notification
                    </h1>

                    <p>
                        Login to your account
                    </p>

                </div>


                {error && (

                    <div className="error-message">

                        {error}

                    </div>

                )}


                <form
                    onSubmit={handleLogin}
                >

                    <div className="form-group">

                        <label>
                            Username
                        </label>

                        <input
                            type="text"
                            value={username}
                            onChange={(e) =>
                                setUsername(
                                    e.target.value
                                )
                            }
                            placeholder="Enter username"
                            autoComplete="username"
                        />

                    </div>


                    <div className="form-group">

                        <label>
                            Password
                        </label>

                        <input
                            type="password"
                            value={password}
                            onChange={(e) =>
                                setPassword(
                                    e.target.value
                                )
                            }
                            placeholder="Enter password"
                            autoComplete="current-password"
                        />

                    </div>


                    <button
                        type="submit"
                        className="primary-btn"
                        disabled={loading}
                    >

                        {loading
                            ? "Logging in..."
                            : "Login"}

                    </button>

                </form>


                <div className="auth-footer">

                    <span>
                        Don't have an account?
                    </span>

                    <Link to="/register">
                        Create Account
                    </Link>

                </div>

            </div>

        </div>

    );
}


export default Login;