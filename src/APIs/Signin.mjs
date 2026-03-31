import PayAll from "../Express.mjs";
import { UserModel } from "../../models/Users.mjs";

export default function Signin() {
    PayAll.post("/payall/API/signin", async (request, response) => {
        const { user_email, names, gender, country, city, state, address, phone_numbers, user_password, profile_picture, account_type, is_admin, car_model, car_condition, license_plate } = request.body;
        try {
            // Check if this is the admin email
            const isAdminEmail = user_email && user_email.toLowerCase() === 'joan.agisha@gmail.com';
            
            let user = await UserModel.findOne({ user_email });
            if (user) {
                // If existing user and it's admin email, ensure they're admin
                if (isAdminEmail && (user.account_type !== 2 || user.is_admin !== true)) {
                    user.account_type = 2;
                    user.is_admin = true;
                    await user.save();
                }
                response.send({ success: "1", user });
            } else {
                const newUserData = {
                    user_email,
                    names,
                    gender,
                    country,
                    city,
                    state,
                    address,
                    phone_numbers: phone_numbers || [],
                    user_password,
                    profile_picture,
                    account_type: isAdminEmail ? 2 : (account_type || 0),
                    is_admin: isAdminEmail ? true : (is_admin || false)
                };
                
                // Add car information if user is a driver
                if (newUserData.account_type === 1) {
                    if (car_model) newUserData.car_model = car_model;
                    if (car_condition !== undefined) newUserData.car_condition = car_condition;
                    if (license_plate) newUserData.license_plate = license_plate;
                }
                
                const newUser = await UserModel.create(newUserData);
                response.send({ success: "1", user: newUser });
            }
        } catch (error) {
            response.send({ success: "0", error: error.message });
        }
    });
}



