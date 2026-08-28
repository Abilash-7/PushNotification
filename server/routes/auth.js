const express = require("express");

const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const {
    sql,
    poolPromise
} = require("../db");

const authenticateToken =
    require("../middleware/auth");


const router = express.Router();


// =====================================================
// LOGIN
// POST /api/auth/login
// =====================================================

router.post(
    "/login",
    async (req, res) => {

        try {

            const {
                username,
                password
            } = req.body;

console.log( username,password );
            // -----------------------------------------
            // VALIDATION
            // -----------------------------------------

            if (
                !username ||
                !password
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Username and password are required"

                });

            }


            // -----------------------------------------
            // DATABASE
            // -----------------------------------------

            const pool =
                await poolPromise;


            const result =
                await pool
                    .request()

                    .input(
                        "username",
                        sql.VarChar(100),
                        username.trim()
                    )

                    .query(`
                        SELECT
                            Id,
                            Username,
                            PasswordHash,
                            FullName,
                            Role,
                            CreatedDate
                        FROM notifyUsers
                        WHERE Username = @username
                    `);


            // -----------------------------------------
            // USER NOT FOUND
            // -----------------------------------------

            if (
                result.recordset.length === 0
            ) {

                return res.status(401).json({

                    success: false,

                    message:
                        "Invalid username or password"

                });

            }


            const user =
                result.recordset[0];


            // -----------------------------------------
            // CHECK PASSWORD
            // -----------------------------------------

            const passwordValid =
                await bcrypt.compare(
                    password,
                    user.PasswordHash
                );


            if (!passwordValid) {

                return res.status(401).json({

                    success: false,

                    message:
                        "Invalid username or password"

                });

            }


            // -----------------------------------------
            // CREATE JWT
            // -----------------------------------------

            const token =
                jwt.sign(

                    {
                        id: user.Id,

                        username:
                            user.Username,

                        role:
                            user.Role,

                        fullName:
                            user.FullName

                    },

                    process.env.JWT_SECRET,

                    {
                        expiresIn: "8h"
                    }

                );


            // -----------------------------------------
            // RESPONSE
            // -----------------------------------------

            return res.json({

                success: true,

                message:
                    "Login successful",

                token,

                user: {

                    id:
                        user.Id,

                    username:
                        user.Username,

                    fullName:
                        user.FullName,

                    role:
                        user.Role

                }

            });

        }

        catch (error) {

            console.error(
                "LOGIN ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Login failed"

            });

        }

    }
);


// =====================================================
// REGISTER USER
// POST /api/auth/register
// =====================================================

router.post(
    "/register",
    async (req, res) => {

        try {

            const {
                username,
                password,
                fullName,
                role
            } = req.body;


            // -----------------------------------------
            // VALIDATION
            // -----------------------------------------

            if (
                !username ||
                !password
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Username and password are required"

                });

            }


            // -----------------------------------------
            // DEFAULT ROLE
            // -----------------------------------------

            const userRole =
                role === "Admin"
                    ? "Admin"
                    : "User";


            // -----------------------------------------
            // CHECK EXISTING USER
            // -----------------------------------------

            const pool =
                await poolPromise;


            const existing =
                await pool
                    .request()

                    .input(
                        "username",
                        sql.VarChar(100),
                        username.trim()
                    )

                    .query(`
                        SELECT Id
                        FROM notifyUsers
                        WHERE Username = @username
                    `);


            if (
                existing.recordset.length > 0
            ) {

                return res.status(409).json({

                    success: false,

                    message:
                        "Username already exists"

                });

            }


            // -----------------------------------------
            // HASH PASSWORD
            // -----------------------------------------

            const passwordHash =
                await bcrypt.hash(
                    password,
                    12
                );


            // -----------------------------------------
            // INSERT USER
            // -----------------------------------------

            await pool
                .request()

                .input(
                    "username",
                    sql.VarChar(100),
                    username.trim()
                )

                .input(
                    "passwordHash",
                    sql.VarChar(500),
                    passwordHash
                )

                .input(
                    "fullName",
                    sql.VarChar(200),
                    fullName || ""
                )

                .input(
                    "role",
                    sql.VarChar(50),
                    userRole
                )

                .query(`
                    INSERT INTO notifyUsers
                    (
                        Username,
                        PasswordHash,
                        FullName,
                        Role
                    )
                    VALUES
                    (
                        @username,
                        @passwordHash,
                        @fullName,
                        @role
                    )
                `);


            return res.status(201).json({

                success: true,

                message:
                    "User created successfully"

            });

        }

        catch (error) {

            console.error(
                "REGISTER ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "User registration failed"

            });

        }

    }
);


// =====================================================
// CURRENT USER
// GET /api/auth/me
// =====================================================

router.get(
    "/me",
    authenticateToken,
    async (req, res) => {

        try {

            const pool =
                await poolPromise;


            const result =
                await pool
                    .request()

                    .input(
                        "id",
                        sql.Int,
                        req.user.id
                    )

                    .query(`
                        SELECT
                            Id,
                            Username,
                            FullName,
                            Role,
                            CreatedDate
                        FROM notifyUsers
                        WHERE Id = @id
                    `);


            if (
                result.recordset.length === 0
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "User not found"

                });

            }


            return res.json({

                success: true,

                user:
                    result.recordset[0]

            });

        }

        catch (error) {

            console.error(
                "GET USER ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to get user"

            });

        }

    }
);


module.exports = router;
