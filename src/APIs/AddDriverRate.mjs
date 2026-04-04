import PayAll from "../Express.mjs";
import { DriversRateModel } from "../../models/DriversRate.mjs";
import { RideModel } from "../../models/Rides.mjs";

export default function AddDriverRate() {

    PayAll.post("/payall/API/add_driver_rate", async (request, response) => {
        try {
            const { user_id, ride_id, driver_id, description, rate, rate_active } = request.body || {};

            // Basic validation
            if (!user_id) {
                return response.send({ success: "0", error: "user_id is required" });
            }
            if (!ride_id) {
                return response.send({ success: "0", error: "ride_id is required" });
            }
            if (!driver_id) {
                return response.send({ success: "0", error: "driver_id is required" });
            }
            if (rate === undefined || rate === null) {
                return response.send({ success: "0", error: "rate is required" });
            }

            const numericRate = Number(rate);
            if (Number.isNaN(numericRate) || numericRate < 1 || numericRate > 5) {
                return response.send({ success: "0", error: "rate must be between 1 and 5" });
            }

            // Ensure the ride exists and belongs to this user as the owner
            const ride = await RideModel.findById(ride_id);
            if (!ride) {
                return response.send({ success: "0", error: "Ride not found" });
            }
            if (String(ride.user_id) !== String(user_id)) {
                return response.send({ success: "0", error: "Only ride owner can rate the driver" });
            }
            if (String(ride.driver_id) !== String(driver_id)) {
                return response.send({ success: "0", error: "driver_id does not match the ride's driver" });
            }
            if (ride.ride_status !== 3) {
                return response.send({ success: "0", error: "Ride must be completed to rate the driver" });
            }

            // Upsert a single rating per (user_id, ride_id, driver_id)
            const payload = {
                user_id,
                ride_id,
                driver_id,
                description: description || "",
                rate: numericRate,
                rate_active: rate_active !== undefined ? Number(rate_active) : 1,
            };

            const existing = await DriversRateModel.findOne({
                user_id,
                ride_id,
                driver_id
            });

            let saved;
            if (existing) {
                existing.description = payload.description;
                existing.rate = payload.rate;
                existing.rate_active = payload.rate_active;
                saved = await existing.save();
            } else {
                const doc = new DriversRateModel(payload);
                saved = await doc.save();
            }

            return response.send({ success: "1", driver_rate: saved });
        } catch (error) {
            console.error("AddDriverRate Error:", error);
            return response.send({ success: "0", error: error.message });
        }
    });
}

