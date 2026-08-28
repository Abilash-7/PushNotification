const express = require("express");

const {
    sql,
    poolPromise
} = require("../db");

const authenticateToken =
    require("../middleware/auth");


const router = express.Router();


// =====================================================
// SUBSCRIBE DEVICE
// POST /api/subscription/subscribe
// =====================================================

router.post(
    "/subscribe",
    authenticateToken,
    async (req, res) => {

        try {

            const {
                endpoint,
                keys
            } = req.body;


            // -----------------------------------------
            // VALIDATION
            // -----------------------------------------

            if (
                !endpoint ||
                !keys ||
                !keys.p256dh ||
                !keys.auth
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid push subscription"

                });

            }


            const pool =
                await poolPromise;


            // -----------------------------------------
            // CHECK EXISTING SUBSCRIPTION
            // -----------------------------------------

            const existing =
                await pool
                    .request()

                    .input(
                        "endpoint",
                        sql.VarChar(
                            sql.MAX
                        ),
                        endpoint
                    )

                    .query(`
                        SELECT
                            Id
                        FROM PushSubscriptions
                        WHERE Endpoint = @endpoint
                    `);


            // -----------------------------------------
            // UPDATE EXISTING
            // -----------------------------------------

            if (
                existing.recordset.length > 0
            ) {

                await pool
                    .request()

                    .input(
                        "endpoint",
                        sql.VarChar(
                            sql.MAX
                        ),
                        endpoint
                    )

                    .input(
                        "userId",
                        sql.Int,
                        req.user.id
                    )

                    .input(
                        "p256dh",
                        sql.VarChar(
                            sql.MAX
                        ),
                        keys.p256dh
                    )

                    .input(
                        "auth",
                        sql.VarChar(
                            sql.MAX
                        ),
                        keys.auth
                    )

                    .query(`
                        UPDATE PushSubscriptions

                        SET
                            UserId = @userId,
                            P256dh = @p256dh,
                            Auth = @auth,
                            LastUsedDate = GETDATE()

                        WHERE Endpoint = @endpoint
                    `);

            }

            // -----------------------------------------
            // INSERT NEW
            // -----------------------------------------

            else {

                await pool
                    .request()

                    .input(
                        "userId",
                        sql.Int,
                        req.user.id
                    )

                    .input(
                        "endpoint",
                        sql.VarChar(
                            sql.MAX
                        ),
                        endpoint
                    )

                    .input(
                        "p256dh",
                        sql.VarChar(
                            sql.MAX
                        ),
                        keys.p256dh
                    )

                    .input(
                        "auth",
                        sql.VarChar(
                            sql.MAX
                        ),
                        keys.auth
                    )

                    .query(`
                        INSERT INTO PushSubscriptions
                        (
                            UserId,
                            Endpoint,
                            P256dh,
                            Auth,
                            CreatedDate,
                            LastUsedDate
                        )
                        VALUES
                        (
                            @userId,
                            @endpoint,
                            @p256dh,
                            @auth,
                            GETDATE(),
                            GETDATE()
                        )
                    `);

            }


            return res.json({

                success: true,

                message:
                    "Device subscribed successfully"

            });

        }

        catch (error) {

            console.error(
                "SUBSCRIBE ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to save subscription"

            });

        }

    }
);


// =====================================================
// UNSUBSCRIBE DEVICE
// POST /api/subscription/unsubscribe
// =====================================================

router.post(
    "/unsubscribe",
    authenticateToken,
    async (req, res) => {

        try {

            const {
                endpoint
            } = req.body;


            if (!endpoint) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Endpoint required"

                });

            }


            const pool =
                await poolPromise;


            await pool
                .request()

                .input(
                    "endpoint",
                    sql.VarChar(
                        sql.MAX
                    ),
                    endpoint
                )

                .input(
                    "userId",
                    sql.Int,
                    req.user.id
                )

                .query(`
                    DELETE FROM PushSubscriptions

                    WHERE Endpoint = @endpoint
                    AND UserId = @userId
                `);


            return res.json({

                success: true,

                message:
                    "Device unsubscribed successfully"

            });

        }

        catch (error) {

            console.error(
                "UNSUBSCRIBE ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to unsubscribe"

            });

        }

    }
);


// =====================================================
// GET USER DEVICES
// GET /api/subscription/devices
// =====================================================

router.get(
    "/devices",
    authenticateToken,
    async (req, res) => {

        try {

            const pool =
                await poolPromise;


            const result =
                await pool
                    .request()

                    .input(
                        "userId",
                        sql.Int,
                        req.user.id
                    )

                    .query(`
                        SELECT
                            Id,
                            CreatedDate,
                            LastUsedDate
                        FROM PushSubscriptions

                        WHERE UserId = @userId

                        ORDER BY
                            CreatedDate DESC
                    `);


            return res.json({

                success: true,

                devices:
                    result.recordset

            });

        }

        catch (error) {

            console.error(
                "GET DEVICES ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to get devices"

            });

        }

    }
);


module.exports = router;