import PayAll from "../Express.mjs";
import { UserModel } from "../../models/Users.mjs";

export default function GetUsers() {
    PayAll.post("/payall/API/get_users", async (request, response) => {
        try {
            const users = await UserModel.find({});
            response.send({ success: "1", users });
        } catch (error) {
            response.send({ success: "0", error: error.message });
        }
    });
}
