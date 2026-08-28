const express = require("express");

const webpush = require("web-push");

const {
    sql,
    poolPromise
} = require("../db");

const authenticateToken =
    require("../middleware/auth");


const router = express.Router();


// =====================================================
// CONFIGURE WEB PUSH
// =====================================================

webpush.setVapidDetails(

    process.env.VAPID_EMAIL,

    process.env.VAPID_PUBLIC_KEY,

    process.env.VAPID_PRIVATE_KEY

);


// =====================================================
// ADMIN CHECK
// =====================================================

function adminOnly(req, res, next) {

    if (
        !req.user ||
        req.user.role !== "Admin"
    ) {

        return res.status(403).json({

            success: false,

            message:
                "Admin access required"

        });

    }

    next();
}


// =====================================================
// SEND NOTIFICATION
//
// POST /api/notification/send
//
// Body:
//
// {
//     "title": "Test",
//     "message": "Hello",
//     "userId": null
// }
//
// userId = null => everyone
// userId = 5    => specific user
// =====================================================

router.post(
    "/send",
    authenticateToken,
    adminOnly,
    async (req, res) => {

        try {

            const {
                title,
                message,
                userId
            } = req.body;


            // -----------------------------------------
            // VALIDATION
            // -----------------------------------------

            if (
                !title ||
                !message
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Title and message are required"

                });

            }


            const pool =
                await poolPromise;


            // -----------------------------------------
            // GET SUBSCRIPTIONS
            // -----------------------------------------

            let query = `

                SELECT
                    Id,
                    UserId,
                    Endpoint,
                    P256dh,
                    Auth

                FROM PushSubscriptions

            `;


            const request =
                pool.request();


            // -----------------------------------------
            // SEND TO SPECIFIC USER
            // -----------------------------------------

            if (
                userId !== null &&
                userId !== undefined &&
                userId !== ""
            ) {

                query += `

                    WHERE UserId = @userId

                `;


                request.input(
                    "userId",
                    sql.Int,
                    parseInt(userId, 10)
                );

            }


            const result =
                await request.query(
                    query
                );


            // -----------------------------------------
            // NOTIFICATION PAYLOAD
            // -----------------------------------------

            const payload =
                JSON.stringify({

                    title: title,

                    body: message,

                    icon: "/logo192.png",

                    badge: "/logo192.png",

                    data: {

                        url: "/dashboard"

                    }

                });


            let successCount = 0;

            let failedCount = 0;


            // -----------------------------------------
            // SEND TO EACH DEVICE
            // -----------------------------------------

            for (
                const subscription
                of result.recordset
            ) {

                const pushSubscription = {

                    endpoint:
                        subscription.Endpoint,

                    keys: {

                        p256dh:
                            subscription.P256dh,

                        auth:
                            subscription.Auth

                    }

                };


                try {

                    await webpush.sendNotification(

                        pushSubscription,

                        payload

                    );


                    successCount++;


                    // ----------------------------------
                    // UPDATE LAST USED
                    // ----------------------------------

                    await pool
                        .request()

                        .input(
                            "id",
                            sql.Int,
                            subscription.Id
                        )

                        .query(`

                            UPDATE
                                PushSubscriptions

                            SET
                                LastUsedDate =
                                    GETDATE()

                            WHERE
                                Id = @id

                        `);

                }

                catch (error) {

                    failedCount++;


                    console.error(
                        "PUSH ERROR:",
                        error.statusCode,
                        error.message
                    );


                    // ----------------------------------
                    // DELETE EXPIRED SUBSCRIPTION
                    // ----------------------------------

                    if (
                        error.statusCode === 404 ||
                        error.statusCode === 410
                    ) {

                        await pool
                            .request()

                            .input(
                                "id",
                                sql.Int,
                                subscription.Id
                            )

                            .query(`

                                DELETE FROM
                                    PushSubscriptions

                                WHERE
                                    Id = @id

                            `);

                    }

                }

            }


            // -----------------------------------------
            // SAVE NOTIFICATION HISTORY
            // -----------------------------------------

            await pool
                .request()

                .input(
                    "userId",
                    sql.Int,
                    userId
                        ? parseInt(
                            userId,
                            10
                        )
                        : null
                )

                .input(
                    "title",
                    sql.VarChar(200),
                    title
                )

                .input(
                    "message",
                    sql.VarChar(
                        sql.MAX
                    ),
                    message
                )

                .input(
                    "status",
                    sql.VarChar(50),
                    successCount > 0
                        ? "Sent"
                        : "Failed"
                )

                .query(`

                    INSERT INTO Notifications
                    (
                        UserId,
                        Title,
                        Message,
                        SentDate,
                        Status
                    )

                    VALUES
                    (
                        @userId,
                        @title,
                        @message,
                        GETDATE(),
                        @status
                    )

                `);


            // -----------------------------------------
            // RESPONSE
            // -----------------------------------------

            return res.json({

                success: true,

                message:
                    "Notification processed",

                totalDevices:
                    result.recordset.length,

                successCount:
                    successCount,

                failedCount:
                    failedCount

            });

        }

        catch (error) {

            console.error(
                "SEND NOTIFICATION ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to send notification"

            });

        }

    }
);


// =====================================================
// NOTIFICATION HISTORY
//
// GET /api/notification/history
// =====================================================

router.get(
    "/history",
    authenticateToken,
    adminOnly,
    async (req, res) => {

        try {

            const pool =
                await poolPromise;


            const result =
                await pool
                    .request()
                    .query(`

                        SELECT

                            n.Id,

                            n.UserId,

                            u.Username,

                            u.FullName,

                            n.Title,

                            n.Message,

                            n.SentDate,

                            n.Status

                        FROM Notifications n

                        LEFT JOIN Users u
                            ON n.UserId = u.Id

                        ORDER BY
                            n.SentDate DESC

                    `);


            return res.json({

                success: true,

                notifications:
                    result.recordset

            });

        }

        catch (error) {

            console.error(
                "HISTORY ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to get notification history"

            });

        }

    }
);


module.exports = router;