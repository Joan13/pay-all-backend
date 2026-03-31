import mongoose from "mongoose";

const RideSchema = mongoose.Schema(
    {
        user_id: { type: String, required: true },
        driver_id: { type: String, default: '' }, // Optional - empty string when no driver assigned yet
        start_location: { type: String, required: true },
        end_location: { type: String, required: true },
        stops: [
            {
                address: { type: String },
                latitude: { type: Number },
                longitude: { type: Number }
            }
        ],
        start_time: { type: String, required: true },
        end_time: { type: String },
        distance: { type: Number },
        city: { type: String, required: true },
        estimated_duration: { type: Number },
        ride_status: { type: Number },
        ride_type: { type: Number },
        ride_price: { type: Number },
        ride_currency: { type: Number },
        ride_payment_method: { type: Number },
        ride_payment_status: { type: Number },
        ride_payment_date: { type: String },
        ride_payment_amount: { type: Number },
        ride_payment_currency: { type: Number }
    },
    {
        versionKey: false,
        timestamps: true
    }
)

export const RideModel = mongoose.model("rides_paye_all", RideSchema, 'rides');

