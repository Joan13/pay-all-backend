import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

const PayAll = express();
PayAll.use(express.json());
PayAll.use(cors());
// const allowedOrigins = [
//   "http://localhost:5173",
//   "http://localhost:5174",
//   "http://localhost:5175",      // ton dev local
//   "https://class.yambi.net"     // ton domaine de production
// ];

// YambiClass.use(cors({
//   origin: function (origin, callback) {
//     // autoriser requêtes sans header Origin (ex: curl, Postman)
//     if (!origin) return callback(null, true);
//     if (allowedOrigins.includes(origin)) {
//       return callback(null, true);
//     } else {
//       return callback(new Error("Not allowed by CORS"));
//     }
//   },
//   credentials: true, // si tu utilises les cookies ou l'auth
// }));

dotenv.config();

const port = process.env.PORT || 6841;
const ip_mongo = "127.0.0.1:27017";
// const ip_mongo = "147.79.114.220:27017";

export const renderDateUpToMilliseconds = (flag) => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    const yyyy = today.getFullYear();
    const hh = today.getHours();
    const minutes = today.getMinutes();
    const seconds = today.getSeconds();
    const milliseconds = today.getMilliseconds();

    if (flag === "minutes") {
        return minutes;
    }

    if (flag === "hours") {
        return hh;
    }

    return yyyy + "" + mm + "" + dd + "" + hh + "" + minutes + "" + seconds + "" + milliseconds;
}

export const randomString = (length) => {
    for (var s = ''; s.length < length; s += 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.charAt(Math.random() * 62 | 0));
    return s;
}

mongoose.set('strictQuery', false);
mongoose.connect("mongodb://" + ip_mongo + "/pay_all")
    .then(() => {
        console.log("Connected to MongoDB");

        PayAll.listen(port, () => {
            console.log(`Started successfully on port ${port}`);
        });
    })
    .catch((e) => {
        console.log("Enable to connect to database");
        console.log(e)
    })

export default PayAll;

