import PayAll from "../Express.mjs";
import { ClientPointsModel } from "../../models/ClientsPoints.mjs";
import { RideModel } from "../../models/Rides.mjs";

/**
 * Returns bonus points earned by the client based on ride distance (km).
 * < 1.5 km   → 1 point
 * 1.51–3 km  → 3 points
 * 3.1–6 km   → 5 points
 * > 6 km     → 8 points
 */
function getPointsForDistance(distanceKm) {
    if (distanceKm <= 1.5)  return 1;
    if (distanceKm <= 3)    return 3;
    if (distanceKm <= 6)    return 5;
    return 8;
}

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
            
            // Only update fields that are provided
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
            if (ride.with_package !== undefined) updateFields.with_package = ride.with_package;
            if (ride.package_weight !== undefined) updateFields.package_weight = ride.package_weight;
            if (ride.package_description !== undefined) updateFields.package_description = ride.package_description;
            if (ride.carpooling !== undefined) updateFields.carpooling = ride.carpooling;
            
            // Mapped lifecycle fields
            if (ride.driver_id !== undefined) updateFields.driver_id = (ride.driver_id === '' || ride.driver_id === null) ? null : ride.driver_id;
            if (ride.client_accepted !== undefined) updateFields.client_accepted = ride.client_accepted;
            if (ride.driver_accepted !== undefined) updateFields.driver_accepted = ride.driver_accepted;
            if (ride.driver_is_there !== undefined) updateFields.driver_is_there = ride.driver_is_there;
            if (ride.client_start_confirmed !== undefined) updateFields.client_start_confirmed = ride.client_start_confirmed;
            if (ride.driver_start_confirmed !== undefined) updateFields.driver_start_confirmed = ride.driver_start_confirmed;
            if (ride.cancelled_by !== undefined) updateFields.cancelled_by = ride.cancelled_by;
            if (ride.cancel_reason !== undefined) updateFields.cancel_reason = ride.cancel_reason;

            // Coordinated acceptance triggers
            if (ride.ride_status === 1) {
                // matched state: both driver and client accepted, driver_id is set
                updateFields.driver_accepted = 1;
                updateFields.client_accepted = 1;
            }

            // If both client and driver have accepted, and status is pending, transition to accepted (1)
            const finalClientAccepted = updateFields.client_accepted !== undefined ? updateFields.client_accepted : existingRide.client_accepted;
            const finalDriverAccepted = updateFields.driver_accepted !== undefined ? updateFields.driver_accepted : existingRide.driver_accepted;
            const currentStatus = updateFields.ride_status !== undefined ? updateFields.ride_status : existingRide.ride_status;
            if (finalClientAccepted === 1 && finalDriverAccepted === 1 && currentStatus === 0) {
                updateFields.ride_status = 1;
            }

            // OTP start code verification
            if (ride.start_otp !== undefined && ride.start_otp !== '') {
                const finalClientStartConfirmed = updateFields.client_start_confirmed !== undefined ? updateFields.client_start_confirmed : existingRide.client_start_confirmed;
                if (finalClientStartConfirmed !== 1) {
                    return response.send({ success: "0", error: "Customer must confirm readiness to start first" });
                }
                if (String(ride.start_otp) !== String(existingRide.start_otp)) {
                    return response.send({ success: "0", error: "Invalid start code" });
                }
                updateFields.start_otp_verified = 1;
                updateFields.ride_status = 2; // Auto-transition to in_progress
            }

            // Update the ride
            const updatedRide = await RideModel.findByIdAndUpdate(
                ride_id,
                { $set: updateFields },
                { new: true, runValidators: true }
            );

            if (!updatedRide) {
                return response.send({ success: "0", error: "Failed to update ride" });
            }

            // Award client bonus points when a ride is marked as completed (status 3).
            // Only triggered when the status is transitioning TO 3 (not already completed).
            if (
                updateFields.ride_status === 3 &&
                existingRide.ride_status !== 3 &&
                updatedRide.user_id
            ) {
                try {
                    const distanceKm = updatedRide.distance || 0;
                    const earnedPoints = getPointsForDistance(distanceKm);

                    // Upsert: one points record per (user_id, ride_id) so re-saves don't double-award.
                    await ClientPointsModel.findOneAndUpdate(
                        { user_id: updatedRide.user_id, ride_id: updatedRide._id },
                        {
                            $set: {
                                user_id: updatedRide.user_id,
                                ride_id: updatedRide._id,
                                points: earnedPoints,
                                points_active: 1,
                            }
                        },
                        { upsert: true, new: true }
                    );
                } catch (pointsError) {
                    // Points failure must not block the ride update response.
                    console.error("ClientPoints award error:", pointsError);
                }
            }

            response.send({ success: "1", ride: updatedRide });
        } catch (error) {
            console.error("UpdateRide Error:", error);
            response.send({ success: "0", error: error.message });
        }
    });
}