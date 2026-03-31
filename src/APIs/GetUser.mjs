import PayAll from "../Express.mjs";
import { UserModel } from "../../models/Users.mjs";

export default function GetUser() {
    PayAll.post("/payall/API/get_user", async (request, response) => {
        const { user_id, requested_by } = request.body;

        try {
            // Validate user_id
            if (!user_id) {
                return response.send({ success: "0", error: "user_id is required" });
            }

            // Fetch user by ID
            const user = await UserModel.findOne({ _id: user_id });

            if (!user) {
                return response.send({ success: "0", error: "User not found" });
            }

            // If requested_by is provided, check if requester is admin or requesting their own data
            if (requested_by) {
                const requester = await UserModel.findOne({ _id: requested_by });
                if (!requester) {
                    return response.send({ success: "0", error: "Requester not found" });
                }

                const isAdmin = requester.account_type === 2 || requester.is_admin === true;
                const isOwnProfile = requested_by === user_id;

                // Allow access if admin or own profile
                if (!isAdmin && !isOwnProfile) {
                    return response.send({ success: "0", error: "Unauthorized: Cannot access other user's data" });
                }
            }

            response.send({
                success: "1",
                user: user
            });
        } catch (error) {
            console.error("GetUser Error:", error);
            response.send({ success: "0", error: error.message });
        }
    });
}

