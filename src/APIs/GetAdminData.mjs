import PayAll from "../Express.mjs";
import { RideModel } from "../../models/Rides.mjs";
import { UserModel } from "../../models/Users.mjs";

export default function GetAdminData() {
    PayAll.post("/payall/API/get_admin_data", async (request, response) => {
        const { user_id } = request.body;

        // Validate user_id
        if (!user_id) {
            return response.send({ success: "0", error: "user_id is required" });
        }

        try {
            // Check if user is admin
            const userData = await UserModel.findOne({ _id: user_id });
            if (!userData) {
                return response.send({ success: "0", error: "User not found" });
            }

            const isAdmin = userData.account_type === 2 || userData.is_admin === true;
            if (!isAdmin) {
                return response.send({ success: "0", error: "Unauthorized: Admin access required" });
            }

            // Fetch all users
            const users = await UserModel.find({}).sort({ createdAt: -1 });

            // Fetch all rides
            const rides = await RideModel.find({}).sort({ createdAt: -1 });

            // Calculate statistics
            const stats = {
                totalUsers: users.length,
                totalRides: rides.length,
                completedRides: rides.filter(r => r.ride_status === 3).length,
                activeRides: rides.filter(r => r.ride_status === 0 || r.ride_status === 1 || r.ride_status === 2).length,
                cancelledRides: rides.filter(r => r.ride_status === 4).length,
                drivers: users.filter(u => u.account_type === 1).length,
                customers: users.filter(u => u.account_type === 0).length,
                admins: users.filter(u => u.account_type === 2 || u.is_admin === true).length,
            };

            response.send({
                success: "1",
                users: users,
                rides: rides,
                stats: stats
            });
        } catch (error) {
            console.error("GetAdminData Error:", error);
            response.send({ success: "0", error: error.message });
        }
    });
}

