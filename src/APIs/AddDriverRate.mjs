import PayAll from "../Express.mjs";
import { RatingsModel } from "../../models/Ratings.mjs";
import { RideModel } from "../../models/Rides.mjs";

export default function AddDriverRate() {

    PayAll.post("/payall/API/add_driver_rate", async (request, response) => {
        try {
            const { user_id, rater_id, ride_id, driver_id, rated_id, description, rate, rate_active } = request.body || {};

            // Map inputs generically with fallback for backward compatibility
            const finalRaterId = rater_id || user_id;
            const finalRatedId = rated_id || driver_id;

            // Basic validation
            if (!finalRaterId) {
                return response.send({ success: "0", error: "rater_id (or user_id) is required" });
            }
            if (!ride_id) {
                return response.send({ success: "0", error: "ride_id is required" });
            }
            if (!finalRatedId) {
                return response.send({ success: "0", error: "rated_id (or driver_id) is required" });
            }
            if (rate === undefined || rate === null) {
                return response.send({ success: "0", error: "rate is required" });
            }

            const numericRate = Number(rate);
            if (Number.isNaN(numericRate) || numericRate < 1 || numericRate > 5) {
                return response.send({ success: "0", error: "rate must be between 1 and 5" });
            }

            // Ensure the ride exists
            const ride = await RideModel.findById(ride_id);
            if (!ride) {
                return response.send({ success: "0", error: "Ride not found" });
            }

            // Verify rater and rated are participants of this ride
            const isClientRater = String(ride.user_id) === String(finalRaterId);
            const isDriverRater = String(ride.driver_id) === String(finalRaterId);
            const isClientRated = String(ride.user_id) === String(finalRatedId);
            const isDriverRated = String(ride.driver_id) === String(finalRatedId);

            if (!((isClientRater && isDriverRated) || (isDriverRater && isClientRated))) {
                return response.send({ success: "0", error: "Rater and rated must be the client and driver of this ride" });
            }

            // Lifecycle and rating eligibility validation
            let allowed = false;
            let errorMsg = "";

            if (ride.ride_status === 3) {
                // Scenario 1: Ride completed. Both client rating driver and driver rating client are allowed.
                allowed = true;
            } else if (ride.ride_status === 4) {
                // Scenario 2: Ride cancelled and driver arrived, driver rating unresponsive client
                if (Number(ride.driver_is_there) === 1 && isDriverRater && isClientRated) {
                    allowed = true;
                }
                // Scenario 3: Ride cancelled, driver accepted but never arrived, client rating driver
                else if (Number(ride.driver_is_there) === 0 && ride.driver_id && isClientRater && isDriverRated) {
                    allowed = true;
                } else {
                    errorMsg = "Rating not allowed under these cancellation conditions";
                }
            } else {
                errorMsg = "Ride must be completed or cancelled to submit a rating";
            }

            if (!allowed) {
                return response.send({ success: "0", error: errorMsg });
            }

            // Upsert the rating
            const payload = {
                rater_id: finalRaterId,
                ride_id,
                rated_id: finalRatedId,
                description: description || "",
                rate: numericRate,
                rate_active: rate_active !== undefined ? Number(rate_active) : 1,
            };

            const existing = await RatingsModel.findOne({
                rater_id: finalRaterId,
                ride_id,
                rated_id: finalRatedId
            });

            let saved;
            if (existing) {
                existing.description = payload.description;
                existing.rate = payload.rate;
                existing.rate_active = payload.rate_active;
                saved = await existing.save();
            } else {
                const doc = new RatingsModel(payload);
                saved = await doc.save();
            }

            return response.send({ success: "1", rating: saved });
        } catch (error) {
            console.error("AddRating Error:", error);
            return response.send({ success: "0", error: error.message });
        }
    });
}
