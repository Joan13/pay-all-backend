import PayAll from "../Express.mjs";
import { UserModel } from "../../models/Users.mjs";
import axios from "axios";

export default function UpdateUser() {
    PayAll.post("/payall/API/update_user", async (request, response) => {
        const { user } = request.body;
        try {
            // Validate user_id
            if (!user || !user._id) {
                return response.send({ success: "0", error: "User ID is required" });
            }

            const existingUser = await UserModel.findById(user._id);
            if (!existingUser) {
                return response.send({ success: "0", error: "User not found" });
            }

            const updateFields = { ...user };
            delete updateFields._id;

            // Handle phone numbers: only array format
            if (updateFields.phone_numbers !== undefined) {
                if (Array.isArray(updateFields.phone_numbers)) {
                    // Filter out empty strings and ensure valid phone numbers
                    const validPhones = updateFields.phone_numbers.filter(phone => phone && phone.trim() !== '');
                    updateFields.phone_numbers = validPhones;
                } else {
                    updateFields.phone_numbers = [];
                }
                // Remove phone_number field if it exists
                delete updateFields.phone_number;
            }

            // Handle emails: support both single (backward compatibility) and array format
            if (updateFields.user_emails && Array.isArray(updateFields.user_emails)) {
                // Filter out empty strings and ensure valid emails
                const validEmails = updateFields.user_emails.filter(email => email && email.trim() !== '');
                updateFields.user_emails = validEmails;
                // Also set user_email to the first one for backward compatibility
                if (validEmails.length > 0) {
                    updateFields.user_email = validEmails[0];
                }
            } else if (updateFields.user_email && typeof updateFields.user_email === 'string') {
                // If only user_email is provided (backward compatibility), create array
                if (updateFields.user_email.trim() !== '') {
                    updateFields.user_emails = [updateFields.user_email];
                } else {
                    updateFields.user_emails = [];
                }
            }

            // Check if this update is a request to become a driver
            const isBecomeDriverUpdate = request.body.become_driver === true || updateFields.ask_become_driver === true;

            if (isBecomeDriverUpdate) {
                const mergedUser = {
                    names: updateFields.names !== undefined ? updateFields.names : existingUser.names,
                    gender: updateFields.gender !== undefined ? updateFields.gender : existingUser.gender,
                    city: updateFields.city !== undefined ? updateFields.city : existingUser.city,
                    address: updateFields.address !== undefined ? updateFields.address : existingUser.address,
                    phone_numbers: updateFields.phone_numbers !== undefined ? updateFields.phone_numbers : existingUser.phone_numbers,
                    user_email: updateFields.user_email !== undefined ? updateFields.user_email : existingUser.user_email,
                    car_model: updateFields.car_model !== undefined ? updateFields.car_model : existingUser.car_model,
                    car_condition: updateFields.car_condition !== undefined ? updateFields.car_condition : existingUser.car_condition,
                    license_plate: updateFields.license_plate !== undefined ? updateFields.license_plate : existingUser.license_plate,
                    car_number: updateFields.car_number !== undefined ? updateFields.car_number : existingUser.car_number,
                    insurance_details: updateFields.insurance_details !== undefined ? updateFields.insurance_details : existingUser.insurance_details,
                    insurance_number: updateFields.insurance_number !== undefined ? updateFields.insurance_number : existingUser.insurance_number,
                };

                const missingFields = [];
                if (!mergedUser.names || !mergedUser.names.trim()) missingFields.push("names");
                if (mergedUser.gender === undefined || mergedUser.gender === null) missingFields.push("gender");
                if (!mergedUser.city || !mergedUser.city.trim()) missingFields.push("city");
                if (!mergedUser.address || !mergedUser.address.trim()) missingFields.push("address");
                if (!mergedUser.phone_numbers || !Array.isArray(mergedUser.phone_numbers) || mergedUser.phone_numbers.filter(p => p && p.trim()).length === 0) {
                    missingFields.push("phone_numbers");
                }
                if (!mergedUser.user_email || !mergedUser.user_email.trim()) missingFields.push("user_email");
                if (!mergedUser.car_model || !mergedUser.car_model.trim()) missingFields.push("car_model");
                if (mergedUser.car_condition === undefined || mergedUser.car_condition === null) missingFields.push("car_condition");
                if (!mergedUser.license_plate || !mergedUser.license_plate.trim()) missingFields.push("license_plate");
                if (!mergedUser.car_number || !mergedUser.car_number.trim()) missingFields.push("car_number");
                if (!mergedUser.insurance_details || !mergedUser.insurance_details.trim()) missingFields.push("insurance_details");
                if (!mergedUser.insurance_number || !mergedUser.insurance_number.trim()) missingFields.push("insurance_number");

                if (missingFields.length > 0) {
                    return response.send({ success: "0", error: `Missing required driver information: ${missingFields.join(", ")}` });
                }

                updateFields.ask_become_driver = true;
            }

            // account_type and is_admin are independent fields:
            // account_type: 0 = customer, 1 = driver
            // is_admin: true/false, orthogonal to account_type
            // No cross-sync — save them as-is.

            // Set updatedAt timestamp
            updateFields.updatedAt = new Date().toISOString();

            const updatedUser = await UserModel.findByIdAndUpdate(
                user._id,
                { $set: updateFields },
                { new: true, runValidators: true }
            );

            if (updatedUser) {
                // Trigger push notifications for approval or rejection of driver request
                if (existingUser.ask_become_driver === true && updatedUser.notification_token) {
                    let title = "";
                    let body = "";
                    if (updateFields.account_type === 1) {
                        title = "Driver Request Approved";
                        body = "Congratulations! Your request to become a driver has been approved. / Félicitations ! Votre demande de chauffeur a été approuvée.";
                    } else if (updateFields.ask_become_driver === false && updateFields.account_type !== 1) {
                        title = "Driver Request Rejected";
                        body = "Your request to become a driver has been rejected. / Votre demande de chauffeur a été rejetée.";
                    }

                    if (title && body) {
                        axios.post("https://exp.host/--/api/v2/push/send", {
                            to: updatedUser.notification_token,
                            title: title,
                            body: body,
                            sound: "default",
                            data: { type: "driver_request_status", approved: updateFields.account_type === 1 }
                        }).then(() => {
                            console.log("Push notification sent successfully to token:", updatedUser.notification_token);
                        }).catch((err) => {
                            console.error("Failed to send push notification:", err.message);
                        });
                    }
                }

                response.send({ success: "1", user: updatedUser });
            } else {
                response.send({ success: "0", error: "User not found" });
            }
        } catch (error) {
            console.error("UpdateUser Error:", error);
            response.send({ success: "0", error: error.message });
        }
    });
}
