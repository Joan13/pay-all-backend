// import mongoose from "mongoose";

// const RideSchema = mongoose.Schema(
//     {
//         user_id: { type: String, required: true },
//         driver_id: { type: String, default: '' }, // Optional - empty string when no driver assigned yet
//         start_location: { type: String, required: true },
//         end_location: { type: String, required: true },
//         stops: [
//             {
//                 address: { type: String },
//                 latitude: { type: Number },
//                 longitude: { type: Number }
//             }
//         ],
//         start_time: { type: String, required: true },
//         end_time: { type: String },
//         distance: { type: Number },
//         city: { type: String, required: true },
//         estimated_duration: { type: Number },
//         with_package: { type: Number, default: 0 }, // 0 = no package, 1 = with package
//         package_weight: { type: Number, default: 0 }, // Weight of the package in kg
//         package_description: { type: String, default: '' }, // Dimensions of the package (e.g., "30x20x15 cm")
//         carpooling: { type: Number, default: 0 }, // Car pooling information
//         ride_status: { type: Number }, // 0 = pending, 1 = accepted by a driver who enters the price, 2 = in progress (user set ride start after the has shown the sent  2 digit code to the driver to start the ride), 3 = ride completed by the client, 4 = client cancelled, 5 = driver cancelled, 6 = client accepted set price, 7 = driver set ride start (after he has entered the 2 digit code shown by the client), 8 = ride completed by the driver

//         driver_is_there: { type: Number, default: 0 }, // 0 = not there, 1 = driver is there
//         ride_type: { type: Number },
//         ride_price: { type: Number },
//         ride_currency: { type: Number },
//         ride_payment_method: { type: Number },
//         ride_payment_status: { type: Number },
//         ride_payment_date: { type: String },
//         ride_payment_amount: { type: Number },
//         ride_payment_currency: { type: Number }
//     },
//     {
//         versionKey: false,
//         timestamps: true
//     }
// )

// export const RideModel = mongoose.model("rides_paye_all", RideSchema, 'rides');


import mongoose from "mongoose";

const RideSchema = mongoose.Schema(
  {
    // 👤 Participants
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
    driver_id: { type: mongoose.Schema.Types.ObjectId, ref: "users_paye_all", default: null },

    // 📍 Locations
    start_location: { type: String, required: true },
    end_location: { type: String, required: true },

    stops: [
      {
        address: { type: String },
        latitude: { type: Number },
        longitude: { type: Number }
      }
    ],

    city: { type: String, required: true },

    // ⏱ Timing
    start_time: { type: Date, required: true },
    end_time: { type: Date },

    estimated_duration: { type: Number }, // minutes
    distance: { type: Number }, // km

    // 📦 Package option
    with_package: { type: Number, default: 0 }, // 0/1
    package_weight: { type: Number, default: 0 },
    package_description: { type: String, default: "" },

    // 🚗 Ride type
    carpooling: { type: Number, default: 0 },
    ride_type: { type: Number },

    // 💰 Pricing
    ride_price: { type: Number },
    ride_currency: { type: Number },

    // 💳 Payment
    ride_payment_method: { type: Number },
    ride_payment_status: { type: Number },
    ride_payment_date: { type: Date },
    ride_payment_amount: { type: Number },
    ride_payment_currency: { type: Number },

    // 🚦 GLOBAL STATUS (très simple)
    ride_status: {
      type: Number,
      default: 0,
      /*
        0 = pending (searching driver)
        1 = matched (driver + client accepted + price ok)
        2 = in_progress
        3 = completed
        4 = cancelled
      */
    },

    // 🤝 ACCEPTATION COORDONNÉE
    client_accepted: { type: Number, default: 0 },
    driver_accepted: { type: Number, default: 0 },

    // 🚀 START SYNCHRONISÉ (OTP)
    start_otp: { type: String },
    start_otp_verified: { type: Number, default: 0 },

    client_start_confirmed: { type: Number, default: 0 },
    driver_start_confirmed: { type: Number, default: 0 },

    // 🚗 DRIVER PRESENCE
    driver_is_there: { type: Number, default: 0 },

    // ❌ CANCELLATION
    cancelled_by: {
      type: String,
      enum: ["client", "driver", null],
      default: null
    },
    cancel_reason: { type: String, default: "" },

  },
  {
    timestamps: true,
    versionKey: false
  }
);

export const RideModel = mongoose.model("rides_paye_all", RideSchema, "rides");
