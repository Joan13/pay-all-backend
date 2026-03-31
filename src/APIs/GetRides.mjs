import PayAll from "../Express.mjs";
import { RideModel } from "../../models/Rides.mjs";
import { UserModel } from "../../models/Users.mjs";

export default function GetRides() {

    PayAll.post("/payall/API/get_rides", async (request, response) => {
        const { user_id, city, available_only, driver_view } = request.body;

        // Validate user_id
        if (!user_id) {
            return response.send({ success: "0", error: "user_id is required" });
        }

        try {
            const userData = await UserModel.findOne({ _id: user_id });
            if (!userData) {
                return response.send({ success: "0", error: "User not found" });
            }

            let rides;
            
            // Check if this is a driver view request (for available rides in city)
            if (driver_view === true && userData.account_type === 1) {
                // Driver wants to see available rides in their city (not their own rides)
                // Build query for available rides
                const query = {};
                
                // Filter by city if provided
                if (city) {
                    query.city = { $regex: new RegExp(city, 'i') }; // Case-insensitive city match
                }
                
                // Filter out completed and cancelled rides when available_only is true
                if (available_only === true) {
                    query.ride_status = { $nin: [3, 4] }; // Exclude status 3 (completed) and 4 (cancelled)
                }
                
                // Get all available rides in the city (not filtered by user_id or driver_id)
                rides = await RideModel.find(query).sort({ createdAt: -1 }); // Sort by newest first
                
                console.log(`Found ${rides.length} available rides in city ${city || 'all'} for driver ${user_id}`);
            } else {
                // Regular history view: Get user's own rides
                // This applies to both regular users AND drivers (drivers are users first)
                if (userData.account_type === 1) { // 1 = driver
                    // For drivers in history: get all rides where they are the user (their own rides as a customer)
                    // OR rides where they are the driver
                    rides = await RideModel.find({ 
                        $or: [
                            { user_id: user_id }, // Rides they created as a user
                            { 
                                $and: [
                                    { driver_id: user_id },
                                    { driver_id: { $ne: '' } }
                                ]
                            } // Rides they accepted as a driver
                        ]
                    }).sort({ createdAt: -1 }); // Sort by newest first
                } else {
                    // For customers (account_type === 0) or admins (account_type === 2): get all their rides
                    // Get all rides where user_id matches (all statuses: pending, accepted, ongoing, completed, cancelled)
                    rides = await RideModel.find({ 
                        user_id: user_id 
                    }).sort({ createdAt: -1 }); // Sort by newest first
                }
                
                console.log(`Found ${rides.length} rides for user ${user_id} (account_type: ${userData.account_type})`);
            }

            // Map rides to include stops properly
            const ridesData = rides.map(ride => ({
                ...ride.toObject(),
                stops: ride.stops || []
            }));

            response.send({ success: "1", rides: ridesData });
        } catch (error) {
            console.error("GetRides Error:", error);
            response.send({ success: "0", error: error.message });
        }
    });
}