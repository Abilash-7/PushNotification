// =====================================================
// LOAD ENVIRONMENT VARIABLES
// =====================================================

require("dotenv").config();


// =====================================================
// IMPORT PACKAGES
// =====================================================

const express = require("express");
const cors = require("cors");


// =====================================================
// IMPORT ROUTES
// =====================================================

const authRoutes =
    require("./routes/auth");

const subscriptionRoutes =
    require("./routes/subscription");

const notificationRoutes =
    require("./routes/notification");


// =====================================================
// CREATE EXPRESS APP
// =====================================================

const app = express();


// =====================================================
// PORT
// =====================================================

const PORT =
    process.env.PORT || 5000;


// =====================================================
// CORS
// =====================================================

app.use(
    cors({
        origin: [
            "http://localhost:5173",
            "http://192.168.137.1:5173",
            "https://push-notification-olive.vercel.app",
            "http://192.168.5.62:5173",
            "http://localhost:3000",
            "http://192.168.5.13:6565",
            "http://192.168.5.13:8080"
        ],

        methods: [
            "GET",
            "POST",
            "PUT",
            "DELETE",
            "OPTIONS"
        ],

        allowedHeaders: [
            "Content-Type",
            "Authorization"
        ]
    })
);


// =====================================================
// JSON BODY
// =====================================================

app.use(
    express.json({
        limit: "2mb"
    })
);


// =====================================================
// URL ENCODED BODY
// =====================================================

app.use(
    express.urlencoded({
        extended: true
    })
);


// =====================================================
// ROOT HEALTH CHECK
// =====================================================

app.get(
    "/",
    (req, res) => {

        res.status(200).json({

            success: true,

            message:
                "Push Notification API is running",

            version:
                "1.0.0",

            date:
                new Date()

        });

    }
);


// =====================================================
// API HEALTH CHECK
// =====================================================

app.get(
    "/api/health",
    (req, res) => {

        res.status(200).json({

            success: true,

            message:
                "API is healthy",

            server:
                "IIS + iisnode + Node.js",

            date:
                new Date()

        });

    }
);


// =====================================================
// AUTH ROUTES
// =====================================================

app.use(
    "/api/auth",
    authRoutes
);


// =====================================================
// SUBSCRIPTION ROUTES
// =====================================================

app.use(
    "/api/subscription",
    subscriptionRoutes
);


// =====================================================
// NOTIFICATION ROUTES
// =====================================================

app.use(
    "/api/notification",
    notificationRoutes
);


// =====================================================
// 404 HANDLER
// =====================================================

app.use(
    (req, res) => {

        res.status(404).json({

            success: false,

            message:
                "API endpoint not found",

            path:
                req.originalUrl

        });

    }
);


// =====================================================
// GLOBAL ERROR HANDLER
// =====================================================

app.use(
    (error, req, res, next) => {

        console.error(
            "GLOBAL ERROR:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Internal server error"

        });

    }
);


// =====================================================
// START SERVER
// =====================================================

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log("");
        console.log(
            "======================================"
        );

        console.log(
            " PUSH NOTIFICATION SERVER"
        );

        console.log(
            "======================================"
        );

        console.log(
            `Node Port: ${PORT}`
        );

        console.log(
            `Server: http://localhost:${PORT}`
        );

        console.log(
            `API: http://localhost:${PORT}/api`
        );

        console.log(
            "IIS: http://192.168.5.13:8080"
        );

        console.log(
            "======================================"
        );

    }
);
