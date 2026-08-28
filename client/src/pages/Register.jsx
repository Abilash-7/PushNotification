
import React, { useState } from "react";

import {
    Link,
    useNavigate
} from "react-router-dom";

import API from "../api/api";


function Register() {

    const navigate =
        useNavigate();


    const [form, setForm] =
        useState({

            fullName: "",

            username: "",

            password: "",

            role: "User"

        });


    const [message, setMessage] =
        useState("");

    const [error, setError] =
        useState("");

    const [loading, setLoading] =
        useState(false);


    const handleChange =
        (e) => {

            setForm({

                ...form,

                [e.target.name]:
                    e.target.value

            });

        };


    const handleRegister =
        async (e) => {

            e.preventDefault();

            setError("");

            setMessage("");


            if (
                !form.username.trim() ||
                !form.password
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
                        "/auth/register",
                        form
                    );


                setMessage(
                    response.data.message
                );


                setTimeout(() => {

                    navigate("/login");

                }, 1200);

            }

            catch (error) {

                setError(

                    error.response?.data?.message ||
                    "Registration failed"

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
                        👤
                    </div>

                    <h1>
                        Create Account
                    </h1>

                    <p>
                        Register a new user
                    </p>

                </div>


                {error && (

                    <div className="error-message">
                        {error}
                    </div>

                )}


                {message && (

                    <div className="success-message">
                        {message}
                    </div>

                )}


                <form
                    onSubmit={handleRegister}
                >

                    <div className="form-group">

                        <label>
                            Full Name
                        </label>

                        <input
                            name="fullName"
                            value={
                                form.fullName
                            }
                            onChange={
                                handleChange
                            }
                            placeholder="Full name"
                        />

                    </div>


                    <div className="form-group">

                        <label>
                            Username
                        </label>

                        <input
                            name="username"
                            value={
                                form.username
                            }
                            onChange={
                                handleChange
                            }
                            placeholder="Username"
                        />

                    </div>


                    <div className="form-group">

                        <label>
                            Password
                        </label>

                        <input
                            name="password"
                            type="password"
                            value={
                                form.password
                            }
                            onChange={
                                handleChange
                            }
                            placeholder="Password"
                        />

                    </div>


                    <div className="form-group">

                        <label>
                            Role
                        </label>

                        <select
                            name="role"
                            value={
                                form.role
                            }
                            onChange={
                                handleChange
                            }
                        >

                            <option value="User">
                                User
                            </option>

                            <option value="Admin">
                                Admin
                            </option>

                        </select>

                    </div>


                    <button
                        type="submit"
                        className="primary-btn"
                        disabled={loading}
                    >

                        {loading
                            ? "Creating..."
                            : "Create Account"}

                    </button>

                </form>


                <div className="auth-footer">

                    <span>
                        Already have an account?
                    </span>

                    <Link to="/login">
                        Login
                    </Link>

                </div>

            </div>

        </div>

    );
}


export default Register;