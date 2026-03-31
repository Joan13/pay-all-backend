import PayAll from "../Express.mjs";
import { UserModel } from "../../models/Users.mjs";

export default function AddUser() {
    PayAll.post("/payall/API/add_user", async (request, response) => {
        const user = request.body.user;
        try {
            const newUser = new UserModel(user);
            await newUser.save();
            response.send({ success: "1", user: newUser });
        } catch (error) {
            response.send({ success: "0", error: error.message });
        }
    });
}
