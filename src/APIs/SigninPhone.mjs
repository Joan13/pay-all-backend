import PayAll from "../Express.mjs";
import { UserModel } from "../../models/Users.mjs";

export default function SigninPhone() {
    PayAll.post("/payall/API/signin_phone", async (request, response) => {
        const { phone_number } = request.body;

        try {
            if (!phone_number) {
                return response.send({
                    success: "0",
                    error: "Phone number is required"
                });
            }

            // Find user where phone_numbers array contains the phone_number
            let user = await UserModel.findOne({
                phone_numbers: phone_number
            });

            if (user) {
                return response.send({
                    success: "1",
                    user
                });
            }

            // Create new user if not found
            // Format phone number to be safe for email (remove +, spaces, etc.)
            const sanitizedPhone = phone_number.replace(/[^0-9]/g, "");
            const newUserData = {
                names: "Phone User",
                gender: 0,
                country: "",
                city: "Unknown",
                state: "",
                address: "",
                phone_numbers: [phone_number],
                user_email: `${sanitizedPhone}@payall.com`,
                user_password: "",
                profile_picture: "",
                account_type: 0,
                is_admin: false
            };

            const newUser = await UserModel.create(newUserData);

            return response.send({
                success: "1",
                user: newUser
            });

        } catch (error) {
            console.error(error);
            return response.send({
                success: "0",
                error: error.message
            });
        }
    });
}
