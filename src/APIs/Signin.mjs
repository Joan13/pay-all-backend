import PayAll from "../Express.mjs";
import { UserModel } from "../../models/Users.mjs";
import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";

const client = jwksClient({
    jwksUri: "https://appleid.apple.com/auth/keys",
});

function getKey(header, callback) {
    client.getSigningKey(header.kid, (err, key) => {
        if (err) return callback(err);

        const signingKey = key.getPublicKey();
        callback(null, signingKey);
    });
}

function verifyAppleToken(token) {
    return new Promise((resolve, reject) => {
        jwt.verify(
            token,
            getKey,
            {
                algorithms: ["RS256"],
                issuer: "https://appleid.apple.com",

                // Ton Service ID Apple
                audience: "com.payallapp.servicesid",
            },
            (err, decoded) => {
                if (err) return reject(err);

                resolve(decoded);
            }
        );
    });
}

export default function Signin() {
    PayAll.post("/payall/API/signin", async (request, response) => {

        const {
            user_email,
            names,
            gender,
            country,
            city,
            state,
            address,
            phone_numbers,
            user_password,
            profile_picture,
            account_type,
            is_admin,
            car_model,
            car_condition,
            license_plate,
            id_token
        } = request.body;

        try {

            /*
            =====================================================
            APPLE SIGN IN
            =====================================================
            */

if (id_token) {

    try {

        const payload = await verifyAppleToken(id_token);

        const appleId = payload.sub;

        // Peut être absent après premier login
        const appleEmail = payload.email || null;

        /*
        ============================================
        1. RECHERCHE PAR APPLE ID
        ============================================
        */

        let user = await UserModel.findOne({
            apple_id: appleId
        });

        if (user) {

            return response.send({
                success: "1",
                user
            });
        }

        /*
        ============================================
        2. RECHERCHE PAR EMAIL
        ============================================
        */

        if (appleEmail) {

            user = await UserModel.findOne({
                user_email: appleEmail
            });

            // User existe déjà via Google/email/etc
            if (user) {

                // Lie le compte Apple
                user.apple_id = appleId;

                await user.save();

                return response.send({
                    success: "1",
                    user
                });
            }
        }

        /*
        ============================================
        3. CREATE NEW USER
        ============================================
        */

        const isAdminEmail =
            appleEmail &&
            appleEmail.toLowerCase() === "joan.migani@gmail.com";

        const newUserData = {

            apple_id: appleId,

            user_email: appleEmail,

            names: appleEmail
                ? appleEmail.split("@")[0]
                : "Apple User",

            gender: 0,

            country: "",

            city: "Unknown",

            state: "",

            address: "",

            phone_numbers: [],

            user_password: "",

            profile_picture: "",

            account_type: isAdminEmail ? 2 : 0,

            is_admin: isAdminEmail ? true : false
        };

        const newUser = await UserModel.create(newUserData);

        return response.send({
            success: "1",
            user: newUser
        });

    } catch (err) {

        console.error("Apple Sign-In Error:", err);

        return response.status(401).json({
            success: "0",
            error: "Invalid Apple token",
        });
    }
}

            /*
            =====================================================
            NORMAL / GOOGLE SIGN IN
            =====================================================
            */

            // Vérifie admin email
            const isAdminEmail =
                user_email &&
                user_email.toLowerCase() === "joan.agisha@gmail.com";

            let user = await UserModel.findOne({
                user_email
            });

            // Utilisateur existe
            if (user) {

                // Upgrade admin si nécessaire
                if (
                    isAdminEmail &&
                    (
                        user.account_type !== 2 ||
                        user.is_admin !== true
                    )
                ) {

                    user.account_type = 2;
                    user.is_admin = true;

                    await user.save();
                }

                return response.send({
                    success: "1",
                    user
                });
            }

            /*
            =====================================================
            CREATE NEW USER
            =====================================================
            */

            const newUserData = {

                user_email,

                names,

                gender,

                country,

                city,

                state,

                address,

                phone_numbers: phone_numbers || [],

                user_password,

                profile_picture,

                account_type: isAdminEmail
                    ? 2
                    : (account_type || 0),

                is_admin: isAdminEmail
                    ? true
                    : (is_admin || false)
            };

            // Si chauffeur
            if (newUserData.account_type === 1) {

                if (car_model) {
                    newUserData.car_model = car_model;
                }

                if (car_condition !== undefined) {
                    newUserData.car_condition = car_condition;
                }

                if (license_plate) {
                    newUserData.license_plate = license_plate;
                }
            }

            const newUser = await UserModel.create(newUserData);

            return response.send({
                success: "1",
                user: newUser
            });

        } catch (error) {

            console.error(error);

            return response.status(500).send({
                success: "0",
                error: error.message
            });
        }
    });
}