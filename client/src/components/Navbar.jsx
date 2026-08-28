import {
    Link,
    useNavigate
} from "react-router-dom";
import React, { useState, useEffect } from "react";


function Navbar() {

    const navigate =
        useNavigate();


    const user =
        JSON.parse(
            localStorage.getItem("user") ||
            "null"
        );


    const logout = () => {

        localStorage.removeItem("token");

        localStorage.removeItem("user");

        navigate("/login");

    };


    return (

        <nav className="navbar">

            <div className="navbar-left">

                <h2>
                    Push Notification
                </h2>

            </div>


            <div className="navbar-right">

                <Link to="/dashboard">
                    Dashboard
                </Link>


                {user?.role === "Admin" && (

                    <>

                        <Link
                            to="/send-notification"
                        >
                            Send Notification
                        </Link>


                        <Link
                            to="/notification-history"
                        >
                            History
                        </Link>

                    </>

                )}


                <span className="username">

                    {user?.fullName ||
                        user?.username}

                </span>


                <button
                    onClick={logout}
                    className="logout-btn"
                >
                    Logout
                </button>

            </div>

        </nav>

    );
}


export default Navbar;