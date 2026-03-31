import mongoose from "mongoose";

const StudentSchema = mongoose.Schema(
    {
        username: { type: String, index: true, unique: true, required: true, },
        phone_numbers: { type: String },
        name: { type: String },
        surname: { type: String },
        family_name: { type: String },
        gender: { type: Number },
        birth_date: { type: String },
        country: { type: String },
        user_profile: { type: String },
        user_email: { type: String },
        parents_email: { type: String },
        user_address: { type: String },
        father_name: { type: String },
        mother_name: { type: String },
        birth_place: { type: String },
        parents_civil_state: { type: Number },
        parents_alive: { type: Number },
        father_work: { type: String },
        mother_work: { type: String },
        lives_with: { type: Number },
        user_password: { type: String },
        notification_token: { type: String },
        account_privacy: { type: Number },
        account_valid: { type: Number },
        created_by: { type: mongoose.Schema.Types.ObjectId, index: true }
    },
    {
        versionKey: false,
        timestamps: true
    }
)

export const StudentModel = mongoose.model("students_yambi_class", StudentSchema, 'students');

