import PayAll from "../Express.mjs";
import { UserModel } from "../../models/Users.mjs";

export default function DeleteUser() {
    PayAll.post("/payall/API/delete_account", async (request, response) => {
        const { user } = request.body;
        try {
            const deleted = await UserModel.findByIdAndDelete(user._id);
            if (deleted) {
                response.send({ success: "1" });
            } else {
                response.send({ success: "0", error: "User not found" });
            }
        } catch (error) {
            response.send({ success: "0", error: error.message });
        }
    });
}
