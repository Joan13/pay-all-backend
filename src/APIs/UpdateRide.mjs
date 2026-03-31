import PayAll from "../Express.mjs";
import { RideModel } from "../../models/Rides.mjs";

export default function UpdateRide() {

    PayAll.post("/payall/API/update_ride", async (request, response) => {
        const { ride_id, ride } = request.body;

        // Validate required fields
        if (!ride_id) {
            return response.send({ success: "0", error: "ride_id is required" });
        }

        if (!ride) {
            return response.send({ success: "0", error: "ride data is required" });
        }

        try {
            // Check if ride exists
            const existingRide = await RideModel.findById(ride_id);
            if (!existingRide) {
                return response.send({ success: "0", error: "Ride not found" });
            }

            // Prepare update fields - only update provided fields
            const updateFields = {};
            
            // Only update fields that are provided and not empty
            if (ride.start_location !== undefined) updateFields.start_location = ride.start_location;
            if (ride.end_location !== undefined) updateFields.end_location = ride.end_location;
            if (ride.stops !== undefined) updateFields.stops = ride.stops;
            if (ride.start_time !== undefined) updateFields.start_time = ride.start_time;
            if (ride.end_time !== undefined) updateFields.end_time = ride.end_time;
            if (ride.distance !== undefined) updateFields.distance = ride.distance;
            if (ride.city !== undefined) updateFields.city = ride.city;
            if (ride.estimated_duration !== undefined) updateFields.estimated_duration = ride.estimated_duration;
            if (ride.ride_status !== undefined) updateFields.ride_status = ride.ride_status;
            if (ride.ride_type !== undefined) updateFields.ride_type = ride.ride_type;
            if (ride.ride_price !== undefined) updateFields.ride_price = ride.ride_price;
            if (ride.ride_currency !== undefined) updateFields.ride_currency = ride.ride_currency;
            if (ride.ride_payment_method !== undefined) updateFields.ride_payment_method = ride.ride_payment_method;
            if (ride.ride_payment_status !== undefined) updateFields.ride_payment_status = ride.ride_payment_status;
            if (ride.ride_payment_date !== undefined) updateFields.ride_payment_date = ride.ride_payment_date;
            if (ride.ride_payment_amount !== undefined) updateFields.ride_payment_amount = ride.ride_payment_amount;
            if (ride.ride_payment_currency !== undefined) updateFields.ride_payment_currency = ride.ride_payment_currency;
            
            // Note: user_id and driver_id should not be updated via this endpoint
            // They are set during creation/acceptance

            // Update the ride
            const updatedRide = await RideModel.findByIdAndUpdate(
                ride_id,
                { $set: updateFields },
                { new: true, runValidators: true }
            );

            if (updatedRide) {
                response.send({ success: "1", ride: updatedRide });
            } else {
                response.send({ success: "0", error: "Failed to update ride" });
            }
        } catch (error) {
            console.error("UpdateRide Error:", error);
            response.send({ success: "0", error: error.message });
        }
    });
}