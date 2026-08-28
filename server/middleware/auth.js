const jwt = require("jsonwebtoken");


// ==========================================
// AUTHENTICATION MIDDLEWARE
// ==========================================

function authenticateToken(req, res, next) {

    try {

        const authHeader =
            req.headers.authorization;


        // ----------------------------------
        // CHECK AUTHORIZATION HEADER
        // ----------------------------------

        if (!authHeader) {

            return res.status(401).json({

                success: false,

                message:
                    "Authorization header required"

            });

        }


        // ----------------------------------
        // CHECK BEARER TOKEN
        // ----------------------------------

        if (
            !authHeader.startsWith("Bearer ")
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid authorization format"

            });

        }


        // ----------------------------------
        // GET TOKEN
        // ----------------------------------

        const token =
            authHeader.substring(7);


        if (!token) {

            return res.status(401).json({

                success: false,

                message:
                    "Token not provided"

            });

        }


        // ----------------------------------
        // VERIFY TOKEN
        // ----------------------------------

        const decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );


        // ----------------------------------
        // SAVE USER IN REQUEST
        // ----------------------------------

        req.user = decoded;


        next();

    }

    catch (error) {

        console.error(
            "Authentication error:",
            error.message
        );


        if (
            error.name === "TokenExpiredError"
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Token expired"

            });

        }


        return res.status(401).json({

            success: false,

            message:
                "Invalid token"

        });

    }

}


module.exports =
    authenticateToken;