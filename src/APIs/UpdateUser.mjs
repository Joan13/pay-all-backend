import PayAll from "../Express.mjs";
import { UserModel } from "../../models/Users.mjs";

export default function UpdateUser() {
    PayAll.post("/payall/API/update_user", async (request, response) => {
        const { user } = request.body;
        try {
            // Validate user_id
            if (!user || !user._id) {
                return response.send({ success: "0", error: "User ID is required" });
            }

            const updateFields = { ...user };
            delete updateFields._id;

            // Handle phone numbers: only array format
            if (updateFields.phone_numbers && Array.isArray(updateFields.phone_numbers)) {
                // Filter out empty strings and ensure valid phone numbers
                const validPhones = updateFields.phone_numbers.filter(phone => phone && phone.trim() !== '');
                updateFields.phone_numbers = validPhones;
                // Remove phone_number field if it exists
                delete updateFields.phone_number;
            } else {
                // If phone_numbers is not provided or not an array, set to empty array
                updateFields.phone_numbers = [];
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

            // Sync account_type and is_admin
            if (updateFields.account_type !== undefined) {
                // If account_type is 2, ensure is_admin is true
                if (updateFields.account_type === 2) {
                    updateFields.is_admin = true;
                } else if (updateFields.account_type !== 2 && updateFields.is_admin === true) {
                    // If account_type is not 2 but is_admin is true, set account_type to 2
                    updateFields.account_type = 2;
                }
            } else if (updateFields.is_admin !== undefined) {
                // If is_admin is set but account_type is not, sync them
                if (updateFields.is_admin === true) {
                    updateFields.account_type = 2;
                } else if (updateFields.account_type === 2) {
                    // If is_admin is false but account_type is 2, set account_type to 0
                    updateFields.account_type = 0;
                }
            }

            // Set updatedAt timestamp
            updateFields.updatedAt = new Date().toISOString();

            const updatedUser = await UserModel.findByIdAndUpdate(
                user._id,
                { $set: updateFields },
                { new: true, runValidators: true }
            );

            if (updatedUser) {
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
