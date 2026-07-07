import PayAll from "../Express.mjs";
import { RideModel } from "../../models/Rides.mjs";

export default function AddRide() {

    PayAll.post("/payall/API/add_ride", async (request, response) => {
        const { ride } = request.body;
        
        // Validate required fields
        if (!ride.user_id || !ride.start_location || !ride.end_location || !ride.start_time || !ride.city) {
            return response.send({ 
                success: "0", 
                error: "Missing required fields: user_id, start_location, end_location, start_time, or city" 
            });
        }

        try {
            // Prepare ride data with proper defaults
            const rideData = {
                user_id: ride.user_id,
                driver_id: ride.driver_id || null, // Default to null when no driver assigned
                start_location: ride.start_location,
                end_location: ride.end_location,
                stops: Array.isArray(ride.stops) ? ride.stops : [],
                start_time: ride.start_time,
                end_time: ride.end_time || null,
                distance: ride.distance || 0,
                city: ride.city,
                estimated_duration: ride.estimated_duration || 0,
                with_package: ride.with_package !== undefined ? ride.with_package : 0,
                package_weight: ride.package_weight !== undefined ? ride.package_weight : 0,
                package_description: ride.package_description || '',
                carpooling: ride.carpooling !== undefined ? ride.carpooling : 0,
                ride_status: ride.ride_status !== undefined ? ride.ride_status : 0, // Default to 0 (pending)
                ride_type: ride.ride_type !== undefined ? ride.ride_type : 0,
                ride_price: ride.ride_price || 0,
                ride_currency: ride.ride_currency !== undefined ? ride.ride_currency : 0,
                ride_payment_method: ride.ride_payment_method !== undefined ? ride.ride_payment_method : 0,
                ride_payment_status: ride.ride_payment_status !== undefined ? ride.ride_payment_status : 0,
                ride_payment_date: ride.ride_payment_date || null,
                ride_payment_amount: ride.ride_payment_amount || 0,
                ride_payment_currency: ride.ride_payment_currency !== undefined ? ride.ride_payment_currency : 0,
                client_accepted: 0, // User must accept driver's terms/price after driver accepts
                driver_accepted: 0,
                driver_is_there: 0,
                start_otp: Math.floor(1000 + Math.random() * 9000).toString(),
                start_otp_verified: 0
            };

            const newRide = await RideModel.create(rideData);
            response.send({ success: "1", ride: newRide });
        } catch (error) {
            console.error("AddRide Error:", error);
            response.send({ success: "0", error: error.message });
        }
    });
}