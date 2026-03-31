import PayAll from "../Express.mjs";
import { UserModel } from "../../models/Users.mjs";

export default function DeleteAccount() {
    PayAll.post("/payall/API/delete_account", async (request, response) => {
        const { user_id, requested_by } = request.body;

        try {
            if (!user_id) {
                return response.send({ success: "0", error: "user_id is required" });
            }

            // If requested_by is provided, ensure it's the same user or an admin
            if (requested_by) {
                const requester = await UserModel.findOne({ _id: requested_by });
                if (!requester) {
                    return response.send({ success: "0", error: "Requester not found" });
                }

                const isAdmin = requester.account_type === 2 || requester.is_admin === true;
                const isOwnAccount = requested_by === user_id;

                if (!isAdmin && !isOwnAccount) {
                    return response.send({ success: "0", error: "Unauthorized: Cannot delete this account" });
                }
            }

            const deleted = await UserModel.findByIdAndDelete(user_id);
            if (deleted) {
                response.send({ success: "1" });
            } else {
                response.send({ success: "0", error: "User not found" });
            }
        } catch (error) {
            console.error("DeleteAccount Error:", error);
            response.send({ success: "0", error: error.message });
        }
    });
}

